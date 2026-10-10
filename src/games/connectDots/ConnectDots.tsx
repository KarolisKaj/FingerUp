import { useEffect, useRef } from 'react'
import { sound } from '../../audio/sound'
import type { RoundProps } from '../types'
import { ConnectDotsEngine, type SegmentResult } from './engine'
import type { RoundResult } from './results'
import type { DotShape } from './shapes'

export function ConnectDotsRound({ round, settings, plan, active, complete }: RoundProps<RoundResult, DotShape[]>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ConnectDotsEngine | null>(null)
  const shape = plan[round]
  // Keep the latest `complete` for the engine's long-lived callbacks.
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })

  useEffect(() => {
    const startedAt = Date.now()
    const segments: SegmentResult[] = []
    let misses = 0
    const engine = new ConnectDotsEngine(
      canvasRef.current!,
      { tolerance: settings.tolerance, guide: settings.guide, calm: settings.calm },
      {
        onStep: (index, result) => {
          segments.push(result)
          sound.step(index)
        },
        onMiss: () => {
          misses++
          sound.miss()
        },
        onHint: () => sound.hint(),
        onShapeComplete: () =>
          completeRef.current(
            { shapeId: shape.id, shapeName: shape.name, durationMs: Date.now() - startedAt, misses, segments },
            { subtitle: shape.name, speech: `Great job! A ${shape.name.toLowerCase()}!` },
          ),
      },
    )
    engine.load(shape)
    engineRef.current = engine
    return () => engine.destroy()
  }, [shape, settings])

  useEffect(() => {
    engineRef.current?.setPaused(!active)
  }, [active])

  return <canvas ref={canvasRef} className="board-canvas" />
}
