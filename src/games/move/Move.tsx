import { useEffect, useRef, useState } from 'react'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import { Mascot, type MascotPose } from '../../components/Mascot'
import type { RoundProps } from '../types'
import './Move.css'

export interface MoveRoundResult {
  actions: string[]
  /** The adult confirmed the child copied the movement. Missing in sessions saved before this was asked. */
  done?: boolean
  durationMs: number
}

interface Action {
  id: MascotPose
  label: string
  say: string
  praise: string
  beat: 'clap' | 'drum' | 'none'
}

const ACTIONS: Record<MascotPose, Action> = {
  clap: { id: 'clap', label: 'Clap your hands', say: 'Clap your hands!', praise: 'Great clapping!', beat: 'clap' },
  armsUp: { id: 'armsUp', label: 'Reach up high', say: 'Reach up high, up to the sky!', praise: 'Great reaching!', beat: 'none' },
  wave: { id: 'wave', label: 'Wave hello', say: 'Wave hello!', praise: 'Lovely waving!', beat: 'none' },
  stomp: { id: 'stomp', label: 'Stomp your feet', say: 'Stomp, stomp, stomp your feet!', praise: 'Great stomping!', beat: 'drum' },
  jump: { id: 'jump', label: 'Jump', say: 'Jump, jump, jump!', praise: 'Great jumping!', beat: 'drum' },
  spin: { id: 'spin', label: 'Turn around', say: 'Turn all the way around!', praise: 'Great turning!', beat: 'none' },
  wiggle: { id: 'wiggle', label: 'Wiggle', say: 'Wiggle, wiggle, wiggle!', praise: 'Great wiggling!', beat: 'clap' },
}

const BEAT_MS = 600
const BEATS_PER_ACTION = 8
/** Full demonstrations with beat and voice before Pip carries on quietly, waiting for the adult. */
const PROMPTED_CYCLES = 3

/**
 * The app cannot see the child, so it never decides on its own that a movement was done:
 * Pip demonstrates until the adult taps "Did it" (star and praise) or "Next" (no reward).
 */
export function MoveRound({ round, settings, plan, active, complete }: RoundProps<MoveRoundResult, MascotPose[][]>) {
  const moves = plan[round].map((id) => ACTIONS[id])
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [beat, setBeat] = useState(0)
  const [size, setSize] = useState(300)
  const boardRef = useRef<HTMLDivElement>(null)
  const roundStart = useRef(0)

  useEffect(() => {
    const el = boardRef.current!
    const ro = new ResizeObserver(() => setSize(Math.min(el.clientWidth * 0.5, el.clientHeight * 0.6)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Demonstrate with voice and a gentle beat; repeat a few times, then keep moving quietly.
  useEffect(() => {
    if (!active) return
    if (!roundStart.current) roundStart.current = Date.now()
    if (cycle >= PROMPTED_CYCLES) return
    const action = moves[step]
    if (step === 0) {
      const all = moves.length > 1 ? `${action.say} Then, ${moves[1].say.toLowerCase()}` : action.say
      speech.say(cycle === 0 ? all : `Your turn! ${all}`, { queue: true })
    }
    let count = 0
    setBeat(0)
    const timer = setInterval(() => {
      count++
      setBeat(count)
      if (action.beat === 'clap') sound.clap()
      else if (action.beat === 'drum') sound.drum()
      else if (count % 2 === 0) sound.pluck(3 + (count % 4))
      if (count >= BEATS_PER_ACTION) {
        clearInterval(timer)
        if (step < moves.length - 1) setStep(step + 1)
        else {
          // Hold the last pose for a breath, then show it all again.
          setTimeout(() => {
            setStep(0)
            setCycle((c) => c + 1)
          }, 1500)
        }
      }
    }, BEAT_MS)
    return () => clearInterval(timer)
    // `moves` comes from the plan, which is fixed for the session.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step, cycle])

  const finish = (done: boolean) => {
    if (!active) return
    const result = { actions: moves.map((m) => m.id), done, durationMs: Date.now() - (roundStart.current || Date.now()) }
    if (done) {
      const praise = moves.length > 1 ? 'Great moving!' : moves[0].praise
      complete(result, { title: praise, speech: praise })
    } else {
      complete(result, { reward: false })
    }
  }

  const action = moves[step]
  return (
    <div ref={boardRef} className="move-board">
      <div className="move-stage motion-essential">
        <Mascot mood="idle" pose={active ? action.id : undefined} size={size} />
      </div>
      <div className="move-label">
        {moves.map((m, i) => (
          <span key={i} className={i === step ? 'current' : ''}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="move-beats" aria-hidden="true">
        {Array.from({ length: BEATS_PER_ACTION }, (_, i) => (
          <span key={i} className={i < beat ? 'on' : ''} />
        ))}
      </div>
      {/* For the grown-up watching: only they can tell whether the child really did it. */}
      <div className="move-adult">
        <button type="button" className="btn move-skip" onClick={() => finish(false)}>
          Next
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button type="button" className="btn btn-primary move-done" onClick={() => finish(true)}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
          Did it
        </button>
      </div>
      {settings.calm ? null : <div className="move-floor" />}
    </div>
  )
}
