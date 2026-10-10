import { describe, expect, it } from 'vitest'
import { advance, densify, pickTraceShapes, traceShapes } from './shapes'

describe('trace shapes', () => {
  it('stay inside the drawing box', () => {
    for (const shape of Object.values(traceShapes).flat()) {
      for (const [x, y] of shape.strokes.flat()) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(1)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(1)
      }
    }
  })

  it('cycles through shapes in order', () => {
    expect(pickTraceShapes('easy', 5).map((s) => s.id)).toEqual(['down', 'across', 'slide', 'hill', 'down'])
  })
})

describe('densify', () => {
  it('fills gaps evenly', () => {
    const pts = densify([{ x: 0, y: 0 }, { x: 10, y: 0 }], 2)
    expect(pts).toHaveLength(6)
    expect(pts.at(-1)).toEqual({ x: 10, y: 0 })
  })
})

describe('advance', () => {
  const path = densify([{ x: 0, y: 0 }, { x: 100, y: 0 }], 1)

  it('moves forward when the finger is near the path', () => {
    expect(advance(path, 0, { x: 20, y: 5 }, 10, 50).progress).toBe(20)
  })

  it('does not move when the finger is too far away', () => {
    expect(advance(path, 0, { x: 20, y: 30 }, 10, 50).progress).toBe(0)
  })

  it('cannot jump further than the lookahead', () => {
    expect(advance(path, 0, { x: 90, y: 0 }, 10, 30).progress).toBe(0)
  })

  it('never goes backwards', () => {
    expect(advance(path, 50, { x: 10, y: 0 }, 10, 30).progress).toBe(50)
  })
})
