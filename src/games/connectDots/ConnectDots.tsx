import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import { Confetti } from '../../components/Confetti'
import { HoldButton } from '../../components/HoldButton'
import { HomeIcon } from '../../components/icons'
import { Mascot } from '../../components/Mascot'
import { StarJar } from '../../components/StarJar'
import { childSettings, db, type Child } from '../../db/db'
import { useChild } from '../../hooks/useChild'
import { NotFound } from '../../screens/NotFound'
import { ConnectDotsEngine, type SegmentResult } from './engine'
import type { ConnectDotsData, RoundResult } from './results'
import { pickShapes } from './shapes'
import './ConnectDots.css'

export const GAME_ID = 'connect-dots'

type Phase = 'intro' | 'playing' | 'roundDone' | 'finished'

export function ConnectDots() {
  const child = useChild()
  const [run, setRun] = useState(0)
  if (child === undefined) return null
  if (child === null) return <NotFound />
  return <ConnectDotsGame key={run} child={child} autoStart={run > 0} onPlayAgain={() => setRun((r) => r + 1)} />
}

function ConnectDotsGame({ child, autoStart, onPlayAgain }: { child: Child; autoStart: boolean; onPlayAgain: () => void }) {
  const navigate = useNavigate()
  // Settings are fixed for the whole session even if the therapist edits them meanwhile.
  const [settings] = useState(() => childSettings(child))
  const shapes = useMemo(() => pickShapes(settings.difficulty, settings.rounds), [settings])

  const [phase, setPhase] = useState<Phase>(autoStart ? 'playing' : 'intro')
  const [round, setRound] = useState(0)
  const [earned, setEarned] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ConnectDotsEngine | null>(null)

  // Mutable session record, written to the database once at the end (or on early exit).
  const session = useRef({
    startedAt: 0,
    rounds: [] as RoundResult[],
    current: { startedAt: 0, misses: 0, segments: [] as SegmentResult[] },
    saved: false,
  })

  const saveSession = (completed: boolean) => {
    const s = session.current
    if (s.saved || s.rounds.length === 0) return
    s.saved = true
    const data: ConnectDotsData = { difficulty: settings.difficulty, rounds: s.rounds }
    void db.sessions.add({
      childId: child.id,
      gameId: GAME_ID,
      startedAt: s.startedAt,
      durationMs: Date.now() - s.startedAt,
      completed,
      settings,
      data,
    })
  }

  useEffect(() => {
    sound.configure({ volume: settings.volume, calm: settings.calm })
    speech.setEnabled(settings.voice)
    if (autoStart) {
      sound.start()
      session.current.startedAt = session.current.current.startedAt = Date.now()
    }

    const engine = new ConnectDotsEngine(
      canvasRef.current!,
      { tolerance: settings.tolerance, guide: settings.guide, calm: settings.calm },
      {
        onStep: (index, result) => {
          session.current.current.segments.push(result)
          sound.step(index)
        },
        onMiss: () => {
          session.current.current.misses++
          sound.miss()
        },
        onHint: () => sound.hint(),
        onShapeComplete: () => {
          const s = session.current
          const shape = shapes[s.rounds.length]
          s.rounds.push({
            shapeId: shape.id,
            shapeName: shape.name,
            durationMs: Date.now() - s.current.startedAt,
            misses: s.current.misses,
            segments: s.current.segments,
          })
          setEarned(s.rounds.length)
          if (s.rounds.length < shapes.length) {
            setPhase('roundDone')
            sound.roundComplete()
            speech.say(`Great job! A ${shape.name.toLowerCase()}!`)
          } else {
            setPhase('finished')
            sound.celebrate()
            speech.say('Amazing! You did it!')
            saveSession(true)
          }
        },
      },
    )
    engine.load(shapes[0])
    engineRef.current = engine
    return () => {
      engine.destroy()
      speech.stop()
      saveSession(false)
    }
    // The engine lives for the whole session; settings and shapes are fixed for it.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engineRef.current?.setPaused(phase !== 'playing')
  }, [phase])

  // Short pause on the round reward, then the next picture.
  useEffect(() => {
    if (phase !== 'roundDone') return
    const timer = setTimeout(() => {
      const next = round + 1
      session.current.current = { startedAt: Date.now(), misses: 0, segments: [] }
      engineRef.current?.load(shapes[next])
      setRound(next)
      setPhase('playing')
    }, 2600)
    return () => clearTimeout(timer)
  }, [phase, round, shapes])

  const start = () => {
    sound.unlock()
    sound.start()
    speech.say('Put your finger on the green dot, and slide it to the star.')
    session.current.startedAt = session.current.current.startedAt = Date.now()
    setPhase('playing')
  }

  const exit = () => {
    saveSession(false)
    navigate(`/child/${child.id}`)
  }

  return (
    <div className="screen dots-screen">
      <div className="topbar">
        <HoldButton label="Leave game" onHold={exit}>
          <HomeIcon />
        </HoldButton>
        <h1>Connect the Dots</h1>
        <StarJar earned={earned} total={shapes.length} />
      </div>

      <div className="dots-board">
        <canvas ref={canvasRef} className="dots-canvas" />
      </div>

      {phase === 'intro' && (
        <div className="overlay">
          <div className="overlay-card pop-in">
            <Mascot mood="idle" size={150} />
            <h2>Connect the Dots</h2>
            <p className="overlay-text">
              Slide your finger from the <span className="chip chip-green">green dot</span> to the{' '}
              <span className="chip chip-star">star</span>.
            </p>
            <button type="button" className="btn btn-primary btn-big" onClick={start}>
              Let's go!
            </button>
          </div>
        </div>
      )}

      {phase === 'roundDone' && (
        <div className="overlay overlay-clear">
          <div className="overlay-card pop-in">
            <Mascot mood="happy" size={150} />
            <h2>Great job!</h2>
            <p className="overlay-text">{shapes[round].name}</p>
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div className="overlay">
          <Confetti calm={settings.calm} />
          <div className="overlay-card pop-in">
            <Mascot mood="cheer" size={180} />
            <h2>You did it!</h2>
            <StarJar earned={earned} total={shapes.length} />
            <div className="overlay-actions">
              <button type="button" className="btn btn-big" onClick={() => navigate(`/child/${child.id}`)}>
                All games
              </button>
              <button type="button" className="btn btn-primary btn-big" onClick={onPlayAgain}>
                Again!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
