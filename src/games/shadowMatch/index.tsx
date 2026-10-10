import { mean, sum, type GameInfo } from '../types'
import { ShadowMatchRound, planShadows, type ShadowRoundResult } from './ShadowMatch'

export const shadowMatch: GameInfo<ShadowRoundResult, ReturnType<typeof planShadows>> = {
  id: 'shadow-match',
  title: 'Shadow Match',
  skill: 'Drag and drop, shape and visual matching',
  color: '#34C77B',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="68" cy="34" r="20" fill="rgba(0,0,0,0.2)" />
      <circle cx="34" cy="68" r="20" fill="#fff" />
      <path d="M44 56 Q52 44 58 46" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="2 8" />
    </svg>
  ),
  intro: { text: 'Drag each animal to its shadow!', speech: 'Help the animals find their shadows!' },
  levels: {
    easy: '2 animals; the right shadow glows when one is picked up',
    medium: '3 animals',
    hard: '4 animals',
  },
  Round: ShadowMatchRound,
  plan: planShadows,
  metrics: [
    { label: 'Matched', value: (r) => sum(r.map((x) => x.items)), format: String },
    { label: 'Wrong drops', hint: 'Animals dropped on another animal’s shadow', value: (r) => sum(r.map((x) => x.wrongDrops)), format: String },
    { label: 'Sec / animal', value: (r) => mean(r.map((x) => x.durationMs / 1000 / Math.max(1, x.items))), format: (n) => n.toFixed(1) },
  ],
}
