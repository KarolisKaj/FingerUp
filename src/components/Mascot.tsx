import './Mascot.css'

export type MascotMood = 'idle' | 'happy' | 'cheer'

/** "Pip": a round, friendly helper who celebrates with the child. Pure SVG + CSS animation. */
export function Mascot({ mood = 'idle', size = 180 }: { mood?: MascotMood; size?: number }) {
  const cheering = mood === 'cheer'
  return (
    <svg className={`mascot mascot-${mood}`} width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="pip-body" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#8FE0FF" />
          <stop offset="0.6" stopColor="#4FB3F0" />
          <stop offset="1" stopColor="#3A8FD8" />
        </radialGradient>
      </defs>

      <ellipse className="mascot-shadow" cx="100" cy="188" rx="52" ry="8" fill="rgba(29,53,87,0.15)" />

      <g className="mascot-body">
        {/* Antenna with a little star */}
        <path d="M100 52 Q104 30 116 20" stroke="#3A8FD8" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path
          className="mascot-antenna-star"
          d="M118 6 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z"
          fill="#FFC94A"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Arms: raised when cheering */}
        <g className="mascot-arm mascot-arm-left">
          <path d={cheering ? 'M50 110 Q26 86 22 62' : 'M50 118 Q30 128 26 146'} stroke="#3A8FD8" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>
        <g className="mascot-arm mascot-arm-right">
          <path d={cheering ? 'M150 110 Q174 86 178 62' : 'M150 118 Q170 128 174 146'} stroke="#3A8FD8" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>

        {/* Feet */}
        <ellipse cx="76" cy="176" rx="18" ry="10" fill="#3A8FD8" />
        <ellipse cx="124" cy="176" rx="18" ry="10" fill="#3A8FD8" />

        {/* Body */}
        <circle cx="100" cy="112" r="64" fill="url(#pip-body)" />
        <ellipse cx="78" cy="78" rx="18" ry="10" fill="#fff" opacity="0.35" transform="rotate(-25 78 78)" />

        {/* Face */}
        <g className="mascot-eyes">
          {mood === 'idle' ? (
            <>
              <ellipse cx="78" cy="106" rx="11" ry="14" fill="#1D3557" />
              <ellipse cx="122" cy="106" rx="11" ry="14" fill="#1D3557" />
              <circle cx="82" cy="100" r="4.5" fill="#fff" />
              <circle cx="126" cy="100" r="4.5" fill="#fff" />
            </>
          ) : (
            // Happy closed "smiling" eyes
            <>
              <path d="M66 108 Q78 94 90 108" stroke="#1D3557" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M110 108 Q122 94 134 108" stroke="#1D3557" strokeWidth="7" fill="none" strokeLinecap="round" />
            </>
          )}
        </g>
        <ellipse cx="62" cy="128" rx="10" ry="6" fill="#FF7AA8" opacity="0.55" />
        <ellipse cx="138" cy="128" rx="10" ry="6" fill="#FF7AA8" opacity="0.55" />
        {mood === 'idle' ? (
          <path d="M86 130 Q100 142 114 130" stroke="#1D3557" strokeWidth="6" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M80 126 Q100 156 120 126 Z" fill="#1D3557" stroke="#1D3557" strokeWidth="4" strokeLinejoin="round" />
        )}
      </g>
    </svg>
  )
}
