import type { Difficulty } from '../../db/db'

type P = [number, number]

export interface TraceShape {
  id: string
  name: string
  /** What the voice says at the start of the round. */
  say: string
  /** Width/height of the drawing box (coordinates are 0..1 in both directions). */
  aspect: number
  strokes: P[][]
}

const arc = (cx: number, cy: number, r: number, from: number, to: number, steps = 48): P[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })

const wave = (): P[] =>
  Array.from({ length: 61 }, (_, i) => {
    const t = i / 60
    return [0.04 + t * 0.92, 0.5 - 0.28 * Math.sin(t * Math.PI * 4)]
  })

const spiral = (): P[] =>
  Array.from({ length: 121 }, (_, i) => {
    const t = i / 120
    const a = -Math.PI / 2 + t * Math.PI * 4.5
    const r = 0.05 + t * 0.38
    return [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r]
  })

/**
 * Pre-writing strokes in roughly the order children master them:
 * vertical, horizontal, diagonal and curves first; then circle, cross and square; then triangle, X and more.
 */
export const traceShapes: Record<Difficulty, TraceShape[]> = {
  easy: [
    { id: 'down', name: 'Line down', say: 'Draw a line down!', aspect: 0.6, strokes: [[[0.5, 0.06], [0.5, 0.94]]] },
    { id: 'across', name: 'Line across', say: 'Draw a line across!', aspect: 2, strokes: [[[0.04, 0.5], [0.96, 0.5]]] },
    { id: 'slide', name: 'Slide', say: 'Down the slide!', aspect: 1.3, strokes: [[[0.08, 0.1], [0.92, 0.9]]] },
    { id: 'hill', name: 'Hill', say: 'Over the hill!', aspect: 1.6, strokes: [arc(0.5, 0.9, 0.44, Math.PI, 2 * Math.PI)] },
  ],
  medium: [
    { id: 'circle', name: 'Circle', say: 'Round and round!', aspect: 1, strokes: [arc(0.5, 0.5, 0.42, -Math.PI / 2, -Math.PI / 2 - 2 * Math.PI, 72)] },
    { id: 'plus', name: 'Cross', say: 'Down, then across!', aspect: 1, strokes: [[[0.5, 0.06], [0.5, 0.94]], [[0.06, 0.5], [0.94, 0.5]]] },
    { id: 'wave', name: 'Waves', say: 'Up and down the waves!', aspect: 2, strokes: [wave()] },
    { id: 'square', name: 'Square', say: "Let's draw a square!", aspect: 1, strokes: [[[0.1, 0.1], [0.1, 0.9], [0.9, 0.9], [0.9, 0.1], [0.1, 0.1]]] },
  ],
  hard: [
    { id: 'triangle', name: 'Triangle', say: "Let's draw a triangle!", aspect: 1.1, strokes: [[[0.5, 0.06], [0.06, 0.92], [0.94, 0.92], [0.5, 0.06]]] },
    { id: 'x', name: 'Letter X', say: 'Draw an X!', aspect: 1, strokes: [[[0.08, 0.08], [0.92, 0.92]], [[0.92, 0.08], [0.08, 0.92]]] },
    { id: 'zigzag', name: 'Zigzag', say: 'Zig, zag, zig, zag!', aspect: 2, strokes: [[[0.04, 0.2], [0.27, 0.8], [0.5, 0.2], [0.73, 0.8], [0.96, 0.2]]] },
    { id: 'spiral', name: 'Snail shell', say: 'Round and round like a snail!', aspect: 1, strokes: [spiral()] },
  ],
}

export function pickTraceShapes(level: Difficulty, rounds: number): TraceShape[] {
  const pool = traceShapes[level]
  // In order first (they are sorted by difficulty), then cycle.
  return Array.from({ length: rounds }, (_, i) => pool[i % pool.length])
}

type Vec = { x: number; y: number }

/** Turns a polyline into evenly spaced points (every `step` px) with no gaps for the finger to fall into. */
export function densify(points: Vec[], step: number): Vec[] {
  const out: Vec[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step))
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })
  }
  return out
}

/**
 * Moves progress forward along the path if the finger is close to it, never backwards and never
 * skipping far ahead (so cutting across a circle does not count). Returns the new index and how far
 * the finger was from the path.
 */
export function advance(path: Vec[], progress: number, finger: Vec, reach: number, lookahead: number) {
  let best = -1
  let bestD = Infinity
  const end = Math.min(path.length - 1, progress + lookahead)
  for (let i = progress; i <= end; i++) {
    const d = Math.hypot(path[i].x - finger.x, path[i].y - finger.y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return { progress: bestD <= reach ? Math.max(progress, best) : progress, distance: bestD }
}
