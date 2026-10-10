import { useEffect, useRef, useState } from 'react'
import { Art } from '../../art/Art'
import type { ArtId } from '../../art/art'
import { sound } from '../../audio/sound'
import { speech } from '../../audio/speech'
import type { Difficulty } from '../../db/db'
import type { RoundProps } from '../types'
import './Pairs.css'

export interface PairsRoundResult {
  pairs: number
  flips: number
  mismatches: number
  durationMs: number
}

/** How long all cards are shown face up at the start of a round. */
const PEEK_MS: Record<Difficulty, number> = { easy: 2500, medium: 2200, hard: 1800 }

export interface Card {
  id: number
  animal: { id: ArtId; name: string }
}

export function PairsRound({ round, level, plan, active, complete }: RoundProps<PairsRoundResult, Card[][]>) {
  const cards = plan[round]
  const [peeking, setPeeking] = useState(true)
  const [up, setUp] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wiggle, setWiggle] = useState<number[]>([])
  const stats = useRef({ startedAt: 0, flips: 0, mismatches: 0 })
  const busy = useRef(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const [board, setBoard] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = boardRef.current!
    const ro = new ResizeObserver(() => setBoard({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Peekaboo: show everything, then hide. Waits until the game is active (after the intro).
  useEffect(() => {
    if (!active || !peeking) return
    const t = setTimeout(() => {
      setPeeking(false)
      sound.flip()
      speech.say('Peekaboo! Find the pairs.')
      stats.current.startedAt = Date.now()
    }, PEEK_MS[level])
    return () => clearTimeout(t)
  }, [active, peeking, level])

  const flip = (card: Card) => {
    if (!active || peeking || busy.current || up.includes(card.id) || matched.has(card.id)) return
    stats.current.flips++
    sound.flip()
    speech.say(card.animal.name)
    const nowUp = [...up, card.id]
    setUp(nowUp)
    if (nowUp.length < 2) return

    busy.current = true
    const [a, b] = nowUp.map((id) => cards[id])
    if (a.animal.id === b.animal.id) {
      setTimeout(() => {
        const next = new Set(matched).add(a.id).add(b.id)
        setMatched(next)
        setUp([])
        busy.current = false
        sound.match()
        if (next.size === cards.length) {
          setTimeout(
            () =>
              complete(
                {
                  pairs: cards.length / 2,
                  flips: stats.current.flips,
                  mismatches: stats.current.mismatches,
                  durationMs: Date.now() - stats.current.startedAt,
                },
                { title: 'All pairs!', speech: 'You found them all!' },
              ),
            900,
          )
        }
      }, 450)
    } else {
      stats.current.mismatches++
      setTimeout(() => setWiggle(nowUp), 600)
      setTimeout(() => {
        setUp([])
        setWiggle([])
        busy.current = false
        sound.flip()
      }, 1300)
    }
  }

  const n = cards.length
  // Landscape boards fit more columns; portrait boards stack more rows.
  const landscape = board.w >= board.h
  const columns = n <= 4 ? (landscape ? n : 2) : landscape ? n / 2 : n <= 6 ? 2 : 2
  const rows = Math.ceil(n / columns)
  const gap = Math.max(12, Math.min(board.w, board.h) * 0.03)
  const card = Math.max(0, Math.min((board.w - 40 - gap * (columns - 1)) / columns, (board.h - 40 - gap * (rows - 1)) / rows, 280))

  return (
    <div ref={boardRef} className="pairs-board">
      <div className="pairs-grid" style={{ gridTemplateColumns: `repeat(${columns}, ${card}px)`, gridAutoRows: `${card}px`, gap }}>
        {cards.map((card) => {
          const faceUp = peeking || up.includes(card.id) || matched.has(card.id)
          return (
            <button
              key={card.id}
              type="button"
              data-animal={card.animal.id}
              className={`pairs-card ${faceUp ? 'up' : ''} ${matched.has(card.id) ? 'matched' : ''} ${wiggle.includes(card.id) ? 'wiggle' : ''}`}
              onPointerDown={() => flip(card)}
              aria-label={faceUp ? card.animal.name : 'Hidden card'}
            >
              <span className="pairs-inner">
                <span className="pairs-back" />
                <span className="pairs-front">
                  <Art id={card.animal.id} size="78%" />
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
