import { useEffect, useRef } from 'react'
import { ANIMALS, artImage, type ArtId } from '../../art/art'
import { sound } from '../../audio/sound'
import type { Difficulty, Tolerance } from '../../db/db'
import { CanvasLoop, Particles, clamp, dist, easeOut, prefersReducedMotion, type Vec } from '../canvas'
import type { RoundProps } from '../types'

export interface BubbleRound {
  pops: number
  taps: number
  durationMs: number
}

interface LevelConfig {
  /** Bubble radius as a fraction of the board's short side. */
  size: number
  speed: number
  maxBubbles: number
  pops: number
  sway: number
}

const bubbleLevels: Record<Difficulty, LevelConfig> = {
  easy: { size: 0.15, speed: 45, maxBubbles: 3, pops: 6, sway: 14 },
  medium: { size: 0.11, speed: 65, maxBubbles: 5, pops: 10, sway: 22 },
  hard: { size: 0.075, speed: 90, maxBubbles: 7, pops: 14, sway: 34 },
}

const hitScale: Record<Tolerance, number> = { large: 1.35, normal: 1.15, small: 1 }
const TINTS = [200, 280, 330, 40, 160]

interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  phase: number
  hue: number
  animal: ArtId
  born: number
}

interface Freed {
  x: number
  y: number
  r: number
  animal: ArtId
  born: number
}

interface Ripple {
  x: number
  y: number
  born: number
}

class BubbleGame {
  private loop: CanvasLoop
  private bubbles: Bubble[] = []
  private freed: Freed[] = []
  private ripples: Ripple[] = []
  private particles = new Particles()
  private nextSpawn = 0
  private seeded = false
  private decor = Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), r: 3 + Math.random() * 9, speed: 0.01 + Math.random() * 0.02 }))
  private animals: ArtId[]
  private animalIndex = 0
  private calm: boolean
  pops = 0
  taps = 0
  active = false
  finished = false
  private readonly config: LevelConfig
  private readonly hit: number
  private readonly onPop: (pops: number) => void

  constructor(
    canvas: HTMLCanvasElement,
    config: LevelConfig,
    tolerance: Tolerance,
    calm: boolean,
    onPop: (pops: number) => void,
  ) {
    this.config = config
    this.hit = hitScale[tolerance]
    this.calm = calm || prefersReducedMotion()
    this.onPop = onPop
    this.animals = ANIMALS.map((a) => a.id).sort(() => Math.random() - 0.5)
    this.animals.forEach((a) => artImage(a))
    this.loop = new CanvasLoop(canvas, this.draw)
    canvas.addEventListener('pointerdown', this.onDown)
    // Lets automated browser tests find the bubbles (development builds only).
    if (import.meta.env.DEV) Object.assign(window, { __bubbles: () => this.targets() })
  }

  /** Current bubble centres in page coordinates. */
  targets() {
    const rect = this.loop.canvas.getBoundingClientRect()
    const now = performance.now()
    return this.bubbles.map((b) => {
      const p = this.position(b, now)
      return { x: rect.left + p.x, y: rect.top + p.y, r: b.r }
    })
  }

  destroy() {
    this.loop.canvas.removeEventListener('pointerdown', this.onDown)
    this.loop.destroy()
  }

  private get radius() {
    return clamp(Math.min(this.loop.width, this.loop.height) * this.config.size, 34, 140)
  }

  private spawn(now: number, startY?: number) {
    const r = this.radius * (0.9 + Math.random() * 0.2)
    const w = this.loop.width
    // Spread bubbles across the width so they rarely overlap.
    const lanes = Math.max(1, Math.floor(w / (r * 2.4)))
    const y = startY ?? this.loop.height + r
    const used = new Set(this.bubbles.filter((b) => Math.abs(b.y - y) < r * 2.6).map((b) => Math.floor((b.x / w) * lanes)))
    const free = Array.from({ length: lanes }, (_, i) => i).filter((i) => !used.has(i))
    const lane = free.length ? free[Math.floor(Math.random() * free.length)] : Math.floor(Math.random() * lanes)
    const x = ((lane + 0.5) / lanes) * w
    this.bubbles.push({
      x,
      y,
      r,
      speed: this.config.speed * (this.calm ? 0.75 : 1) * (0.85 + Math.random() * 0.3),
      phase: Math.random() * Math.PI * 2,
      hue: TINTS[Math.floor(Math.random() * TINTS.length)],
      animal: this.animals[this.animalIndex++ % this.animals.length],
      born: now,
    })
  }

  private position(b: Bubble, now: number): Vec {
    return { x: b.x + Math.sin(now / 900 + b.phase) * this.config.sway, y: b.y }
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    if (!this.active || this.finished) return
    this.taps++
    const p = this.loop.point(e)
    const now = performance.now()
    // Pop the closest bubble under the finger.
    let best: Bubble | null = null
    let bestD = Infinity
    for (const b of this.bubbles) {
      const d = dist(p, this.position(b, now))
      if (d < b.r * this.hit && d < bestD) {
        best = b
        bestD = d
      }
    }
    if (!best) {
      this.ripples.push({ ...p, born: now })
      return
    }
    const at = this.position(best, now)
    this.bubbles = this.bubbles.filter((b) => b !== best)
    this.freed.push({ ...at, r: best.r, animal: best.animal, born: now })
    this.particles.burst(at.x, at.y, {
      count: this.calm ? 8 : 16,
      colors: [`hsl(${best.hue} 90% 75%)`, '#FFFFFF', '#BDE6FF'],
      speed: best.r * 3,
      size: best.r * 0.12,
      shape: 'dot',
      life: 600,
      gravity: 500,
    })
    sound.pop(this.pops)
    this.pops++
    this.onPop(this.pops)
    if (this.pops >= this.config.pops) this.finished = true
  }

  private draw = (now: number, dt: number) => {
    const { ctx, width, height } = this.loop
    // Start with bubbles already on screen so there is something to pop straight away.
    if (!this.seeded && width > 0) {
      this.seeded = true
      for (let i = 0; i < this.config.maxBubbles; i++) {
        this.spawn(now, height * (0.35 + (0.55 * (i + 0.5)) / this.config.maxBubbles))
      }
      this.nextSpawn = now + 1500
    }
    if (this.active && !this.finished && this.bubbles.length < this.config.maxBubbles && now > this.nextSpawn) {
      this.spawn(now)
      this.nextSpawn = now + 700 + Math.random() * 600
    }

    for (const b of this.bubbles) b.y -= b.speed * dt
    // Bubbles that float off the top simply leave; new ones keep coming.
    this.bubbles = this.bubbles.filter((b) => b.y > -b.r * 1.2)

    // Soft underwater light rays.
    ctx.save()
    ctx.globalAlpha = 0.5
    const g = ctx.createLinearGradient(0, 0, 0, height)
    g.addColorStop(0, '#E8F7FF')
    g.addColorStop(1, '#C9ECFF')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
    // Tiny background bubbles drifting up, just for atmosphere.
    ctx.strokeStyle = 'rgba(90, 184, 240, 0.35)'
    ctx.lineWidth = 2
    for (const d of this.decor) {
      d.y -= d.speed * dt
      if (d.y < -0.05) d.y = 1.05
      ctx.beginPath()
      ctx.arc(d.x * width + Math.sin(now / 1500 + d.r) * 8, d.y * height, d.r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()

    for (const r of this.ripples) this.drawRipple(r, now)
    this.ripples = this.ripples.filter((r) => now - r.born < 500)

    for (const b of this.bubbles) this.drawBubble(b, now)
    for (const f of this.freed) this.drawFreed(f, now)
    this.freed = this.freed.filter((f) => now - f.born < 1100)
    this.particles.draw(ctx, now)
  }

  private drawBubble(b: Bubble, now: number) {
    const ctx = this.loop.ctx
    const { x, y } = this.position(b, now)
    const appear = easeOut((now - b.born) / 400)
    const wobble = this.calm ? 0 : Math.sin(now / 300 + b.phase) * 0.03
    const r = b.r * appear

    const img = artImage(b.animal)
    if (img.complete) {
      ctx.save()
      ctx.globalAlpha = 0.9
      const s = r * 1.25
      ctx.drawImage(img, x - s / 2, y - s / 2, s, s)
      ctx.restore()
    }

    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1 + wobble, 1 - wobble)
    const body = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r)
    body.addColorStop(0, 'rgba(255,255,255,0.05)')
    body.addColorStop(0.75, `hsla(${b.hue}, 90%, 80%, 0.18)`)
    body.addColorStop(1, `hsla(${b.hue}, 95%, 70%, 0.55)`)
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = Math.max(2, r * 0.04)
    ctx.strokeStyle = `hsla(${b.hue}, 80%, 65%, 0.7)`
    ctx.stroke()
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.4, -r * 0.45, r * 0.22, r * 0.12, -0.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(r * 0.45, r * 0.4, r * 0.06, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  private drawFreed(f: Freed, now: number) {
    const img = artImage(f.animal)
    if (!img.complete) return
    const t = (now - f.born) / 1100
    const ctx = this.loop.ctx
    // Hop out of the bubble, then float up and fade.
    const s = f.r * 1.25 * (1 + 0.35 * Math.sin(Math.min(1, t * 2) * Math.PI) + t * 0.2)
    ctx.save()
    ctx.globalAlpha = 1 - clamp((t - 0.55) / 0.45, 0, 1)
    ctx.drawImage(img, f.x - s / 2, f.y - s / 2 - t * f.r * 0.8, s, s)
    ctx.restore()
  }

  private drawRipple(r: Ripple, now: number) {
    const t = (now - r.born) / 500
    const ctx = this.loop.ctx
    ctx.save()
    ctx.strokeStyle = `rgba(90, 184, 240, ${0.5 * (1 - t)})`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(r.x, r.y, 10 + t * 40, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

export function BubblePopRound({ level, settings, active, complete }: RoundProps<BubbleRound>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<BubbleGame | null>(null)
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })

  useEffect(() => {
    const startedAt = Date.now()
    const config = bubbleLevels[level]
    const game = new BubbleGame(canvasRef.current!, config, settings.tolerance, settings.calm, (pops) => {
      if (pops >= config.pops) {
        setTimeout(
          () => completeRef.current({ pops, taps: game.taps, durationMs: Date.now() - startedAt }),
          900,
        )
      }
    })
    gameRef.current = game
    return () => game.destroy()
  }, [level, settings])

  useEffect(() => {
    if (gameRef.current) gameRef.current.active = active
  }, [active])

  return <canvas ref={canvasRef} className="board-canvas" />
}
