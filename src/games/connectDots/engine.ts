import type { Tolerance } from '../../db/db'
import { distance, pathDeviation, segmentsOf, type DotShape, type Point, type Segment } from './shapes'

type Vec = { x: number; y: number }

export interface SegmentResult {
  durationMs: number
  /** Mean distance from the ideal line, as a fraction of dot spacing. */
  deviation: number
}

export interface EngineEvents {
  onStep(index: number, result: SegmentResult): void
  onMiss(): void
  onHint(): void
  onShapeComplete(): void
}

export interface EngineOptions {
  tolerance: Tolerance
  guide: boolean
  calm: boolean
}

const toleranceScale: Record<Tolerance, number> = { large: 2.6, normal: 1.9, small: 1.4 }

const LINE_COLORS = ['#5AB8F0', '#9B7BEA', '#FF7AA8', '#FF8A5B', '#34C77B', '#FFB020']
const START_COLOR = '#34C77B'
const TARGET_COLOR = '#FFC94A'
const GRID_DOT = '#C5D5E6'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
  color: string
  spin: number
}

interface DrawnSegment {
  from: Vec
  to: Vec
  color: string
  born: number
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)

/**
 * Imperative canvas game loop for one shape at a time. React owns screens and overlays;
 * this owns pixels and pointers so dragging stays smooth on low-end tablets.
 */
export class ConnectDotsEngine {
  private ctx: CanvasRenderingContext2D
  private shape: DotShape | null = null
  private segments: Segment[] = []
  private current = 0
  private done: DrawnSegment[] = []
  private particles: Particle[] = []

  private pointerId: number | null = null
  private trail: Vec[] = []
  private segmentStartedAt = 0
  private fadingTrail: { points: Vec[]; color: string; born: number } | null = null
  private hintAt = -Infinity
  private completedAt: number | null = null
  private paused = false

  private width = 0
  private height = 0
  private origin: Vec = { x: 0, y: 0 }
  private spacing = 0
  private dotRadius = 0
  private hitRadius = 0

  private frame = 0
  private resizeObserver: ResizeObserver
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private readonly canvas: HTMLCanvasElement
  private readonly options: EngineOptions
  private readonly events: EngineEvents

  constructor(canvas: HTMLCanvasElement, options: EngineOptions, events: EngineEvents) {
    this.canvas = canvas
    this.options = options
    this.events = events
    this.ctx = canvas.getContext('2d')!
    this.resizeObserver = new ResizeObserver(() => this.layout())
    this.resizeObserver.observe(canvas)
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onUp)
    this.layout()
    this.frame = requestAnimationFrame(this.render)
  }

  destroy() {
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onUp)
  }

  load(shape: DotShape) {
    this.shape = shape
    this.segments = segmentsOf(shape)
    this.current = 0
    this.done = []
    this.trail = []
    this.pointerId = null
    this.fadingTrail = null
    this.completedAt = null
    this.layout()
  }

  /** Ignore touches while an overlay is showing. */
  setPaused(paused: boolean) {
    this.paused = paused
    if (paused) this.cancelDrag()
  }

  private get calm() {
    return this.options.calm || this.reducedMotion
  }

  // ---------- layout ----------

  private layout() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    this.width = rect.width
    this.height = rect.height
    this.canvas.width = Math.round(rect.width * dpr)
    this.canvas.height = Math.round(rect.height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const n = this.shape?.size ?? 3
    const side = Math.min(rect.width, rect.height)
    const pad = Math.max(48, side * 0.12)
    const board = side - pad * 2
    this.spacing = board / (n - 1)
    this.origin = { x: (rect.width - board) / 2, y: (rect.height - board) / 2 }
    this.dotRadius = Math.max(14, Math.min(36, this.spacing * 0.15))
    this.hitRadius = Math.min(this.dotRadius * toleranceScale[this.options.tolerance], this.spacing * 0.48)
  }

  private pos([x, y]: Point): Vec {
    return { x: this.origin.x + x * this.spacing, y: this.origin.y + y * this.spacing }
  }

  private local(e: PointerEvent): Vec {
    const rect = this.canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // ---------- input ----------

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    const segment = this.segments[this.current]
    // One finger at a time: extra fingers and resting palms are ignored.
    if (this.paused || !segment || this.pointerId !== null || this.completedAt !== null) return

    const p = this.local(e)
    const start = this.pos(segment.from)
    if (distance(p, start) <= this.hitRadius) {
      this.pointerId = e.pointerId
      this.canvas.setPointerCapture(e.pointerId)
      this.trail = [start, p]
      this.segmentStartedAt = performance.now()
      this.checkTarget(p)
    } else if (performance.now() - this.hintAt > 700) {
      this.hintAt = performance.now()
      this.events.onHint()
    }
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    const events = e.getCoalescedEvents?.() ?? [e]
    for (const ev of events.length ? events : [e]) {
      const p = this.local(ev)
      const last = this.trail[this.trail.length - 1]
      if (!last || distance(p, last) > 1.5) this.trail.push(p)
      if (this.checkTarget(p)) return
    }
  }

  private onUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    const segment = this.segments[this.current]
    const start = segment ? this.pos(segment.from) : null
    // Lifting after only a tap on the start dot is not a miss.
    const wandered = start && this.trail.some((p) => distance(p, start) > this.hitRadius)
    if (wandered) {
      this.fadingTrail = { points: this.trail, color: this.colorFor(this.current), born: performance.now() }
      this.events.onMiss()
    }
    this.cancelDrag()
  }

  private cancelDrag() {
    if (this.pointerId !== null && this.canvas.hasPointerCapture(this.pointerId)) {
      this.canvas.releasePointerCapture(this.pointerId)
    }
    this.pointerId = null
    this.trail = []
  }

  private checkTarget(p: Vec): boolean {
    const segment = this.segments[this.current]
    if (!segment) return false
    const from = this.pos(segment.from)
    const to = this.pos(segment.to)
    if (distance(p, to) > this.hitRadius) return false

    const now = performance.now()
    const result: SegmentResult = {
      durationMs: now - this.segmentStartedAt,
      deviation: pathDeviation(this.trail.slice(1), from, to, this.spacing),
    }
    this.done.push({ from, to, color: this.colorFor(this.current), born: now })
    this.burst(to, this.colorFor(this.current))
    const index = this.current
    this.current++
    this.events.onStep(index, result)

    const next = this.segments[this.current]
    if (!next) {
      this.cancelDrag()
      this.completedAt = now
      setTimeout(() => this.events.onShapeComplete(), 900)
    } else if (next.continues) {
      // Keep drawing in one stroke: the next segment starts right here.
      this.trail = [to, p]
      this.segmentStartedAt = now
    } else {
      this.cancelDrag()
    }
    return true
  }

  private colorFor(index: number) {
    return LINE_COLORS[index % LINE_COLORS.length]
  }

  private burst(at: Vec, color: string) {
    const count = this.calm ? 6 : 16
    const now = performance.now()
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const speed = (this.calm ? 0.08 : 0.16) + Math.random() * 0.12
      this.particles.push({
        x: at.x,
        y: at.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: now,
        life: 700 + Math.random() * 400,
        size: this.dotRadius * (0.35 + Math.random() * 0.3),
        color: i % 3 === 0 ? TARGET_COLOR : color,
        spin: (Math.random() - 0.5) * 0.01,
      })
    }
  }

  // ---------- drawing ----------

  private render = (now: number) => {
    this.frame = requestAnimationFrame(this.render)
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    if (!this.shape) return

    this.drawGrid()
    if (this.options.guide && this.completedAt === null) this.drawGuide(now)
    this.drawDone(now)
    this.drawFadingTrail(now)
    this.drawTrail()
    if (this.completedAt === null) this.drawStartAndTarget(now)
    this.drawParticles(now)
  }

  private drawGrid() {
    const ctx = this.ctx
    const n = this.shape!.size
    ctx.fillStyle = GRID_DOT
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        const p = this.pos([x, y])
        ctx.beginPath()
        ctx.arc(p.x, p.y, this.dotRadius * 0.42, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawGuide(now: number) {
    const ctx = this.ctx
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // Whole picture, faint, so the child sees what they are making.
    ctx.strokeStyle = 'rgba(29, 53, 87, 0.10)'
    ctx.lineWidth = this.dotRadius * 0.5
    for (const stroke of this.shape!.strokes) {
      ctx.beginPath()
      stroke.forEach((pt, i) => {
        const p = this.pos(pt)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
    }
    // Current step: marching dashes pointing the way.
    const segment = this.segments[this.current]
    if (segment && this.pointerId === null) {
      const a = this.pos(segment.from)
      const b = this.pos(segment.to)
      ctx.strokeStyle = 'rgba(29, 53, 87, 0.28)'
      ctx.lineWidth = this.dotRadius * 0.3
      ctx.setLineDash([2, this.dotRadius * 0.9])
      ctx.lineDashOffset = this.calm ? 0 : -now / 40
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawDone(now: number) {
    const ctx = this.ctx
    const glow = this.completedAt !== null ? (now - this.completedAt) / 900 : -1
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineWidth = this.dotRadius * 0.62
    for (const [i, s] of this.done.entries()) {
      const t = easeOut((now - s.born) / 220)
      const end = { x: s.from.x + (s.to.x - s.from.x) * t, y: s.from.y + (s.to.y - s.from.y) * t }
      // Finished picture: a soft glow ripples through the lines in drawing order.
      const wave = glow >= 0 && !this.calm ? Math.max(0, Math.sin((glow * 2 - i / this.done.length) * Math.PI)) : 0
      ctx.shadowColor = s.color
      ctx.shadowBlur = wave * 24
      ctx.strokeStyle = s.color
      ctx.beginPath()
      ctx.moveTo(s.from.x, s.from.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    ctx.fillStyle = '#FFFFFF'
    for (const s of this.done) {
      for (const p of [s.from, s.to]) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, this.dotRadius * 0.22, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  private strokePath(points: Vec[]) {
    const ctx = this.ctx
    ctx.beginPath()
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.stroke()
  }

  private drawTrail() {
    if (this.trail.length < 2) return
    const ctx = this.ctx
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = this.colorFor(this.current)
    ctx.globalAlpha = 0.85
    ctx.lineWidth = this.dotRadius * 0.62
    this.strokePath(this.trail)
    ctx.restore()
  }

  private drawFadingTrail(now: number) {
    if (!this.fadingTrail) return
    const t = (now - this.fadingTrail.born) / 400
    if (t >= 1) {
      this.fadingTrail = null
      return
    }
    const ctx = this.ctx
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = this.fadingTrail.color
    ctx.globalAlpha = 0.5 * (1 - t)
    ctx.lineWidth = this.dotRadius * 0.62 * (1 - t * 0.5)
    this.strokePath(this.fadingTrail.points)
    ctx.restore()
  }

  private drawStartAndTarget(now: number) {
    const segment = this.segments[this.current]
    if (!segment) return
    const ctx = this.ctx
    const start = this.pos(segment.from)
    const target = this.pos(segment.to)
    const r = this.dotRadius
    const pulse = this.calm ? 0.5 : (Math.sin(now / 320) + 1) / 2
    const dragging = this.pointerId !== null

    // Target star with a warm halo.
    ctx.save()
    ctx.fillStyle = 'rgba(255, 201, 74, 0.28)'
    ctx.beginPath()
    ctx.arc(target.x, target.y, r * (1.5 + pulse * 0.25), 0, Math.PI * 2)
    ctx.fill()
    ctx.translate(target.x, target.y)
    if (!this.calm) ctx.rotate(Math.sin(now / 900) * 0.15)
    this.star(r * 1.25, r * 0.55)
    ctx.fillStyle = TARGET_COLOR
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = r * 0.22
    ctx.lineJoin = 'round'
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    if (dragging) return

    // Start dot: breathing halo, plus a hop when the child touches somewhere else.
    const hint = (now - this.hintAt) / 600
    const hop = hint < 1 ? Math.sin(hint * Math.PI * 3) * (1 - hint) * r * 0.6 : 0
    ctx.save()
    ctx.fillStyle = 'rgba(52, 199, 123, 0.25)'
    ctx.beginPath()
    ctx.arc(start.x, start.y - hop, r * (1.45 + pulse * 0.35), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = START_COLOR
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = r * 0.22
    ctx.beginPath()
    ctx.arc(start.x, start.y - hop, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  private star(outer: number, inner: number) {
    const ctx = this.ctx
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outer : inner
      const angle = -Math.PI / 2 + (i * Math.PI) / 5
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    ctx.closePath()
  }

  private drawParticles(now: number) {
    const ctx = this.ctx
    this.particles = this.particles.filter((p) => now - p.born < p.life)
    for (const p of this.particles) {
      const age = now - p.born
      const t = age / p.life
      ctx.save()
      ctx.globalAlpha = 1 - t
      ctx.translate(p.x + p.vx * age, p.y + p.vy * age + 0.00008 * age * age)
      ctx.rotate(p.spin * age)
      this.star(p.size, p.size * 0.45)
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.restore()
    }
  }
}
