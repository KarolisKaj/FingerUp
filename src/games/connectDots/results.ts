import type { Difficulty } from '../../db/db'
import type { SegmentResult } from './engine'

export interface RoundResult {
  shapeId: string
  shapeName: string
  durationMs: number
  misses: number
  segments: SegmentResult[]
}

export interface ConnectDotsData {
  difficulty: Difficulty
  rounds: RoundResult[]
}

export interface ConnectDotsSummary {
  pictures: number
  lines: number
  misses: number
  /** 0-100: how closely the finger followed straight lines (100 = perfectly on the line). */
  lineControl: number | null
  secondsPerLine: number | null
}

/** A finger drifting a quarter of the dot spacing off the line on average scores 0. */
const DEVIATION_AT_ZERO = 0.25

export function summarize(data: ConnectDotsData): ConnectDotsSummary {
  const segments = data.rounds.flatMap((r) => r.segments)
  const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)
  const deviation = mean(segments.map((s) => s.deviation))
  const ms = mean(segments.map((s) => s.durationMs))
  return {
    pictures: data.rounds.length,
    lines: segments.length,
    misses: data.rounds.reduce((sum, r) => sum + r.misses, 0),
    lineControl: deviation === null ? null : Math.round(100 * Math.max(0, 1 - deviation / DEVIATION_AT_ZERO)),
    secondsPerLine: ms === null ? null : ms / 1000,
  }
}
