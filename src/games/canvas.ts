/** Shared plumbing for canvas games: sizing for sharp rendering, an animation loop and helpers. */

export type Vec = { x: number; y: number }

export class CanvasLoop {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  width = 0
  height = 0
  private frame = 0
  private last = 0
  private observer: ResizeObserver
  private readonly draw: (now: number, dt: number) => void
  private readonly onResize?: (width: number, height: number) => void

  constructor(
    canvas: HTMLCanvasElement,
    draw: (now: number, dt: number) => void,
    onResize?: (width: number, height: number) => void,
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.draw = draw
    this.onResize = onResize
    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(canvas)
    this.resize()
    this.frame = requestAnimationFrame(this.tick)
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    this.width = rect.width
    this.height = rect.height
    this.canvas.width = Math.round(rect.width * dpr)
    this.canvas.height = Math.round(rect.height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.onResize?.(rect.width, rect.height)
  }

  private tick = (now: number) => {
    this.frame = requestAnimationFrame(this.tick)
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
    this.last = now
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.draw(now, dt)
  }

  /** Pointer position in canvas CSS pixels. */
  point(e: { clientX: number; clientY: number }): Vec {
    const rect = this.canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  destroy() {
    cancelAnimationFrame(this.frame)
    this.observer.disconnect()
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
export const easeOutBack = (t: number) => {
  const c = 1.7
  const x = clamp(t, 0, 1) - 1
  return 1 + (c + 1) * x * x * x + c * x * x
}
export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)

export function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, outer: number, inner: number, rotation = 0) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = rotation - Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
  }
  ctx.closePath()
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
  color: string
  spin: number
  shape: 'star' | 'dot'
  gravity: number
}

/** Small reusable particle system: stars and droplets that drift, fall and fade. */
export class Particles {
  private items: Particle[] = []

  burst(
    x: number,
    y: number,
    { count = 14, colors = ['#FFC94A'], speed = 220, size = 10, life = 800, shape = 'star' as Particle['shape'], gravity = 300 } = {},
  ) {
    const now = performance.now()
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const v = speed * (0.5 + Math.random() * 0.7)
      this.items.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        born: now,
        life: life * (0.7 + Math.random() * 0.6),
        size: size * (0.6 + Math.random() * 0.7),
        color: colors[i % colors.length],
        spin: (Math.random() - 0.5) * 6,
        shape,
        gravity,
      })
    }
  }

  draw(ctx: CanvasRenderingContext2D, now: number) {
    this.items = this.items.filter((p) => now - p.born < p.life)
    for (const p of this.items) {
      const t = (now - p.born) / 1000
      const k = (now - p.born) / p.life
      const x = p.x + p.vx * t
      const y = p.y + p.vy * t + 0.5 * p.gravity * t * t
      ctx.save()
      ctx.globalAlpha = 1 - k * k
      ctx.fillStyle = p.color
      if (p.shape === 'star') {
        starPath(ctx, x, y, p.size, p.size * 0.45, p.spin * t)
      } else {
        ctx.beginPath()
        ctx.arc(x, y, p.size * (1 - k * 0.4), 0, Math.PI * 2)
      }
      ctx.fill()
      ctx.restore()
    }
  }
}
