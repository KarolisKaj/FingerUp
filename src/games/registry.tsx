import type { ReactNode } from 'react'

export interface GameInfo {
  id: string
  title: string
  skill: string
  color: string
  icon: ReactNode
  /** Games from the old app that have not been rebuilt yet are listed but locked. */
  ready: boolean
}

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
    {children}
  </svg>
)

export const games: GameInfo[] = [
  {
    id: 'connect-dots',
    title: 'Connect the Dots',
    skill: 'Finger control and straight lines',
    color: '#5AB8F0',
    ready: true,
    icon: svg(
      <>
        <polyline points="22,74 42,30 64,62" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="74" r="10" fill="#34C77B" stroke="#fff" strokeWidth="4" />
        <circle cx="42" cy="30" r="6" fill="#fff" />
        <path d="M78 46l4.5 9.5 10.5 1.2-7.8 7 2.2 10.3L78 69l-9.4 5 2.2-10.3-7.8-7 10.5-1.2z" fill="#FFC94A" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
      </>,
    ),
  },
  {
    id: 'tracing',
    title: "Let's Write",
    skill: 'Tracing letters',
    color: '#9B7BEA',
    ready: false,
    icon: svg(
      <>
        <path d="M28 78 L50 22 L72 78 M37 58 H63" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 14" />
      </>,
    ),
  },
  {
    id: 'pinch-fish',
    title: 'Pinch the Fish',
    skill: 'Pinch grip',
    color: '#FF8A5B',
    ready: false,
    icon: svg(
      <>
        <ellipse cx="46" cy="50" rx="26" ry="18" fill="#fff" />
        <path d="M70 50 L88 36 L88 64 Z" fill="#fff" />
        <circle cx="36" cy="46" r="4" fill="#FF8A5B" />
      </>,
    ),
  },
  {
    id: 'card-match',
    title: 'Dino Cards',
    skill: 'Memory and tapping',
    color: '#34C77B',
    ready: false,
    icon: svg(
      <>
        <rect x="18" y="24" width="30" height="44" rx="6" fill="#fff" transform="rotate(-10 33 46)" />
        <rect x="50" y="30" width="30" height="44" rx="6" fill="#fff" opacity="0.85" transform="rotate(8 65 52)" />
      </>,
    ),
  },
  {
    id: 'sea-match',
    title: 'Sea Match',
    skill: 'Drag and drop',
    color: '#FF7AA8',
    ready: false,
    icon: svg(
      <>
        <circle cx="34" cy="38" r="14" fill="#fff" />
        <rect x="56" y="54" width="26" height="26" rx="6" fill="#fff" opacity="0.85" />
        <path d="M40 60 Q50 70 58 64" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="3 8" />
      </>,
    ),
  },
  {
    id: 'exercise',
    title: 'Move Your Body',
    skill: 'Gross motor exercises',
    color: '#FFB020',
    ready: false,
    icon: svg(
      <>
        <circle cx="50" cy="24" r="9" fill="#fff" />
        <path d="M50 36 V62 M50 62 L38 82 M50 62 L62 82 M26 38 L50 46 L74 38" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>,
    ),
  },
]
