const PETAL_COLORS = ['#FF7AA8', '#FF9EC0']

/** A flower that opens as `open` goes from 0 (tight bud) to 1 (full bloom). */
export function Flower({ open, size }: { open: number; size: number }) {
  const o = Math.max(0, Math.min(1, open))
  const petals = 8
  return (
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d="M100 236 V104" stroke="#45B649" strokeWidth="10" strokeLinecap="round" />
      <path d="M100 200 Q66 176 52 188 Q72 214 100 206" fill="#45B649" />
      <path d="M100 176 Q134 152 148 164 Q128 190 100 182" fill="#45B649" />
      <g transform={`translate(100 100) scale(${0.85 + 0.25 * o})`}>
        {/* Green cup holding the bud; it hides behind the petals as they open. */}
        <path d="M-26 6 Q0 34 26 6 Q14 22 0 22 Q-14 22 -26 6 Z" fill="#45B649" opacity={1 - o} />
        {Array.from({ length: petals }, (_, i) => {
          // Closed: petals fanned tightly upwards like a tulip. Open: evenly around the centre.
          const closed = -28 + (56 * i) / (petals - 1)
          const opened = (360 / petals) * i
          const angle = closed + (opened - closed) * o
          return (
            <ellipse
              key={i}
              cx="0"
              cy={-34 - 16 * o}
              rx={18 + 6 * o}
              ry={40 - 2 * o}
              fill={PETAL_COLORS[i % 2]}
              stroke="#fff"
              strokeWidth="3"
              transform={`rotate(${angle})`}
            />
          )
        })}
        <g opacity={o}>
          <circle r="30" fill="#FFD93D" stroke="#fff" strokeWidth="4" />
          <ellipse cx="-10" cy="-4" rx="4" ry="5" fill="#1D3557" />
          <ellipse cx="10" cy="-4" rx="4" ry="5" fill="#1D3557" />
          <path d="M-9 8 Q0 16 9 8" stroke="#1D3557" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="-19" cy="6" rx="5" ry="3" fill="#FF7AA8" opacity="0.6" />
          <ellipse cx="19" cy="6" rx="5" ry="3" fill="#FF7AA8" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}
