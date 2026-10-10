import { useEffect, useRef, useState } from 'react'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import { Mascot, type MascotPose } from '../../components/Mascot'
import type { RoundProps } from '../types'
import './Move.css'

export interface MoveRoundResult {
  actions: string[]
  durationMs: number
}

interface Action {
  id: MascotPose
  label: string
  say: string
  beat: 'clap' | 'drum' | 'none'
}

const ACTIONS: Record<MascotPose, Action> = {
  clap: { id: 'clap', label: 'Clap your hands', say: 'Clap your hands!', beat: 'clap' },
  armsUp: { id: 'armsUp', label: 'Reach up high', say: 'Reach up high, up to the sky!', beat: 'none' },
  wave: { id: 'wave', label: 'Wave hello', say: 'Wave hello!', beat: 'none' },
  stomp: { id: 'stomp', label: 'Stomp your feet', say: 'Stomp, stomp, stomp your feet!', beat: 'drum' },
  jump: { id: 'jump', label: 'Jump', say: 'Jump, jump, jump!', beat: 'drum' },
  spin: { id: 'spin', label: 'Turn around', say: 'Turn all the way around!', beat: 'none' },
  wiggle: { id: 'wiggle', label: 'Wiggle', say: 'Wiggle, wiggle, wiggle!', beat: 'clap' },
}

const BEAT_MS = 600
const BEATS_PER_ACTION = 8

export function MoveRound({ round, settings, plan, active, complete }: RoundProps<MoveRoundResult, MascotPose[][]>) {
  const moves = plan[round].map((id) => ACTIONS[id])
  const [step, setStep] = useState(0)
  const [beat, setBeat] = useState(0)
  const [size, setSize] = useState(300)
  const boardRef = useRef<HTMLDivElement>(null)
  const roundStart = useRef(0)
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })

  useEffect(() => {
    const el = boardRef.current!
    const ro = new ResizeObserver(() => setSize(Math.min(el.clientWidth * 0.5, el.clientHeight * 0.62)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Announce, then keep a gentle beat; after enough beats move on (or finish the round).
  useEffect(() => {
    if (!active) return
    const action = moves[step]
    if (!roundStart.current) roundStart.current = Date.now()
    speech.say(moves.length > 1 && step === 0 ? `${action.say} Then, ${moves[1].say.toLowerCase()}` : action.say, { queue: true })
    let count = 0
    const timer = setInterval(() => {
      count++
      setBeat(count)
      if (action.beat === 'clap') sound.clap()
      else if (action.beat === 'drum') sound.drum()
      else if (count % 2 === 0) sound.pluck(3 + (count % 4))
      if (count >= BEATS_PER_ACTION) {
        clearInterval(timer)
        if (step < moves.length - 1) setStep(step + 1)
        else
          completeRef.current(
            { actions: moves.map((m) => m.id), durationMs: Date.now() - roundStart.current },
            { title: 'Great moving!', speech: 'Great moving!' },
          )
      }
    }, BEAT_MS)
    return () => clearInterval(timer)
    // `moves` comes from the plan, which is fixed for the session.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step])

  const action = moves[step]
  const finish = () => {
    if (!active) return
    sound.tap()
    completeRef.current({ actions: moves.map((m) => m.id), durationMs: Date.now() - (roundStart.current || Date.now()) }, { title: 'Great moving!', speech: 'Great moving!' })
  }

  return (
    <div ref={boardRef} className="move-board">
      <div className="move-stage">
        <Mascot mood="idle" pose={active ? action.id : undefined} size={size} />
      </div>
      <div className="move-label">
        {moves.map((m, i) => (
          <span key={i} className={i === step ? 'current' : i < step ? 'done' : ''}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="move-beats" aria-hidden="true">
        {Array.from({ length: BEATS_PER_ACTION }, (_, i) => (
          <span key={i} className={i < beat ? 'on' : ''} />
        ))}
      </div>
      <button type="button" className="btn move-next" onClick={finish} aria-label="Next movement">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {settings.calm ? null : <div className="move-floor" />}
    </div>
  )
}
