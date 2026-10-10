import type { ReactNode } from 'react'
import { useNavigate, Link } from 'react-router'
import { sound } from '../audio/sound'
import { BackIcon } from '../components/icons'
import { childSettings, db, deleteChild, type ChildSettings, type Difficulty, type Tolerance } from '../db/db'
import { useChild } from '../hooks/useChild'
import { NotFound } from './NotFound'
import './Settings.css'

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <span />
    </button>
  )
}

function Row({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-title">{title}</div>
        <div className="setting-hint muted">{hint}</div>
      </div>
      {children}
    </div>
  )
}

export function Settings() {
  const child = useChild()
  const navigate = useNavigate()
  if (child === undefined) return null
  if (child === null) return <NotFound />

  const settings = childSettings(child)
  const update = (patch: Partial<ChildSettings>) => {
    void db.children.update(child.id, { settings: { ...settings, ...patch } })
  }

  const remove = async () => {
    if (!confirm(`Delete ${child.name} and all of their results? This cannot be undone.`)) return
    await deleteChild(child.id)
    navigate('/', { replace: true })
  }

  return (
    <div className="screen">
      <div className="topbar">
        <Link to=".." relative="path" className="btn btn-round" aria-label="Back" onClick={() => sound.tap()}>
          <BackIcon />
        </Link>
        <h1>{child.name}'s settings</h1>
      </div>

      <div className="screen-scroll">
        <div className="settings-list">
          <section className="card">
            <h2>Games</h2>
            <Row title="Difficulty" hint="Connect the Dots: 3×3, 4×4 or 5×5 dots with longer pictures.">
              <Segmented<Difficulty>
                value={settings.difficulty}
                onChange={(difficulty) => update({ difficulty })}
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />
            </Row>
            <Row title="Rounds per session" hint="How many pictures before the big celebration.">
              <Segmented<number>
                value={settings.rounds}
                onChange={(rounds) => update({ rounds })}
                options={[1, 2, 3, 5, 8].map((n) => ({ value: n, label: String(n) }))}
              />
            </Row>
            <Row title="Touch target size" hint="How close the finger must get to a dot. Larger is more forgiving.">
              <Segmented<Tolerance>
                value={settings.tolerance}
                onChange={(tolerance) => update({ tolerance })}
                options={[
                  { value: 'large', label: 'Large' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'small', label: 'Small' },
                ]}
              />
            </Row>
            <Row title="Show guide" hint="Faint outline of the picture and dashes showing the way.">
              <Toggle label="Show guide" value={settings.guide} onChange={(guide) => update({ guide })} />
            </Row>
          </section>

          <section className="card">
            <h2>Senses</h2>
            <Row title="Calm mode" hint="Fewer effects, softer sounds, gentler animation. For sensory-sensitive children.">
              <Toggle label="Calm mode" value={settings.calm} onChange={(calm) => update({ calm })} />
            </Row>
            <Row title="Spoken instructions" hint="Reads the instructions aloud at the start of a game.">
              <Toggle label="Spoken instructions" value={settings.voice} onChange={(voice) => update({ voice })} />
            </Row>
            <Row title="Volume" hint="Game sounds and music.">
              <input
                className="slider"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.volume}
                aria-label="Volume"
                onChange={(e) => update({ volume: Number(e.target.value) })}
                onPointerUp={(e) => {
                  sound.unlock()
                  sound.configure({ volume: Number(e.currentTarget.value), calm: settings.calm })
                  sound.step(0)
                }}
              />
            </Row>
          </section>

          <section className="card danger-zone">
            <Row title={`Delete ${child.name}`} hint="Removes this child and every result on this device.">
              <button type="button" className="btn btn-danger" onClick={remove}>
                Delete
              </button>
            </Row>
          </section>
        </div>
      </div>
    </div>
  )
}
