import type { ComponentType, ReactNode } from 'react'
import type { ArtId } from '../art/art'
import type { ChildSettings, Difficulty } from '../db/db'

/** What the round reward overlay says. All optional: the shell has friendly defaults. */
export interface Praise {
  title?: string
  subtitle?: string
  speech?: string
  art?: ArtId
}

export interface RoundProps<R = unknown, P = unknown> {
  round: number
  level: Difficulty
  settings: ChildSettings
  /** Whatever the game's `plan` produced for this session (e.g. the shapes to draw). */
  plan: P
  /** False while an overlay is showing: ignore input then. */
  active: boolean
  complete: (result: R, praise?: Praise) => void
}

export interface Metric<R = unknown> {
  label: string
  hint?: string
  /** Computes the value for one session from its round results; null when not applicable. */
  value: (rounds: R[]) => number | null
  format: (value: number) => string
}

export interface GameInfo<R = unknown, P = unknown> {
  id: string
  title: string
  /** Shown to the therapist: which skill the game practises. */
  skill: string
  color: string
  icon: ReactNode
  intro: { text: ReactNode; speech: string }
  /** What changes between levels, shown on the settings screen. */
  levels: Record<Difficulty, string>
  Round: ComponentType<RoundProps<R, P>>
  plan?: (level: Difficulty, rounds: number) => P
  /** Rounds per session; defaults to the child's "rounds per session" setting. */
  rounds?: (settings: ChildSettings) => number
  metrics: Metric<R>[]
}

/** Stored as `Session.data` for every game. */
export interface SessionData<R = unknown> {
  level: Difficulty
  rounds: R[]
}

export const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)
export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`
export const percent = (n: number) => `${Math.round(n)}%`
export const count = (n: number) => String(Math.round(n))
