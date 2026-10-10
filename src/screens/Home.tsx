import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { sound } from '../audio/sound'
import { Avatar } from '../components/Avatar'
import { AVATAR_COLORS } from '../components/avatarColors'
import { GearIcon, PlusIcon } from '../components/icons'
import { Mascot } from '../components/Mascot'
import { db, defaultSettings } from '../db/db'
import './Home.css'

export function Home() {
  const children = useLiveQuery(() => db.children.orderBy('name').toArray())
  const [adding, setAdding] = useState(false)

  return (
    <div className="screen">
      <div className="topbar">
        <h1>Who is playing?</h1>
        <Link to="/tools" className="btn btn-round" aria-label="Therapist tools" onClick={() => sound.tap()}>
          <GearIcon />
        </Link>
      </div>

      <div className="screen-scroll">
        <div className="child-grid">
          {children?.map((child) => (
            <Link key={child.id} to={`/child/${child.id}`} className="child-card card" onClick={() => sound.tap()}>
              <Avatar name={child.name} color={child.color} />
              <span className="child-name">{child.name}</span>
            </Link>
          ))}
          <button type="button" className="child-card card add-card" onClick={() => setAdding(true)}>
            <div className="add-circle">
              <PlusIcon size={44} />
            </div>
            <span className="child-name">Add child</span>
          </button>
        </div>

        {children?.length === 0 && (
          <div className="home-welcome">
            <Mascot mood="idle" size={160} />
            <p className="muted">Hi! I'm Pip. Add a child to get started.</p>
          </div>
        )}
      </div>

      {adding && <AddChildDialog onClose={() => setAdding(false)} />}
    </div>
  )
}

function AddChildDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const id = await db.children.add({ name: name.trim(), color, createdAt: Date.now(), settings: defaultSettings })
    navigate(`/child/${id}`)
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form className="dialog card" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h2>New child</h2>
        <div className="dialog-preview">
          <Avatar name={name || '?'} color={color} size={80} />
          <input
            className="text-input"
            autoFocus
            placeholder="Name"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="color-row" role="radiogroup" aria-label="Colour">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === color}
              aria-label={c}
              className={`color-dot ${c === color ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
