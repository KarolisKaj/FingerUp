import { describe, expect, it } from 'vitest'
import { defaultSettings, levelFor } from './db'

describe('levelFor', () => {
  it('uses the per-game level when set', () => {
    expect(levelFor({ ...defaultSettings, levels: { 'bubble-pop': 'hard' } }, 'bubble-pop')).toBe('hard')
  })

  it('keeps the old single difficulty for Connect the Dots only', () => {
    const legacy = { ...defaultSettings, difficulty: 'medium' as const }
    expect(levelFor(legacy, 'connect-dots')).toBe('medium')
    expect(levelFor(legacy, 'bubble-pop')).toBe('easy')
  })
})
