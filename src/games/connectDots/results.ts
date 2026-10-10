import type { SegmentResult } from './engine'

export interface RoundResult {
  shapeId: string
  shapeName: string
  durationMs: number
  misses: number
  segments: SegmentResult[]
}

/** A finger drifting a quarter of the dot spacing off the line on average scores 0. */
const DEVIATION_AT_ZERO = 0.25

/** 0-100: how closely the finger followed straight lines (100 = perfectly on the line). */
export function lineControl(rounds: RoundResult[]): number | null {
  const segments = rounds.flatMap((r) => r.segments)
  if (segments.length === 0) return null
  const deviation = segments.reduce((a, s) => a + s.deviation, 0) / segments.length
  return 100 * Math.max(0, 1 - deviation / DEVIATION_AT_ZERO)
}

export function secondsPerLine(rounds: RoundResult[]): number | null {
  const segments = rounds.flatMap((r) => r.segments)
  if (segments.length === 0) return null
  return segments.reduce((a, s) => a + s.durationMs, 0) / segments.length / 1000
}
