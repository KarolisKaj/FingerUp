import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router'
import { sound } from '../audio/sound'
import { BackIcon } from '../components/icons'
import { db, type Difficulty, type Session } from '../db/db'
import { games } from '../games/registry'
import type { SessionData } from '../games/types'
import { useChild } from '../hooks/useChild'
import { NotFound } from './NotFound'
import './Progress.css'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const minutes = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000) % 60).padStart(2, '0')}`

// Sessions saved before per-game levels stored `difficulty` instead of `level`.
type StoredData = Partial<SessionData> & { difficulty?: Difficulty }
const levelOf = (s: Session) => (s.data as StoredData).level ?? (s.data as StoredData).difficulty ?? s.settings.difficulty
const roundsOf = (s: Session) => (s.data as StoredData).rounds ?? []

export function Progress() {
  const child = useChild()
  const sessions = useLiveQuery(
    () => (child ? db.sessions.where('childId').equals(child.id).reverse().sortBy('startedAt') : []),
    [child?.id],
  )
  const [selected, setSelected] = useState<string | null>(null)
  if (child === undefined || sessions === undefined) return null
  if (child === null) return <NotFound />

  const played = games.filter((g) => sessions.some((s) => s.gameId === g.id))
  const game = played.find((g) => g.id === selected) ?? played[0]
  const rows = game ? sessions.filter((s) => s.gameId === game.id) : []
  const recent = rows.slice(0, 5)
  const average = (index: number) => {
    const values = recent.map((s) => game!.metrics[index].value(roundsOf(s))).filter((v): v is number => v !== null)
    return values.length ? game!.metrics[index].format(values.reduce((a, b) => a + b, 0) / values.length) : '–'
  }

  return (
    <div className="screen">
      <div className="topbar">
        <Link to=".." relative="path" className="btn btn-round" aria-label="Back" onClick={() => sound.tap()}>
          <BackIcon />
        </Link>
        <h1>{child.name}'s progress</h1>
      </div>

      <div className="screen-scroll">
        <div className="progress-wrap">
          {!game ? (
            <div className="card muted">No sessions yet. Results appear here after each game.</div>
          ) : (
            <>
              <div className="game-tabs" role="tablist">
                {played.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    aria-selected={g === game}
                    className={g === game ? 'active' : ''}
                    style={g === game ? { background: g.color } : undefined}
                    onClick={() => setSelected(g.id)}
                  >
                    {g.title}
                    <span className="tab-count">{sessions.filter((s) => s.gameId === g.id).length}</span>
                  </button>
                ))}
              </div>

              <p className="muted skill-line">
                <b>Practises:</b> {game.skill}
              </p>

              <div className="stat-row">
                <Stat label="Sessions" value={String(rows.length)} />
                {game.metrics.slice(0, 3).map((m, i) => (
                  <Stat key={m.label} label={`${m.label} (last 5)`} value={average(i)} />
                ))}
              </div>

              <div className="card table-card">
                <table className="results">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Level</th>
                      <th>Rounds</th>
                      {game.metrics.map((m) => (
                        <th key={m.label} title={m.hint}>
                          {m.label}
                        </th>
                      ))}
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => {
                      const rounds = roundsOf(s)
                      return (
                        <tr key={s.id}>
                          <td>
                            {dateFormat.format(s.startedAt)}
                            {!s.completed && <span className="tag">left early</span>}
                          </td>
                          <td className="cap">{levelOf(s)}</td>
                          <td>{rounds.length}</td>
                          {game.metrics.map((m) => {
                            const v = m.value(rounds)
                            return <td key={m.label}>{v === null ? '–' : m.format(v)}</td>
                          })}
                          <td>{minutes(s.durationMs)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {game.metrics.some((m) => m.hint) && (
                <p className="muted note">
                  {game.metrics
                    .filter((m) => m.hint)
                    .map((m) => (
                      <span key={m.label}>
                        <b>{m.label}:</b> {m.hint}.{' '}
                      </span>
                    ))}
                  The child never sees these numbers.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label muted">{label}</div>
    </div>
  )
}
