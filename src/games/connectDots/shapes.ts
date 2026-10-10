import type { Difficulty } from '../../db/db'

export type Point = readonly [x: number, y: number]

export interface DotShape {
  id: string
  name: string
  /** Grid is size x size dots; coordinates are [column, row] from the top-left. */
  size: number
  /** Each stroke is a polyline drawn dot to dot; a shape may have several strokes. */
  strokes: readonly (readonly Point[])[]
}

export const gridSizeFor: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 }

export const shapes: readonly DotShape[] = [
  // 3x3: short, mostly single strokes.
  { id: 'line', name: 'Line', size: 3, strokes: [[[0, 1], [2, 1]]] },
  { id: 'tick', name: 'Tick', size: 3, strokes: [[[0, 1], [1, 2], [2, 0]]] },
  { id: 'corner', name: 'Corner', size: 3, strokes: [[[0, 0], [0, 2], [2, 2]]] },
  { id: 'roof', name: 'Roof', size: 3, strokes: [[[0, 2], [1, 0], [2, 2]]] },
  { id: 'cross', name: 'Cross', size: 3, strokes: [[[0, 0], [2, 2]], [[2, 0], [0, 2]]] },
  { id: 'plus', name: 'Plus', size: 3, strokes: [[[1, 0], [1, 2]], [[0, 1], [2, 1]]] },
  { id: 'triangle', name: 'Triangle', size: 3, strokes: [[[1, 0], [2, 2], [0, 2], [1, 0]]] },
  { id: 'square', name: 'Square', size: 3, strokes: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
  { id: 'zigzag', name: 'Zigzag', size: 3, strokes: [[[0, 0], [2, 0], [0, 2], [2, 2]]] },

  // 4x4: longer strokes, letters, more distractor dots.
  { id: 'c', name: 'Letter C', size: 4, strokes: [[[3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3]]] },
  { id: 'n', name: 'Letter N', size: 4, strokes: [[[0, 3], [0, 0], [3, 3], [3, 0]]] },
  { id: 'stairs', name: 'Stairs', size: 4, strokes: [[[0, 3], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0], [3, 0]]] },
  { id: 'lightning', name: 'Lightning', size: 4, strokes: [[[2, 0], [0, 2], [3, 1], [1, 3]]] },
  { id: 'mountains', name: 'Mountains', size: 4, strokes: [[[0, 3], [1, 1], [2, 2], [3, 0]]] },
  { id: 'hourglass', name: 'Hourglass', size: 4, strokes: [[[0, 0], [3, 0], [0, 3], [3, 3], [0, 0]]] },
  { id: 'kite', name: 'Kite', size: 4, strokes: [[[1, 0], [3, 1], [1, 3], [0, 1], [1, 0]], [[1, 3], [2, 3]]] },

  // 5x5: multi-stroke pictures.
  { id: 'house', name: 'House', size: 5, strokes: [[[0, 4], [0, 2], [2, 0], [4, 2], [4, 4], [0, 4]], [[2, 4], [2, 3], [3, 3], [3, 4]]] },
  { id: 'diamond', name: 'Diamond', size: 5, strokes: [[[2, 0], [4, 2], [2, 4], [0, 2], [2, 0]]] },
  { id: 'w', name: 'Letter W', size: 5, strokes: [[[0, 0], [1, 4], [2, 1], [3, 4], [4, 0]]] },
  { id: 'e', name: 'Letter E', size: 5, strokes: [[[4, 0], [0, 0], [0, 4], [4, 4]], [[0, 2], [3, 2]]] },
  { id: 'star', name: 'Star', size: 5, strokes: [[[0, 1], [4, 1], [1, 4], [2, 0], [3, 4], [0, 1]]] },
  { id: 'arrow', name: 'Arrow', size: 5, strokes: [[[0, 2], [4, 2]], [[2, 0], [4, 2], [2, 4]]] },
  { id: 'fish', name: 'Fish', size: 5, strokes: [[[1, 2], [2, 1], [3, 1], [4, 2], [3, 3], [2, 3], [1, 2]], [[1, 2], [0, 1], [0, 3], [1, 2]]] },
  { id: 'boat', name: 'Boat', size: 5, strokes: [[[0, 3], [4, 3], [3, 4], [1, 4], [0, 3]], [[2, 3], [2, 0], [4, 2], [2, 2]]] },
  { id: 'heart', name: 'Heart', size: 5, strokes: [[[2, 1], [1, 0], [0, 1], [0, 2], [2, 4], [4, 2], [4, 1], [3, 0], [2, 1]]] },
]

export interface Segment {
  from: Point
  to: Point
  /** Whether this segment starts where the previous one ended, so a finger can keep going. */
  continues: boolean
}

export function segmentsOf(shape: DotShape): Segment[] {
  return shape.strokes.flatMap((stroke) =>
    stroke.slice(1).map((to, i) => ({ from: stroke[i], to, continues: i > 0 })),
  )
}

/** Picks `count` shapes for a session, without repeats until the pool runs out. */
export function pickShapes(difficulty: Difficulty, count: number, random = Math.random): DotShape[] {
  const pool = shapes.filter((s) => s.size === gridSizeFor[difficulty])
  const picked: DotShape[] = []
  let bag: DotShape[] = []
  while (picked.length < count) {
    if (bag.length === 0) bag = [...pool]
    const [shape] = bag.splice(Math.floor(random() * bag.length), 1)
    if (picked.at(-1)?.id === shape.id && bag.length > 0) {
      bag.push(shape)
      continue
    }
    picked.push(shape)
  }
  return picked
}

type Vec = { x: number; y: number }

export function distance(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Shortest distance from p to the segment a-b. */
export function distanceToSegment(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return distance(p, a)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq))
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy })
}

/**
 * How far the finger strayed from the ideal straight line, as a fraction of the dot spacing
 * (0 = perfectly on the line). This is the "line control" number shown to the therapist.
 */
export function pathDeviation(path: readonly Vec[], a: Vec, b: Vec, spacing: number) {
  if (path.length === 0 || spacing <= 0) return 0
  const total = path.reduce((sum, p) => sum + distanceToSegment(p, a, b), 0)
  return total / path.length / spacing
}
