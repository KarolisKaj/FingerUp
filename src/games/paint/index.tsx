import type { ArtId } from '../../art/art'
import { mean, sum, type GameInfo } from '../types'
import { PaintRound, planPaint, type PaintRoundResult } from './Paint'

export const paint: GameInfo<PaintRoundResult, ArtId[]> = {
  id: 'paint',
  title: 'Rainbow Paint',
  skill: 'Free finger painting: cause and effect, finger isolation, early scribbling and colour names',
  color: '#FF7AA8',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <path d="M14 70 Q30 24 50 50 T86 34" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M14 70 Q30 24 50 50 T86 34" stroke="#FFC94A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="76" r="9" fill="#fff" />
      <circle cx="58" cy="82" r="6" fill="#fff" opacity="0.8" />
    </svg>
  ),
  intro: { text: 'Paint with your fingers! Tap the tick when your picture is finished.', speech: "Let's paint! Use your finger." },
  levels: {
    easy: 'Blank paper, big brush',
    medium: 'Faint animal to colour in, medium brush',
    hard: 'Faint animal to colour in, thin brush',
  },
  Round: PaintRound,
  plan: (_, rounds) => planPaint(rounds),
  // One painting is a full activity; more rounds come from "Again!".
  rounds: () => 1,
  metrics: [
    { label: 'Paint time', hint: 'Seconds with a finger on the page', value: (r) => sum(r.map((x) => x.paintSeconds)), format: (n) => `${Math.round(n)}s` },
    { label: 'Strokes', value: (r) => sum(r.map((x) => x.strokes)), format: String },
    { label: 'Page covered', hint: 'Share of the page with paint on it', value: (r) => mean(r.map((x) => x.coverage)), format: (n) => `${Math.round(n)}%` },
  ],
}
