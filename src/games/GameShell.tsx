import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Art } from '../art/Art'
import { sound } from '../audio/sound'
import { speech } from '../audio/speech'
import { Confetti } from '../components/Confetti'
import { HoldButton } from '../components/HoldButton'
import { HomeIcon } from '../components/icons'
import { Mascot } from '../components/Mascot'
import { StarJar } from '../components/StarJar'
import { childSettings, db, levelFor, type Child } from '../db/db'
import type { GameInfo, Praise, SessionData } from './types'
import './GameShell.css'

type Phase = 'intro' | 'playing' | 'roundDone' | 'finished'

const CHEERS = ['Great job!', 'Yay!', 'Well done!', 'Wonderful!', 'Hooray!', 'Super!']

/**
 * Everything around a game: intro, star jar, round rewards, final celebration, saving results
 * and the press-and-hold exit. Games only render their play area (`game.Round`).
 */
export function GameShell<R, P>({
  game,
  child,
  autoStart,
  onPlayAgain,
}: {
  game: GameInfo<R, P>
  child: Child
  autoStart: boolean
  onPlayAgain: () => void
}) {
  const navigate = useNavigate()
  // Settings are fixed for the whole session even if the therapist edits them meanwhile.
  const [setup] = useState(() => {
    const settings = childSettings(child)
    const level = levelFor(settings, game.id)
    const total = Math.max(1, game.rounds?.(settings) ?? settings.rounds)
    return { settings, level, total, plan: game.plan?.(level, total) as P }
  })
  const { settings, level, total, plan } = setup

  const [phase, setPhaseState] = useState<Phase>(autoStart ? 'playing' : 'intro')
  // Rounds may call `complete` from long-lived callbacks, so the current phase lives in a ref too.
  const phaseRef = useRef<Phase>(phase)
  const setPhase = (next: Phase) => {
    phaseRef.current = next
    setPhaseState(next)
  }
  const [round, setRound] = useState(0)
  const [earned, setEarned] = useState(0)
  const [praise, setPraise] = useState<Praise>({})
  const session = useRef({ startedAt: 0, results: [] as R[], saved: false })

  const save = (completed: boolean) => {
    const s = session.current
    if (s.saved || s.results.length === 0) return
    s.saved = true
    const data: SessionData<R> = { level, rounds: s.results }
    void db.sessions.add({
      childId: child.id,
      gameId: game.id,
      startedAt: s.startedAt,
      durationMs: Date.now() - s.startedAt,
      completed,
      settings,
      data,
    })
  }
  // Keep the latest `save` for the unmount cleanup below.
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })

  useEffect(() => {
    sound.configure({ volume: settings.volume, calm: settings.calm })
    speech.setEnabled(settings.voice)
    if (autoStart) {
      session.current.startedAt = Date.now()
      sound.start()
    }
    return () => {
      speech.stop()
      saveRef.current(false)
    }
  }, [settings, autoStart])

  const start = () => {
    sound.unlock()
    sound.start()
    speech.say(game.intro.speech)
    session.current.startedAt = Date.now()
    setPhase('playing')
  }

  const complete = (result: R, p: Praise = {}) => {
    if (phaseRef.current !== 'playing') return
    const s = session.current
    s.results.push(result)
    setEarned(s.results.length)
    if (s.results.length < total) {
      const title = p.title ?? CHEERS[Math.floor(Math.random() * CHEERS.length)]
      setPraise({ ...p, title })
      setPhase('roundDone')
      sound.roundComplete()
      speech.say(p.speech ?? title)
    } else {
      setPraise(p)
      setPhase('finished')
      sound.celebrate()
      speech.say('Amazing! You did it!')
      save(true)
    }
  }

  // Short pause on the round reward, then the next round.
  useEffect(() => {
    if (phase !== 'roundDone') return
    const timer = setTimeout(() => {
      setRound((r) => r + 1)
      phaseRef.current = 'playing'
      setPhaseState('playing')
    }, 2600)
    return () => clearTimeout(timer)
  }, [phase])

  const exit = () => {
    save(false)
    navigate(`/child/${child.id}`)
  }

  const Round = game.Round

  return (
    <div className="screen game-screen">
      <div className="topbar">
        <HoldButton label="Leave game" onHold={exit}>
          <HomeIcon />
        </HoldButton>
        <h1>{game.title}</h1>
        <StarJar earned={earned} total={total} />
      </div>

      <div className="game-board">
        <Round
          key={round}
          round={round}
          level={level}
          settings={settings}
          plan={plan}
          active={phase === 'playing'}
          complete={complete}
        />
      </div>

      {phase === 'intro' && (
        <div className="overlay">
          <div className="overlay-card pop-in">
            <Mascot mood="idle" size={150} />
            <h2>{game.title}</h2>
            <p className="overlay-text">{game.intro.text}</p>
            <button type="button" className="btn btn-primary btn-big" onClick={start}>
              Let's go!
            </button>
          </div>
        </div>
      )}

      {phase === 'roundDone' && (
        <div className="overlay overlay-clear">
          <div className="overlay-card pop-in">
            {praise.art ? (
              <div className="praise-art">
                <Art id={praise.art} size={150} />
              </div>
            ) : (
              <Mascot mood="happy" size={150} />
            )}
            <h2>{praise.title}</h2>
            {praise.subtitle && <p className="overlay-text">{praise.subtitle}</p>}
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div className="overlay">
          <Confetti calm={settings.calm} />
          <div className="overlay-card pop-in">
            <Mascot mood="cheer" size={180} />
            <h2>You did it!</h2>
            <StarJar earned={earned} total={total} />
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
