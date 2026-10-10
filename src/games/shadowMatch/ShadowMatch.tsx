import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Art } from '../../art/Art'
import type { ArtId } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import { Burst } from '../../components/Burst'
import type { Tolerance } from '../../db/db'
import type { RoundProps } from '../types'
import './ShadowMatch.css'

export interface ShadowRoundResult {
  items: number
  wrongDrops: number
  durationMs: number
}

const snapScale: Record<Tolerance, number> = { large: 0.8, normal: 0.6, small: 0.45 }

export interface RoundPlan {
  animals: { id: ArtId; name: string }[]
  /** Order of the shadows (top) and of the animals in the tray (bottom). */
  shadowOrder: number[]
  trayOrder: number[]
}

type Pt = { x: number; y: number }

export function ShadowMatchRound({ round, level, settings, plan, active, complete }: RoundProps<ShadowRoundResult, RoundPlan[]>) {
  const { animals, shadowOrder, trayOrder } = plan[round]
  const n = animals.length
  const boardRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [placed, setPlaced] = useState<boolean[]>(() => animals.map(() => false))
  const [drag, setDrag] = useState<{ index: number; pointer: number; at: Pt; offset: Pt } | null>(null)
  const [justPlaced, setJustPlaced] = useState<number | null>(null)
  const stats = useRef({ startedAt: 0, wrongDrops: 0 })

  useEffect(() => {
    stats.current.startedAt = Date.now()
    const el = boardRef.current!
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const itemSize = Math.min((size.w / (n + 0.6)) * 0.85, size.h * 0.34)
  const slotX = (slot: number) => (size.w * (slot + 1)) / (n + 1)
  const shadowPos = (i: number): Pt => ({ x: slotX(shadowOrder.indexOf(i)), y: size.h * 0.3 })
  const homePos = (i: number): Pt => ({ x: slotX(trayOrder.indexOf(i)), y: size.h * 0.74 })

  const local = (e: ReactPointerEvent): Pt => {
    const r = boardRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onDown = (i: number) => (e: ReactPointerEvent) => {
    if (!active || placed[i] || drag) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = local(e)
    const home = homePos(i)
    setDrag({ index: i, pointer: e.pointerId, at: p, offset: { x: home.x - p.x, y: home.y - p.y } })
    sound.tap()
    speech.say(animals[i].name)
  }

  const onMove = (e: ReactPointerEvent) => {
    if (!drag || e.pointerId !== drag.pointer) return
    setDrag({ ...drag, at: local(e) })
  }

  const onUp = (e: ReactPointerEvent) => {
    if (!drag || e.pointerId !== drag.pointer) return
    const i = drag.index
    const p = local(e)
    const centre = { x: p.x + drag.offset.x, y: p.y + drag.offset.y }
    const target = shadowPos(i)
    setDrag(null)
    if (Math.hypot(centre.x - target.x, centre.y - target.y) < itemSize * snapScale[settings.tolerance]) {
      const next = placed.map((v, k) => v || k === i)
      setPlaced(next)
      setJustPlaced(i)
      sound.place()
      sound.match()
      if (next.every(Boolean)) {
        setTimeout(
          () =>
            complete(
              { items: n, wrongDrops: stats.current.wrongDrops, durationMs: Date.now() - stats.current.startedAt },
              { title: 'All home!', speech: 'Everyone found their shadow!' },
            ),
          1000,
        )
      }
      return
    }
    // Dropped on a different shadow: count it, then glide home. No "wrong" sound, just a soft slide.
    const onOther = animals.some((_, k) => k !== i && !placed[k] && Math.hypot(centre.x - shadowPos(k).x, centre.y - shadowPos(k).y) < itemSize * 0.5)
    if (onOther) stats.current.wrongDrops++
    sound.slideBack()
  }

  const near =
    drag &&
    (() => {
      const c = { x: drag.at.x + drag.offset.x, y: drag.at.y + drag.offset.y }
      const t = shadowPos(drag.index)
      return Math.hypot(c.x - t.x, c.y - t.y) < itemSize * 0.9
    })()

  return (
    <div ref={boardRef} className="shadow-board" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {size.w > 0 && (
        <>
          <div className="shadow-shelf" style={{ top: size.h * 0.3 + itemSize * 0.52 }} />
          {animals.map((a, i) => {
            const s = shadowPos(i)
            const glow = drag?.index === i && (near || level === 'easy')
            return (
              <div
                key={`shadow-${a.id}-${i}`}
                data-animal={a.id}
                className={`shadow-slot ${glow ? 'glow' : ''} ${placed[i] ? 'filled' : ''}`}
                style={{ left: s.x, top: s.y, width: itemSize, height: itemSize }}
              >
                <Art id={a.id} size="100%" className="shadow-art" />
              </div>
            )
          })}

          {animals.map((a, i) => {
            const isDragging = drag?.index === i
            const pos = placed[i]
              ? shadowPos(i)
              : isDragging
                ? { x: drag.at.x + drag.offset.x, y: drag.at.y + drag.offset.y }
                : homePos(i)
            return (
              <div
                key={`piece-${a.id}-${i}`}
                data-animal={a.id}
                className={`shadow-piece ${isDragging ? 'dragging' : ''} ${placed[i] ? 'placed' : ''} ${justPlaced === i ? 'just-placed' : ''}`}
                style={{
                  width: itemSize,
                  height: itemSize,
                  transform: `translate(${pos.x - itemSize / 2}px, ${pos.y - itemSize / 2}px)`,
                }}
                onPointerDown={onDown(i)}
              >
                <Art id={a.id} size="100%" />
              </div>
            )
          })}

          {justPlaced !== null && (
            <Burst
              key={justPlaced}
              x={shadowPos(justPlaced).x}
              y={shadowPos(justPlaced).y}
              colors={['#FFC94A', '#FF7AA8', '#5AB8F0']}
              count={14}
              distance={itemSize * 0.8}
              size={itemSize * 0.08}
              calm={settings.calm}
            />
          )}
        </>
      )}
    </div>
  )
}
