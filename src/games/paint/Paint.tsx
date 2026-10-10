import { useEffect, useRef, useState } from 'react'
import { artImage, type ArtId } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import type { Difficulty } from '../../db/db'
import { CanvasLoop, Particles, prefersReducedMotion, type Vec } from '../canvas'
import type { RoundProps } from '../types'
import './Paint.css'

export interface PaintRoundResult {
  strokes: number
  /** Seconds with at least one finger painting. */
  paintSeconds: number
  /** Share of the page with paint on it, 0-100. */
  coverage: number
  durationMs: number
}

interface LevelConfig {
  /** Brush width as a fraction of the board's short side. */
  brush: number
  /** A faint animal to colour in, for children who are ready for it. */
  picture: boolean
}

const paintLevels: Record<Difficulty, LevelConfig> = {
  easy: { brush: 0.07, picture: false },
  medium: { brush: 0.05, picture: true },
  hard: { brush: 0.03, picture: true },
}

const COLORS = [
  { id: 'rainbow', name: 'Rainbow', color: '' },
  { id: 'red', name: 'Red', color: '#FF5A5F' },
  { id: 'orange', name: 'Orange', color: '#FF9F1C' },
  { id: 'yellow', name: 'Yellow', color: '#FFD23F' },
  { id: 'green', name: 'Green', color: '#3BC14A' },
  { id: 'blue', name: 'Blue', color: '#3A86FF' },
  { id: 'purple', name: 'Purple', color: '#9B5DE5' },
] as const

type ColorId = (typeof COLORS)[number]['id']

class PaintGame {
  private loop: CanvasLoop
  private paper = document.createElement('canvas')
  private paperCtx = this.paper.getContext('2d', { willReadFrequently: true })!
  private particles = new Particles()
  private strokesById = new Map<number, { last: Vec; hue: number; band: number; lastNote: number }>()
  private hue = Math.random() * 360
  private calm: boolean
  private paintingSince: number | null = null
  color: ColorId = 'rainbow'
  strokes = 0
  paintMs = 0
  active = false
  private readonly config: LevelConfig
  private readonly picture: ArtId | null

  constructor(canvas: HTMLCanvasElement, config: LevelConfig, picture: ArtId | null, calm: boolean) {
    this.config = config
    this.picture = picture
    this.calm = calm || prefersReducedMotion()
    if (picture) artImage(picture)
    this.loop = new CanvasLoop(canvas, this.draw, (w, h) => this.resizePaper(w, h))
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onUp)
  }

  destroy() {
    const c = this.loop.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onUp)
    this.loop.destroy()
  }

  private resizePaper(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const old = this.paper.width > 0 && this.strokes > 0 ? this.copyPaper() : null
    this.paper.width = Math.round(w * dpr)
    this.paper.height = Math.round(h * dpr)
    this.paperCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (old) this.paperCtx.drawImage(old, 0, 0, w, h)
  }

  private copyPaper() {
    const c = document.createElement('canvas')
    c.width = this.paper.width
    c.height = this.paper.height
    c.getContext('2d')!.drawImage(this.paper, 0, 0)
    return c
  }

  clear() {
    this.paperCtx.clearRect(0, 0, this.paper.width, this.paper.height)
  }

  private get brush() {
    return Math.max(8, Math.min(this.loop.width, this.loop.height) * this.config.brush)
  }

  private colorFor(hue: number) {
    const fixed = COLORS.find((c) => c.id === this.color)?.color
    return fixed || `hsl(${hue % 360} 90% 60%)`
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    if (!this.active) return
    this.loop.canvas.setPointerCapture(e.pointerId)
    const p = this.loop.point(e)
    // Each finger gets its own colour offset so multi-finger painting makes a rainbow.
    const hue = this.hue + this.strokesById.size * 60
    this.strokesById.set(e.pointerId, { last: p, hue, band: -1, lastNote: 0 })
    this.strokes++
    this.dab(p, p, hue)
    this.note(e.pointerId, p)
    if (this.paintingSince === null) this.paintingSince = performance.now()
  }

  private onMove = (e: PointerEvent) => {
    const s = this.strokesById.get(e.pointerId)
    if (!s) return
    const events = e.getCoalescedEvents?.() ?? []
    for (const ev of events.length ? events : [e]) {
      const p = this.loop.point(ev)
      const d = Math.hypot(p.x - s.last.x, p.y - s.last.y)
      if (d < 1) continue
      s.hue += d * 0.35
      this.dab(s.last, p, s.hue)
      s.last = p
    }
    this.note(e.pointerId, s.last)
    if (!this.calm && Math.random() < 0.08) {
      this.particles.burst(s.last.x, s.last.y, { count: 3, colors: ['#FFFFFF', '#FFE58A', this.colorFor(s.hue)], speed: 90, size: 7, life: 700, gravity: 60 })
    }
  }

  private onUp = (e: PointerEvent) => {
    const s = this.strokesById.get(e.pointerId)
    if (s) this.hue = s.hue + 40
    this.strokesById.delete(e.pointerId)
    if (this.strokesById.size === 0 && this.paintingSince !== null) {
      this.paintMs += performance.now() - this.paintingSince
      this.paintingSince = null
    }
  }

  /** Harp notes: higher on the page plays higher notes, like running a finger over strings. */
  private note(id: number, p: Vec) {
    const s = this.strokesById.get(id)
    if (!s) return
    const band = Math.floor((1 - p.y / this.loop.height) * 10)
    const now = performance.now()
    if (band !== s.band && now - s.lastNote > 90) {
      s.band = band
      s.lastNote = now
      sound.pluck(band)
    }
  }

  private dab(a: Vec, b: Vec, hue: number) {
    const ctx = this.paperCtx
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = this.colorFor(hue)
    ctx.lineWidth = this.brush
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  /** Share of the page with paint, 0-100, from a coarse sample grid. */
  coverage() {
    const { width, height } = this.paper
    const data = this.paperCtx.getImageData(0, 0, width, height).data
    const step = Math.max(8, Math.floor(Math.min(width, height) / 60))
    let painted = 0
    let total = 0
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        total++
        if (data[(y * width + x) * 4 + 3] > 60) painted++
      }
    }
    return total ? (100 * painted) / total : 0
  }

  finish() {
    if (this.paintingSince !== null) this.paintMs += performance.now() - this.paintingSince
    this.paintingSince = null
    this.strokesById.clear()
  }

  sparkle() {
    const { width, height } = this.loop
    for (let i = 0; i < (this.calm ? 3 : 7); i++) {
      this.particles.burst(width * (0.15 + Math.random() * 0.7), height * (0.15 + Math.random() * 0.7), {
        count: 8,
        colors: ['#FFC94A', '#FF7AA8', '#5AB8F0', '#9B7BEA', '#34C77B'],
        speed: 200,
        size: 12,
        life: 1100,
      })
    }
  }

  private draw = (now: number) => {
    const { ctx, width, height } = this.loop
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    if (this.picture) {
      const img = artImage(this.picture)
      if (img.complete) {
        const s = Math.min(width, height) * 0.82
        ctx.save()
        ctx.globalAlpha = 0.32
        ctx.drawImage(img, width / 2 - s / 2, height / 2 - s / 2, s, s)
        ctx.restore()
      }
    }
    ctx.drawImage(this.paper, 0, 0, width, height)
    this.particles.draw(ctx, now)
  }
}

export function PaintRound({ round, level, settings, plan, active, complete }: RoundProps<PaintRoundResult, ArtId[]>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PaintGame | null>(null)
  const startedAt = useRef(0)
  const [color, setColor] = useState<ColorId>('rainbow')
  const config = paintLevels[level]

  useEffect(() => {
    startedAt.current = Date.now()
    const game = new PaintGame(canvasRef.current!, config, config.picture ? plan[round] : null, settings.calm)
    gameRef.current = game
    return () => game.destroy()
  }, [config, plan, round, settings])

  useEffect(() => {
    if (gameRef.current) gameRef.current.active = active
  }, [active])

  const choose = (id: ColorId) => {
    setColor(id)
    if (gameRef.current) gameRef.current.color = id
    sound.tap()
    speech.say(COLORS.find((c) => c.id === id)!.name)
  }

  const done = () => {
    const game = gameRef.current
    if (!game || !active) return
    game.finish()
    game.sparkle()
    complete(
      {
        strokes: game.strokes,
        paintSeconds: game.paintMs / 1000,
        coverage: game.coverage(),
        durationMs: Date.now() - startedAt.current,
      },
      { title: 'Beautiful!', speech: 'What a beautiful picture!' },
    )
  }

  return (
    <>
      <canvas ref={canvasRef} className="board-canvas" />
      <div className="paint-palette" role="radiogroup" aria-label="Colour">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === color}
            aria-label={c.name}
            className={`paint-swatch ${c.id === color ? 'selected' : ''} ${c.id === 'rainbow' ? 'rainbow' : ''}`}
            style={c.color ? { background: c.color } : undefined}
            onClick={() => choose(c.id)}
          />
        ))}
      </div>
      <div className="paint-actions">
        <button
          type="button"
          className="btn btn-round paint-clear"
          aria-label="New paper"
          onClick={() => {
            gameRef.current?.clear()
            sound.flip()
          }}
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M14 3v5h5" />
          </svg>
        </button>
        <button type="button" className="btn btn-primary paint-done" onClick={done} aria-label="Finished">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </button>
      </div>
    </>
  )
}
