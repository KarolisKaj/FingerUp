import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { sound } from '../audio/sound'
import { BackIcon } from '../components/icons'
import { db, type Session } from '../db/db'
import { summarize, type ConnectDotsData } from '../games/connectDots/results'
import { games } from '../games/registry'
import { useChild } from '../hooks/useChild'
import { NotFound } from './NotFound'
import './Progress.css'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const fmt = (n: number | null, digits = 0) => (n === null ? '–' : n.toFixed(digits))
const minutes = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}`

export function Progress() {
  const child = useChild()
  const sessions = useLiveQuery(
    () => (child ? db.sessions.where('childId').equals(child.id).reverse().sortBy('startedAt') : []),
    [child?.id],
  )
  if (child === undefined || sessions === undefined) return null
  if (child === null) return <NotFound />

  const dots = sessions.filter((s) => s.gameId === 'connect-dots') as Session<ConnectDotsData>[]
  const recent = dots.slice(0, 5).map((s) => summarize(s.data))
  const avg = (key: 'lineControl' | 'secondsPerLine') => {
    const values = recent.map((r) => r[key]).filter((v): v is number => v !== null)
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
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
          <div className="stat-row">
            <Stat label="Sessions" value={String(sessions.length)} />
            <Stat label="Line control (last 5)" value={avg('lineControl') === null ? '–' : `${fmt(avg('lineControl'))}%`} />
            <Stat label="Seconds per line (last 5)" value={fmt(avg('secondsPerLine'), 1)} />
          </div>

          {sessions.length === 0 ? (
            <div className="card muted">No sessions yet. Results appear here after each game.</div>
          ) : (
            <div className="card table-card">
              <table className="results">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Game</th>
                    <th>Level</th>
                    <th>Pictures</th>
                    <th>Misses</th>
                    <th title="How closely the finger followed the straight line">Line control</th>
                    <th>Sec / line</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const game = games.find((g) => g.id === s.gameId)
                    const sum = s.gameId === 'connect-dots' ? summarize(s.data as ConnectDotsData) : null
                    return (
                      <tr key={s.id}>
                        <td>{dateFormat.format(s.startedAt)}</td>
                        <td>
                          {game?.title ?? s.gameId}
                          {!s.completed && <span className="tag">left early</span>}
                        </td>
                        <td className="cap">{s.settings.difficulty}</td>
                        <td>{sum?.pictures ?? '–'}</td>
                        <td>{sum?.misses ?? '–'}</td>
                        <td>{sum?.lineControl === null || !sum ? '–' : `${sum.lineControl}%`}</td>
                        <td>{fmt(sum?.secondsPerLine ?? null, 1)}</td>
                        <td>{minutes(s.durationMs)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted note">
            <b>Line control</b> measures how closely the finger stayed on the straight line between dots (100% = right on
            the line). <b>Misses</b> are lifts of the finger before reaching the star. The child never sees these numbers.
          </p>
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
