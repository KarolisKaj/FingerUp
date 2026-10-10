import { sum, type GameInfo } from '../types'
import { ConnectDotsRound } from './ConnectDots'
import { lineControl, secondsPerLine, type RoundResult } from './results'
import { pickShapes, type DotShape } from './shapes'

export const connectDots: GameInfo<RoundResult, DotShape[]> = {
  id: 'connect-dots',
  title: 'Connect the Dots',
  skill: 'Finger control and straight lines (about 3+ years)',
  color: '#5AB8F0',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <polyline points="22,74 42,30 64,62" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="74" r="10" fill="#34C77B" stroke="#fff" strokeWidth="4" />
      <circle cx="42" cy="30" r="6" fill="#fff" />
      <path d="M78 46l4.5 9.5 10.5 1.2-7.8 7 2.2 10.3L78 69l-9.4 5 2.2-10.3-7.8-7 10.5-1.2z" fill="#FFC94A" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  ),
  intro: {
    text: (
      <>
        Slide your finger from the <span className="chip chip-green">green dot</span> to the{' '}
        <span className="chip chip-star">star</span>.
      </>
    ),
    speech: 'Put your finger on the green dot, and slide it to the star.',
  },
  levels: {
    easy: '3×3 dots: lines, ticks, simple shapes',
    medium: '4×4 dots: letters, stairs, zigzags',
    hard: '5×5 dots: house, star, fish, heart',
  },
  Round: ConnectDotsRound,
  plan: (level, rounds) => pickShapes(level, rounds),
  metrics: [
    { label: 'Misses', hint: 'Finger lifted before reaching the star', value: (r) => sum(r.map((x) => x.misses)), format: String },
    { label: 'Line control', hint: 'How closely the finger followed the straight line', value: lineControl, format: (n) => `${Math.round(n)}%` },
    { label: 'Sec / line', value: secondsPerLine, format: (n) => n.toFixed(1) },
  ],
}
