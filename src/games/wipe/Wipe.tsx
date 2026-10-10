import { useEffect, useRef } from 'react'
import { ANIMALS, artImage } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import type { Difficulty, Tolerance } from '../../db/db'
import { CanvasLoop, Particles, clamp, easeOutBack, prefersReducedMotion, type Vec } from '../canvas'
import type { RoundProps } from '../types'

export interface WipeRoundResult {
  animal: string
  durationMs: number
  strokes: number
}

interface LevelConfig {
  /** Brush diameter as a fraction of the board's short side. */
  brush: number
  /** Fraction of the cover to clear before the animal is revealed. */
  reveal: number
}

const wipeLevels: Record<Difficulty, LevelConfig> = {
  easy: { brush: 0.2, reveal: 0.45 },
  medium: { brush: 0.14, reveal: 0.6 },
  hard: { brush: 0.09, reveal: 0.75 },
}

const brushScale: Record<Tolerance, number> = { large: 1.25, normal: 1, small: 0.85 }
const BACKDROPS = ['#FFF1C9', '#DDF5E3', '#E6E0FA', '#FFE0EA', '#D9F0FF']
const SAMPLE = 24

class WipeGame {
  private loop: CanvasLoop
  private cover = document.createElement('canvas')
  private coverCtx = this.cover.getContext('2d', { willReadFrequently: true })!
  private painted = false
  private particles = new Particles()
  private last = new Map<number, Vec>()
  private swish: { set: (v: number) => void; stop: () => void } | null = null
  private lastSample = 0
  private revealedAt: number | null = null
  private calm: boolean
  strokes = 0
  active = false
  private readonly animal: (typeof ANIMALS)[number]
  private readonly backdrop: string
  private readonly config: LevelConfig
  private readonly brushK: number
  private readonly onReveal: () => void

  constructor(
    canvas: HTMLCanvasElement,
    animal: (typeof ANIMALS)[number],
    backdrop: string,
    config: LevelConfig,
    tolerance: Tolerance,
    calm: boolean,
    onReveal: () => void,
  ) {
    this.animal = animal
    this.backdrop = backdrop
    this.config = config
    this.brushK = brushScale[tolerance]
    this.calm = calm || prefersReducedMotion()
    this.onReveal = onReveal
    artImage(animal.id)
    this.loop = new CanvasLoop(canvas, this.draw, (w, h) => this.paintCover(w, h))
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onUp)
  }

  destroy() {
    this.swish?.stop()
    const c = this.loop.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onUp)
    this.loop.destroy()
  }

  /** Frosted "window" with soft clouds; the animal shows through very faintly to spark curiosity. */
  private paintCover(w: number, h: number) {
    // On resize, keep what was already wiped.
    const prev = this.painted ? document.createElement('canvas') : null
    if (prev) {
      prev.width = this.cover.width
      prev.height = this.cover.height
      prev.getContext('2d')!.drawImage(this.cover, 0, 0)
    }
    this.painted = true
    this.cover.width = Math.round(w)
    this.cover.height = Math.round(h)
    const ctx = this.coverCtx
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#B9D9F2')
    g.addColorStop(1, '#D7E6F5')
    ctx.globalAlpha = 0.97
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
    // Puffy clouds
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    for (let i = 0; i < 9; i++) {
      const cx = ((i * 0.37 + 0.1) % 1) * w
      const cy = ((i * 0.61 + 0.15) % 1) * h
      const r = Math.min(w, h) * (0.06 + (i % 3) * 0.025)
      for (const [dx, dy, k] of [[0, 0, 1], [r * 0.9, r * 0.2, 0.75], [-r * 0.9, r * 0.25, 0.7], [r * 0.3, -r * 0.5, 0.7]]) {
        ctx.beginPath()
        ctx.arc(cx + dx, cy + dy, r * k, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // A big friendly question mark so it is clear something is hidden.
    ctx.fillStyle = 'rgba(29, 53, 87, 0.12)'
    ctx.font = `800 ${Math.min(w, h) * 0.42}px ui-rounded, Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', w / 2, h / 2)
    if (prev) {
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(prev, 0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  private get brush() {
    return Math.min(this.loop.width, this.loop.height) * this.config.brush * this.brushK
  }

  private erase(from: Vec, to: Vec) {
    const ctx = this.coverCtx
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineWidth = this.brush
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.restore()
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    if (!this.active || this.revealedAt !== null) return
    this.loop.canvas.setPointerCapture(e.pointerId)
    const p = this.loop.point(e)
    this.last.set(e.pointerId, p)
    this.erase(p, p)
    this.strokes++
    this.swish ??= sound.wipe()
  }

  private onMove = (e: PointerEvent) => {
    const prev = this.last.get(e.pointerId)
    if (!prev || this.revealedAt !== null) return
    const p = this.loop.point(e)
    this.erase(prev, p)
    this.last.set(e.pointerId, p)
    const speed = Math.hypot(p.x - prev.x, p.y - prev.y)
    this.swish?.set(clamp(speed / 30, 0.15, 1))
    if (!this.calm && Math.random() < 0.25) {
      this.particles.burst(p.x, p.y, { count: 2, colors: ['#FFFFFF', '#FFE58A'], speed: 60, size: 6, life: 600, gravity: -40 })
    }
    const now = performance.now()
    if (now - this.lastSample > 200) {
      this.lastSample = now
      if (this.cleared() >= this.config.reveal) this.reveal()
    }
  }

  private onUp = (e: PointerEvent) => {
    this.last.delete(e.pointerId)
    if (this.last.size === 0) {
      this.swish?.set(0)
      if (this.revealedAt === null && this.cleared() >= this.config.reveal) this.reveal()
    }
  }

  /** Fraction of the cover wiped away, sampled on a coarse grid over the middle of the board. */
  private cleared() {
    const { width, height } = this.cover
    const data = this.coverCtx.getImageData(0, 0, width, height).data
    let clear = 0
    let total = 0
    // Only the central area matters: that is where the animal is.
    for (let y = height * 0.1; y < height * 0.9; y += SAMPLE) {
      for (let x = width * 0.15; x < width * 0.85; x += SAMPLE) {
        total++
        if (data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 40) clear++
      }
    }
    return total ? clear / total : 0
  }

  private reveal() {
    this.revealedAt = performance.now()
    this.swish?.stop()
    this.swish = null
    sound.match()
    setTimeout(() => sound.boing(), 250)
    speech.say(`A ${this.animal.name}!`)
    const { width, height } = this.loop
    this.particles.burst(width / 2, height / 2, {
      count: this.calm ? 10 : 26,
      colors: ['#FFC94A', '#FF7AA8', '#5AB8F0', '#9B7BEA'],
      speed: Math.min(width, height) * 0.7,
      size: 14,
      life: 1200,
    })
    setTimeout(() => this.onReveal(), 1800)
  }

  private draw = (now: number) => {
    const { ctx, width, height } = this.loop
    ctx.fillStyle = this.backdrop
    ctx.fillRect(0, 0, width, height)

    // The hidden animal, which jumps for joy once found.
    const img = artImage(this.animal.id)
    if (img.complete) {
      const base = Math.min(width, height) * 0.7
      let s = base
      let lift = 0
      if (this.revealedAt !== null) {
        const t = (now - this.revealedAt) / 1000
        s = base * (0.85 + 0.15 * easeOutBack(t * 2.5))
        lift = this.calm ? 0 : Math.abs(Math.sin(t * Math.PI * 2.2)) * base * 0.08 * Math.max(0, 1 - t / 1.6)
      }
      ctx.drawImage(img, width / 2 - s / 2, height / 2 - s / 2 - lift, s, s)
    }

    if (this.revealedAt === null) {
      ctx.drawImage(this.cover, 0, 0, width, height)
    } else {
      // Remaining frost melts away.
      const t = clamp((now - this.revealedAt) / 500, 0, 1)
      if (t < 1) {
        ctx.save()
        ctx.globalAlpha = 1 - t
        ctx.drawImage(this.cover, 0, 0, width, height)
        ctx.restore()
      }
    }
    this.particles.draw(ctx, now)
  }
}

export function WipeRound({ round, level, settings, plan, active, complete }: RoundProps<WipeRoundResult, (typeof ANIMALS)[number][]>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<WipeGame | null>(null)
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })
  const animal = plan[round]

  useEffect(() => {
    const startedAt = Date.now()
    const game = new WipeGame(
      canvasRef.current!,
      animal,
      BACKDROPS[round % BACKDROPS.length],
      wipeLevels[level],
      settings.tolerance,
      settings.calm,
      () =>
        completeRef.current(
          { animal: animal.id, durationMs: Date.now() - startedAt, strokes: game.strokes },
          { title: `A ${animal.name}!`, art: animal.id, speech: `Peekaboo! A ${animal.name}!` },
        ),
    )
    gameRef.current = game
    return () => game.destroy()
  }, [animal, level, round, settings])

  useEffect(() => {
    if (gameRef.current) gameRef.current.active = active
  }, [active])

  return <canvas ref={canvasRef} className="board-canvas" />
}
