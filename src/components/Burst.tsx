import type { CSSProperties } from 'react'
import './Burst.css'

/** One-shot burst of droplets/sparkles at (x, y), in the parent's coordinates. Remount (new key) to replay. */
export function Burst({
  x,
  y,
  colors,
  count = 14,
  distance = 120,
  size = 16,
  calm = false,
}: {
  x: number
  y: number
  colors: string[]
  count?: number
  distance?: number
  size?: number
  calm?: boolean
}) {
  const n = calm ? Math.ceil(count / 2) : count
  return (
    <div className="burst" style={{ left: x, top: y }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.3
        const d = distance * (0.6 + ((i * 37) % 10) / 20)
        return (
          <span
            key={i}
            style={
              {
                '--dx': `${Math.cos(a) * d}px`,
                '--dy': `${Math.sin(a) * d}px`,
                width: size * (0.6 + (i % 3) * 0.25),
                height: size * (0.6 + (i % 3) * 0.25),
                background: colors[i % colors.length],
                animationDelay: `${(i % 4) * 15}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
