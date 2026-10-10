import { ANIMALS, pick } from '../../art/art'
import { mean, sum, type GameInfo } from '../types'
import { WipeRound, type WipeRoundResult } from './Wipe'

export const wipe: GameInfo<WipeRoundResult, (typeof ANIMALS)[number][]> = {
  id: 'wipe',
  title: 'Wipe & Find',
  skill: 'Swiping and scrubbing with the whole hand or a finger; finishing a task; naming animals',
  color: '#7986CB',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <rect x="16" y="20" width="68" height="60" rx="12" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="5" />
      <path d="M26 66 Q42 34 58 56 T80 36" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.9" />
      <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="800" fill="#7986CB" fontFamily="sans-serif">?</text>
    </svg>
  ),
  intro: { text: 'Who is hiding? Wipe the window to find out!', speech: 'Who is hiding? Wipe, wipe, wipe!' },
  levels: {
    easy: 'Wide wiping brush, revealed after clearing about half',
    medium: 'Medium brush, clear more than half',
    hard: 'Narrow brush, clear most of the window',
  },
  Round: WipeRound,
  plan: (_, rounds) => pick(ANIMALS, rounds),
  metrics: [
    { label: 'Found', value: (r) => r.length, format: String },
    { label: 'Sec / animal', value: (r) => mean(r.map((x) => x.durationMs / 1000)), format: (n) => n.toFixed(1) },
    { label: 'Strokes', hint: 'Separate finger touches used to clear the window', value: (r) => sum(r.map((x) => x.strokes)), format: String },
  ],
}
