import { useEffect, useRef } from 'react'

const COLORS = ['#5AB8F0', '#9B7BEA', '#FF7AA8', '#FF8A5B', '#34C77B', '#FFC94A']

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  spin: number
  kind: 'circle' | 'ribbon' | 'star'
  wobble: number
}

/** Soft confetti shower drawn on a full-screen canvas. Slow, rounded, no flashing. */
export function Confetti({ calm = false }: { calm?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const reduced = calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = reduced ? 30 : 110
    const kinds: Piece['kind'][] = ['circle', 'ribbon', 'star']
    const pieces: Piece[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 60,
      vy: 80 + Math.random() * 120,
      size: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      wobble: Math.random() * Math.PI * 2,
    }))

    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const p of pieces) {
        p.wobble += dt * 3
        p.x += (p.vx + Math.sin(p.wobble) * 30) * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.beginPath()
        if (p.kind === 'circle') ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        else if (p.kind === 'ribbon') ctx.roundRect(-p.size / 2, -p.size / 5, p.size, p.size / 2.5, p.size / 5)
        else {
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? p.size / 1.6 : p.size / 3.6
            const a = -Math.PI / 2 + (i * Math.PI) / 5
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
          }
          ctx.closePath()
        }
        ctx.fill()
        ctx.restore()
      }
      if (pieces.some((p) => p.y < h + 30)) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [calm])

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}
