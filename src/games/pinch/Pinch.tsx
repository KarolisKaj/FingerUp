import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Art } from '../../art/Art'
import { FRUITS, pick } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import { Burst } from '../../components/Burst'
import type { Difficulty, Tolerance } from '../../db/db'
import type { RoundProps } from '../types'
import { Flower } from './Flower'
import './Pinch.css'

export type PinchMode = 'pinch' | 'spread'

export interface PinchRoundResult {
  mode: PinchMode
  items: number
  /** Two-finger gestures that ended before the goal. */
  retries: number
  durationMs: number
}

interface LevelConfig {
  items: number
  /** Finger distance at success, relative to the start: below this for pinch... */
  pinchTo: number
  /** ...and above this for spread. */
  spreadTo: number
  /** Both fingers must start on the object (otherwise anywhere on the board counts). */
  onTarget: boolean
}

const pinchLevels: Record<Difficulty, LevelConfig> = {
  easy: { items: 3, pinchTo: 0.7, spreadTo: 1.35, onTarget: false },
  medium: { items: 4, pinchTo: 0.55, spreadTo: 1.6, onTarget: false },
  hard: { items: 5, pinchTo: 0.4, spreadTo: 1.9, onTarget: true },
}

const targetScale: Record<Tolerance, number> = { large: 1.9, normal: 1.5, small: 1.2 }

type Pt = { x: number; y: number }

export function PinchRound({ round, level, settings, plan, active, complete }: RoundProps<PinchRoundResult, PinchMode[]>) {
  const mode = plan[round]
  const config = pinchLevels[level]
  const boardRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [fruits] = useState(() => pick(FRUITS, config.items))
  const [item, setItem] = useState(0)
  const [fingers, setFingers] = useState<Pt[]>([])
  const [progress, setProgress] = useState(0)
  const [angle, setAngle] = useState(0)
  const [done, setDone] = useState(false)
  const [gesturing, setGesturing] = useState(false)
  const [showHint, setShowHint] = useState(round === 0 || level === 'easy')

  const pointers = useRef(new Map<number, Pt>())
  const gesture = useRef<{ startDist: number; ticks: number } | null>(null)
  const stats = useRef({ startedAt: 0, retries: 0 })
  const lastHintSpeech = useRef(0)
  const oneFingerTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const el = boardRef.current!
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The hint fades by itself after a few seconds.
  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => setShowHint(false), 3500)
    return () => clearTimeout(t)
  }, [showHint, item])

  useEffect(() => {
    stats.current.startedAt = Date.now()
    return () => clearTimeout(oneFingerTimer.current)
  }, [])

  const objectSize = Math.min(size.w, size.h) * 0.42
  const center = { x: size.w / 2, y: size.h / 2 }

  const local = (e: ReactPointerEvent): Pt => {
    const r = boardRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const twoPoints = () => [...pointers.current.values()].slice(0, 2)

  const succeed = () => {
    setDone(true)
    gesture.current = null
    setGesturing(false)
    if (mode === 'pinch') sound.squish()
    else sound.bloom()
    const next = item + 1
    setTimeout(() => {
      if (next >= config.items) {
        const name = mode === 'pinch' ? 'Squish!' : 'Pretty flowers!'
        complete(
          { mode, items: config.items, retries: stats.current.retries, durationMs: Date.now() - stats.current.startedAt },
          { title: name, speech: name },
        )
      } else {
        setItem(next)
        setDone(false)
        setProgress(0)
      }
    }, 1300)
  }

  const onDown = (e: ReactPointerEvent) => {
    if (!active || done) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, local(e))
    setFingers([...pointers.current.values()])
    clearTimeout(oneFingerTimer.current)

    if (pointers.current.size === 1) {
      // A single finger for a while: show how to use two.
      oneFingerTimer.current = window.setTimeout(() => {
        if (pointers.current.size === 1) {
          setShowHint(true)
          if (Date.now() - lastHintSpeech.current > 6000) {
            lastHintSpeech.current = Date.now()
            speech.say(mode === 'pinch' ? 'Use two fingers. Pinch!' : 'Use two fingers. Open them wide!')
          }
        }
      }, 1200)
    }

    if (pointers.current.size === 2) {
      const [a, b] = twoPoints()
      if (config.onTarget) {
        const reach = (objectSize / 2) * targetScale[settings.tolerance]
        if (Math.hypot(a.x - center.x, a.y - center.y) > reach || Math.hypot(b.x - center.x, b.y - center.y) > reach) return
      }
      gesture.current = { startDist: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), ticks: 0 }
      setGesturing(true)
      setShowHint(false)
    }
  }

  const onMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, local(e))
    setFingers([...pointers.current.values()])
    const g = gesture.current
    if (!g || done) return
    const [a, b] = twoPoints()
    const ratio = Math.hypot(a.x - b.x, a.y - b.y) / g.startDist
    const p =
      mode === 'pinch'
        ? Math.max(0, Math.min(1, (1 - ratio) / (1 - config.pinchTo)))
        : Math.max(0, Math.min(1, (ratio - 1) / (config.spreadTo - 1)))
    setProgress(p)
    setAngle((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI)
    const ticks = Math.floor(p * 3)
    if (ticks > g.ticks && ticks < 3) sound.stretch(ticks)
    g.ticks = Math.max(g.ticks, ticks)
    if (p >= 1) succeed()
  }

  const onUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId)
    setFingers([...pointers.current.values()])
    clearTimeout(oneFingerTimer.current)
    if (gesture.current && !done) {
      if (progress > 0.15) stats.current.retries++
      gesture.current = null
      setGesturing(false)
      setProgress(0)
    }
  }

  const fruit = fruits[item]
  const squash = mode === 'pinch' ? (done ? 1 : progress) : 0

  return (
    <div
      ref={boardRef}
      className="pinch-board"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* How many items are left in this round */}
      <div className="pinch-dots" aria-hidden="true">
        {Array.from({ length: config.items }, (_, i) => (
          <span key={i} className={i < item || (i === item && done) ? 'filled' : ''} />
        ))}
      </div>

      {size.w > 0 && (
        <div
          key={item}
          className={`pinch-object ${gesturing ? 'live' : ''} ${done ? `done-${mode}` : ''}`}
          style={{ left: center.x, top: center.y, width: objectSize, height: objectSize }}
        >
          {mode === 'pinch' ? (
            <div
              className="pinch-fruit"
              style={{
                transform: `rotate(${angle}deg) scale(${1 - 0.45 * squash}, ${1 + 0.18 * squash}) rotate(${-angle}deg)`,
              }}
            >
              <Art id={fruit.id} size="100%" />
            </div>
          ) : (
            <div className="pinch-flower">
              <Flower open={done ? 1 : progress} size={objectSize} />
            </div>
          )}
        </div>
      )}

      {done && mode === 'pinch' && (
        <Burst x={center.x} y={center.y} colors={[fruit.juice, '#FFFFFF', fruit.juice]} count={22} distance={objectSize * 0.75} size={objectSize * 0.13} calm={settings.calm} />
      )}
      {done && mode === 'spread' && (
        <Burst x={center.x} y={center.y - objectSize * 0.1} colors={['#FFC94A', '#FF7AA8', '#9B7BEA']} count={14} distance={objectSize * 0.9} size={objectSize * 0.07} calm={settings.calm} />
      )}

      {/* Where the fingers are, joined by a line that fills with colour as the gesture progresses */}
      {fingers.length === 2 && gesturing && (
        <svg className="pinch-line" width={size.w} height={size.h} aria-hidden="true">
          <line
            x1={fingers[0].x}
            y1={fingers[0].y}
            x2={fingers[1].x}
            y2={fingers[1].y}
            stroke={progress > 0.66 ? '#34C77B' : progress > 0.33 ? '#FFC94A' : '#5AB8F0'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="2 18"
          />
        </svg>
      )}
      {fingers.map((f, i) => (
        <div key={i} className="pinch-finger" style={{ left: f.x, top: f.y }} />
      ))}

      {showHint && !done && size.w > 0 && (
        <div className={`pinch-hint hint-${mode}`} style={{ left: center.x, top: center.y }} aria-hidden="true">
          <span />
          <span />
        </div>
      )}
    </div>
  )
}
