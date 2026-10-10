import { describe, expect, it } from 'vitest'
import { distanceToSegment, gridSizeFor, pathDeviation, pickShapes, segmentsOf, shapes } from './shapes'

describe('shape library', () => {
  it.each(shapes.map((s) => [s.id, s] as const))('%s is valid', (_, shape) => {
    for (const stroke of shape.strokes) {
      expect(stroke.length).toBeGreaterThanOrEqual(2)
      for (const [x, y] of stroke) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThan(shape.size)
        expect(y).toBeLessThan(shape.size)
      }
      for (let i = 1; i < stroke.length; i++) expect(stroke[i]).not.toEqual(stroke[i - 1])
    }
  })

  it('has unique ids', () => {
    expect(new Set(shapes.map((s) => s.id)).size).toBe(shapes.length)
  })

  it('has several shapes for each difficulty', () => {
    for (const size of Object.values(gridSizeFor)) {
      expect(shapes.filter((s) => s.size === size).length).toBeGreaterThanOrEqual(5)
    }
  })
})

describe('segmentsOf', () => {
  it('flattens strokes and marks continuation', () => {
    const segments = segmentsOf({ id: 't', name: 't', size: 3, strokes: [[[0, 0], [1, 0], [2, 0]], [[0, 2], [2, 2]]] })
    expect(segments.map((s) => s.continues)).toEqual([false, true, false])
    expect(segments[1]).toMatchObject({ from: [1, 0], to: [2, 0] })
  })
})

describe('pickShapes', () => {
  it('returns shapes of the right size without back-to-back repeats', () => {
    const picked = pickShapes('medium', 20)
    expect(picked).toHaveLength(20)
    expect(picked.every((s) => s.size === 4)).toBe(true)
    for (let i = 1; i < picked.length; i++) expect(picked[i].id).not.toBe(picked[i - 1].id)
  })
})

describe('geometry', () => {
  const a = { x: 0, y: 0 }
  const b = { x: 100, y: 0 }

  it('measures distance to a segment, clamped to its ends', () => {
    expect(distanceToSegment({ x: 50, y: 10 }, a, b)).toBe(10)
    expect(distanceToSegment({ x: 130, y: 40 }, a, b)).toBe(50)
  })

  it('reports deviation relative to dot spacing', () => {
    expect(pathDeviation([{ x: 10, y: 0 }, { x: 90, y: 0 }], a, b, 100)).toBe(0)
    expect(pathDeviation([{ x: 50, y: 20 }, { x: 60, y: -20 }], a, b, 100)).toBeCloseTo(0.2)
  })
})
