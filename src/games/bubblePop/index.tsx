import { mean, sum, type GameInfo } from '../types'
import { BubblePopRound, type BubbleRound } from './BubblePop'

export const bubblePop: GameInfo<BubbleRound> = {
  id: 'bubble-pop',
  title: 'Bubble Pop',
  skill: 'Pointing and tapping with one finger, hand-eye coordination',
  color: '#4FB3F0',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="44" cy="54" r="30" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="5" />
      <ellipse cx="33" cy="42" rx="8" ry="4.5" fill="#fff" transform="rotate(-35 33 42)" />
      <circle cx="76" cy="28" r="12" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="4" />
      <circle cx="78" cy="70" r="7" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="3.5" />
    </svg>
  ),
  intro: { text: 'Pop the bubbles with your finger!', speech: 'Pop the bubbles!' },
  levels: {
    easy: 'Big, slow bubbles, 6 pops per round',
    medium: 'Medium bubbles, 10 pops',
    hard: 'Small, faster bubbles, 14 pops',
  },
  Round: BubblePopRound,
  metrics: [
    { label: 'Pops', value: (r) => sum(r.map((x) => x.pops)), format: String },
    {
      label: 'Accuracy',
      hint: 'Taps that hit a bubble',
      value: (r) => {
        const taps = sum(r.map((x) => x.taps))
        return taps ? (100 * sum(r.map((x) => x.pops))) / taps : null
      },
      format: (n) => `${Math.round(n)}%`,
    },
    { label: 'Sec / pop', value: (r) => mean(r.map((x) => x.durationMs / 1000 / Math.max(1, x.pops))), format: (n) => n.toFixed(1) },
  ],
}
