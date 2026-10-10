import type { MascotPose } from '../../components/Mascot'
import type { GameInfo } from '../types'
import { MoveRound, planMoves, type MoveRoundResult } from './Move'

export const move: GameInfo<MoveRoundResult, MascotPose[][]> = {
  id: 'move',
  title: 'Move with Pip',
  skill: 'Gross motor imitation: clapping, reaching, stomping, jumping, turning, body awareness',
  color: '#FFB020',
  icon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="50" cy="56" r="22" fill="#fff" />
      <path d="M32 50 L16 28 M68 50 L84 28" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="40" cy="82" rx="8" ry="5" fill="#fff" />
      <ellipse cx="60" cy="82" rx="8" ry="5" fill="#fff" />
    </svg>
  ),
  intro: { text: 'Copy Pip! Stand up and move along.', speech: 'Stand up, and copy me!' },
  levels: {
    easy: 'Clap, reach up, wave, stomp',
    medium: 'Adds jump, turn around and wiggle',
    hard: 'Two movements in a row ("clap, then jump")',
  },
  Round: MoveRound,
  plan: planMoves,
  metrics: [{ label: 'Movements', value: (r) => r.reduce((n, x) => n + x.actions.length, 0), format: String }],
}
