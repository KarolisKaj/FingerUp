import { mean, sum, type GameInfo } from '../types'
import { pickTraceShapes, type TraceShape } from './shapes'
import { TraceRound, type TraceRoundResult } from './Trace'

export const trace: GameInfo<TraceRoundResult, TraceShape[]> = {
  id: 'trace',
  title: 'Ladybug Lines',
  skill: 'Pre-writing strokes: lines, curves, circle, cross, square, triangle, X',
  color: '#FF5A5F',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <path d="M16 76 Q30 20 50 50 T84 26" stroke="rgba(255,255,255,0.35)" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M16 76 Q30 20 50 50" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="50" r="11" fill="#fff" />
      <circle cx="50" cy="50" r="6" fill="#2B2D42" />
    </svg>
  ),
  intro: { text: 'Help the ladybug walk along the path to the star!', speech: 'Help the ladybug get to the star!' },
  levels: {
    easy: 'Lines down and across, slide, hill; wide path',
    medium: 'Circle, cross, waves, square',
    hard: 'Triangle, X, zigzag, spiral; narrow path',
  },
  Round: TraceRound,
  plan: pickTraceShapes,
  metrics: [
    { label: 'Shapes', value: (r) => r.length, format: String },
    {
      label: 'On the path',
      hint: 'How close to the middle of the path the finger stayed (100% = right in the middle)',
      value: (r) => (r.length ? 100 * Math.max(0, 1 - (mean(r.map((x) => x.deviation)) ?? 0) / 0.6) : null),
      format: (n) => `${Math.round(n)}%`,
    },
    { label: 'Lifts', hint: 'Finger lifted in the middle of a line', value: (r) => sum(r.map((x) => x.lifts)), format: String },
    { label: 'Sec / shape', value: (r) => mean(r.map((x) => x.durationMs / 1000)), format: (n) => n.toFixed(1) },
  ],
}
