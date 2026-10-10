import { mean, sum, type GameInfo } from '../types'
import { PinchRound, type PinchMode, type PinchRoundResult } from './Pinch'

export const pinch: GameInfo<PinchRoundResult, PinchMode[]> = {
  id: 'pinch',
  title: 'Squish & Bloom',
  skill: 'Two-finger pinch (pincer grasp) and spreading fingers apart',
  color: '#FF8A5B',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="50" cy="54" r="20" fill="#fff" />
      <circle cx="20" cy="26" r="9" fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth="4" />
      <circle cx="80" cy="82" r="9" fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth="4" />
      <path d="M28 34 L38 44 M72 74 L62 64" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),
  intro: {
    text: 'Squeeze the fruit with two fingers, then open them wide to make flowers bloom!',
    speech: 'Squeeze with two fingers!',
  },
  levels: {
    easy: 'Small pinch/spread is enough, anywhere on the screen, 3 per round',
    medium: 'Bigger movement needed, 4 per round',
    hard: 'Full pinch/spread, fingers must start on the object, 5 per round',
  },
  Round: PinchRound,
  // Alternate squeezing fruit and opening flowers, starting with the easier pinch.
  plan: (_, rounds) => Array.from({ length: rounds }, (_, i) => (i % 2 === 0 ? 'pinch' : 'spread')),
  metrics: [
    { label: 'Done', value: (r) => sum(r.map((x) => x.items)), format: String },
    { label: 'Retries', hint: 'Two-finger tries let go before the goal', value: (r) => sum(r.map((x) => x.retries)), format: String },
    { label: 'Sec / item', value: (r) => mean(r.map((x) => x.durationMs / 1000 / Math.max(1, x.items))), format: (n) => n.toFixed(1) },
  ],
}
