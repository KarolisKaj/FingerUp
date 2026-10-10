import { ANIMALS, pick, shuffle } from '../../art/art'
import type { Difficulty } from '../../db/db'
import { mean, sum, type GameInfo } from '../types'
import { ShadowMatchRound, type RoundPlan, type ShadowRoundResult } from './ShadowMatch'

const shadowCounts: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 }

function planShadows(level: Difficulty, rounds: number): RoundPlan[] {
  const n = shadowCounts[level]
  return Array.from({ length: rounds }, () => {
    const order = [...Array(n).keys()]
    let trayOrder = shuffle(order)
    // Never line animals up directly under their own shadow: that would make it trivial.
    for (let i = 0; i < 10 && n > 1 && trayOrder.some((v, k) => v === k); i++) trayOrder = shuffle(order)
    return { animals: pick(ANIMALS, n), shadowOrder: order, trayOrder }
  })
}

export const shadowMatch: GameInfo<ShadowRoundResult, RoundPlan[]> = {
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
