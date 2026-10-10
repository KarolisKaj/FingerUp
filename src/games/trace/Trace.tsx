import { useEffect, useRef } from 'react'
import { artImage } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import type { Difficulty, Tolerance } from '../../db/db'
import { CanvasLoop, Particles, dist, prefersReducedMotion, starPath, type Vec } from '../canvas'
import type { RoundProps } from '../types'
import { advance, densify, type TraceShape } from './shapes'

export interface TraceRoundResult {
  shape: string
  durationMs: number
  /** Finger lifted mid-stroke. */
  lifts: number
  /** Mean distance from the centre of the path, as a fraction of the path width. */
  deviation: number
}

/** Path ("road") width as a fraction of the board's short side. */
const roadWidth: Record<Difficulty, number> = { easy: 0.11, medium: 0.09, hard: 0.07 }
const roadScale: Record<Tolerance, number> = { large: 1.2, normal: 1, small: 0.85 }
const INK_COLORS = ['#5AB8F0', '#FF7AA8', '#9B7BEA', '#34C77B']
const STEP = 3

class TraceGame {
  private loop: CanvasLoop
  private size = { w: 0, h: 0 }
  private paths: Vec[][] = []
  private stroke = 0
  private progress = 0
  private pointer: number | null = null
  private particles = new Particles()
  private milestone = 0
  private hintAt = -Infinity
  private finishedAt: number | null = null
  private calm: boolean
  lifts = 0
  private deviations: number[] = []
  active = false
  private readonly shape: TraceShape
  private readonly widthK: number
  private readonly guide: boolean
  private readonly onDone: (deviation: number) => void

  constructor(
    canvas: HTMLCanvasElement,
    shape: TraceShape,
    level: Difficulty,
    tolerance: Tolerance,
    guide: boolean,
    calm: boolean,
    onDone: (deviation: number) => void,
  ) {
    this.shape = shape
    this.widthK = roadWidth[level] * roadScale[tolerance]
    this.guide = guide
    this.calm = calm || prefersReducedMotion()
    this.onDone = onDone
    artImage('ladybug')
    this.loop = new CanvasLoop(canvas, this.draw, (w, h) => this.layout(w, h))
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onUp)
    if (import.meta.env.DEV) Object.assign(window, { __trace: () => this.debugPaths(), __traceState: () => ({ stroke: this.stroke, progress: this.progress, length: this.path.length, road: this.road }) })
  }

  destroy() {
    const c = this.loop.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onUp)
    this.loop.destroy()
  }

  private get road() {
    return Math.max(28, Math.min(this.size.w, this.size.h) * this.widthK)
  }

  /** Fits the shape's box into the board and resamples the paths at screen resolution. */
  private layout(width: number, height: number) {
    this.size = { w: width, h: height }
    const pad = this.road * 0.9
    const availW = width - pad * 2
    const availH = height - pad * 2
    const boxH = Math.min(availH, availW / this.shape.aspect)
    const boxW = boxH * this.shape.aspect
    const ox = (width - boxW) / 2
    const oy = (height - boxH) / 2
    const ratio = this.paths.length ? this.progress / Math.max(1, this.paths[this.stroke].length - 1) : 0
    this.paths = this.shape.strokes.map((s) => densify(s.map(([x, y]) => ({ x: ox + x * boxW, y: oy + y * boxH })), STEP))
    this.progress = Math.round(ratio * (this.paths[this.stroke].length - 1))
  }

  /** Development builds only: lets browser tests trace the real path. */
  private debugPaths() {
    const rect = this.loop.canvas.getBoundingClientRect()
    return this.paths.map((p) => p.filter((_, i) => i % 6 === 0 || i === p.length - 1).map((v) => ({ x: rect.left + v.x, y: rect.top + v.y })))
  }

  private get path() {
    return this.paths[this.stroke]
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    if (!this.active || this.finishedAt !== null || this.pointer !== null) return
    const p = this.loop.point(e)
    // Pick up where the ladybug is waiting.
    if (dist(p, this.path[this.progress]) <= this.road * 1.1) {
      this.pointer = e.pointerId
      this.loop.canvas.setPointerCapture(e.pointerId)
      this.move(p)
    } else if (performance.now() - this.hintAt > 900) {
      this.hintAt = performance.now()
      sound.hint()
    }
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointer) return
    const events = e.getCoalescedEvents?.() ?? []
    for (const ev of events.length ? events : [e]) this.move(this.loop.point(ev))
  }

  private onUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointer) return
    this.pointer = null
    if (this.finishedAt === null && this.progress > 0) this.lifts++
  }

  private move(p: Vec) {
    const path = this.path
    const road = this.road
    const lookahead = Math.ceil((road * 1.6) / STEP)
    const { progress, distance } = advance(path, this.progress, p, road * 0.8, lookahead)
    if (distance < road * 1.5) this.deviations.push(distance / road)
    if (progress > this.progress) {
      this.progress = progress
      const k = Math.floor((8 * progress) / (path.length - 1))
      if (k > this.milestone) {
        this.milestone = k
        sound.step(k + this.stroke * 4)
        if (!this.calm) this.particles.burst(path[progress].x, path[progress].y, { count: 5, colors: ['#FFC94A', '#FFFFFF'], speed: 120, size: 8, life: 600 })
      }
    }
    // Reaching the star's halo is enough: small fingers rarely land on the exact end point.
    if (this.progress >= path.length - 1 - Math.ceil((road * 0.4) / STEP)) this.finishStroke()
  }

  private finishStroke() {
    const end = this.path[this.path.length - 1]
    this.particles.burst(end.x, end.y, { count: this.calm ? 8 : 18, colors: ['#FFC94A', '#FF7AA8', '#5AB8F0'], speed: 260, size: 12, life: 900 })
    sound.match()
    this.pointer = null
    if (this.stroke < this.paths.length - 1) {
      this.stroke++
      this.progress = 0
      this.milestone = 0
      speech.say('Now this one!')
      return
    }
    this.finishedAt = performance.now()
    const deviation = this.deviations.length ? this.deviations.reduce((a, b) => a + b, 0) / this.deviations.length : 0
    setTimeout(() => this.onDone(deviation), 1000)
  }

  private line(points: Vec[], width: number, color: string, dash?: number[]) {
    if (points.length < 2) return
    const ctx = this.loop.ctx
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = width
    ctx.strokeStyle = color
    if (dash) ctx.setLineDash(dash)
    ctx.beginPath()
    points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
    ctx.restore()
  }

  private draw = (now: number) => {
    const { ctx, width, height } = this.loop
    ctx.fillStyle = '#FFFDF7'
    ctx.fillRect(0, 0, width, height)
    if (!this.paths.length) return
    const road = this.road

    // Roads: the whole picture, soft and wide.
    for (const path of this.paths) {
      this.line(path, road + 8, '#E8EEF6')
      this.line(path, road, '#F3F7FC')
    }
    // Centre dashes on what is still to do.
    this.paths.forEach((path, i) => {
      if (i > this.stroke) this.line(path, road * 0.12, '#C9D6E5', [2, road * 0.45])
      if (i === this.stroke && this.finishedAt === null) this.line(path.slice(this.progress), road * 0.12, '#C9D6E5', [2, road * 0.45])
    })
    // Painted trail.
    this.paths.forEach((path, i) => {
      const color = INK_COLORS[i % INK_COLORS.length]
      if (i < this.stroke || this.finishedAt !== null) this.line(path, road * 0.62, color)
      else if (i === this.stroke) this.line(path.slice(0, this.progress + 1), road * 0.62, color)
    })

    if (this.finishedAt === null) {
      const path = this.path
      if (this.guide && this.pointer === null) this.drawChevrons(path, now)
      const end = path[path.length - 1]
      const pulse = this.calm ? 0 : Math.sin(now / 300) * 0.08
      // On closed shapes the star would sit on the ladybug: show it once the trace is underway.
      const closed = dist(path[0], end) < road
      if (!closed || this.progress > path.length * 0.3) this.drawStar(end, road, pulse, now)
      if (this.progress === 0) {
        const start = path[0]
        ctx.save()
        ctx.fillStyle = 'rgba(52, 199, 123, 0.28)'
        ctx.beginPath()
        ctx.arc(start.x, start.y, road * (0.7 + pulse), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    this.drawLadybug(now)
    this.particles.draw(ctx, now)
  }

  private drawStar(end: Vec, road: number, pulse: number, now: number) {
    const ctx = this.loop.ctx
    ctx.save()
    ctx.fillStyle = 'rgba(255, 201, 74, 0.3)'
    ctx.beginPath()
    ctx.arc(end.x, end.y, road * (0.7 + pulse), 0, Math.PI * 2)
    ctx.fill()
    starPath(ctx, end.x, end.y, road * 0.5, road * 0.23, this.calm ? 0 : Math.sin(now / 900) * 0.2)
    ctx.fillStyle = '#FFC94A'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = road * 0.1
    ctx.lineJoin = 'round'
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /** Little arrows ahead of the ladybug pointing the way. */
  private drawChevrons(path: Vec[], now: number) {
    const ctx = this.loop.ctx
    const road = this.road
    const spacing = Math.round((road * 1.1) / STEP)
    const shift = this.calm ? 0 : Math.floor((now / 60) % spacing)
    ctx.save()
    ctx.strokeStyle = 'rgba(29, 53, 87, 0.25)'
    ctx.lineWidth = road * 0.1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = this.progress + spacing + shift, n = 0; i < path.length - spacing && n < 4; i += spacing, n++) {
      const a = path[i - 2]
      const b = path[Math.min(path.length - 1, i + 2)]
      const angle = Math.atan2(b.y - a.y, b.x - a.x)
      const s = road * 0.18
      ctx.save()
      ctx.translate(path[i].x, path[i].y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-s, -s)
      ctx.lineTo(s * 0.4, 0)
      ctx.lineTo(-s, s)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }

  private drawLadybug(now: number) {
    const img = artImage('ladybug')
    if (!img.complete) return
    const ctx = this.loop.ctx
    const path = this.finishedAt !== null ? this.paths[this.paths.length - 1] : this.path
    const at = this.finishedAt !== null ? path[path.length - 1] : path[this.progress]
    const waiting = this.pointer === null && this.finishedAt === null
    const hint = (now - this.hintAt) / 600
    const hop = hint < 1 ? Math.sin(hint * Math.PI * 3) * (1 - hint) * this.road * 0.4 : 0
    const dance = this.finishedAt !== null && !this.calm ? Math.abs(Math.sin((now - this.finishedAt) / 160)) * this.road * 0.3 : 0
    const breathe = waiting && !this.calm ? 1 + Math.sin(now / 350) * 0.06 : 1
    const s = this.road * 1.1 * breathe
    ctx.drawImage(img, at.x - s / 2, at.y - s / 2 - hop - dance, s, s)
  }
}

export function TraceRound({ round, level, settings, plan, active, complete }: RoundProps<TraceRoundResult, TraceShape[]>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<TraceGame | null>(null)
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })
  const shape = plan[round]

  useEffect(() => {
    const startedAt = Date.now()
    const game = new TraceGame(canvasRef.current!, shape, level, settings.tolerance, settings.guide, settings.calm, (deviation) =>
      completeRef.current(
        { shape: shape.id, durationMs: Date.now() - startedAt, lifts: game.lifts, deviation },
        { subtitle: shape.name, speech: `Great job! ${shape.name}!` },
      ),
    )
    gameRef.current = game
    return () => game.destroy()
  }, [shape, level, settings])

  // Say what to draw once the round is live.
  useEffect(() => {
    if (gameRef.current) gameRef.current.active = active
    if (active) speech.say(shape.say, { queue: true })
  }, [active, shape])

  return <canvas ref={canvasRef} className="board-canvas" />
}
