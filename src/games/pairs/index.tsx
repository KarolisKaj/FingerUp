import { mean, sum, type GameInfo } from '../types'
import { PairsRound, planPairs, type PairsRoundResult } from './Pairs'

export const pairs: GameInfo<PairsRoundResult, ReturnType<typeof planPairs>> = {
  id: 'pairs',
  title: 'Peekaboo Pairs',
  skill: 'Visual memory, matching, taking turns with tapping',
  color: '#9B7BEA',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <rect x="14" y="24" width="32" height="44" rx="7" fill="#fff" transform="rotate(-8 30 46)" />
      <rect x="54" y="30" width="32" height="44" rx="7" fill="rgba(255,255,255,0.4)" stroke="#fff" strokeWidth="4" transform="rotate(8 70 52)" />
      <circle cx="30" cy="46" r="8" fill="#FFC94A" />
      <circle cx="70" cy="52" r="5" fill="#fff" />
    </svg>
  ),
  intro: { text: 'Look at the animals, then find the pairs!', speech: 'Look carefully! Then find two the same.' },
  levels: {
    easy: '2 pairs (4 cards), shown for a while first',
    medium: '3 pairs (6 cards)',
    hard: '4 pairs (8 cards), shorter peek',
  },
  Round: PairsRound,
  plan: planPairs,
  metrics: [
    { label: 'Pairs', value: (r) => sum(r.map((x) => x.pairs)), format: String },
    { label: 'Mismatches', hint: 'Two different cards turned over', value: (r) => sum(r.map((x) => x.mismatches)), format: String },
    { label: 'Sec / pair', value: (r) => mean(r.map((x) => x.durationMs / 1000 / Math.max(1, x.pairs))), format: (n) => n.toFixed(1) },
  ],
}
