import { describe, expect, it } from 'vitest'
import { defaultSettings, type Difficulty } from '../db/db'
import { games } from './registry'

const levels: Difficulty[] = ['easy', 'medium', 'hard']

describe('game registry', () => {
  it('has unique ids', () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length)
  })

  it.each(games.map((g) => [g.id, g] as const))('%s plans the right number of rounds at every level', (_, game) => {
    for (const level of levels) {
      const rounds = game.rounds?.(defaultSettings) ?? 5
      const plan = game.plan?.(level, rounds)
      if (Array.isArray(plan)) expect(plan).toHaveLength(rounds)
      expect(game.levels[level]).toBeTruthy()
    }
  })

  it.each(games.map((g) => [g.id, g] as const))('%s metrics handle an empty session', (_, game) => {
    for (const metric of game.metrics) {
      const v = metric.value([])
      expect(v === null || Number.isFinite(v)).toBe(true)
    }
  })
})
