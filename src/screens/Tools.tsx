import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { sound } from '../audio/sound'
import { BackIcon } from '../components/icons'
import { exportBackup, readBackup, restoreBackup } from '../db/backup'

export function Tools() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const restore = async (file: File | undefined) => {
    if (!file) return
    try {
      const backup = await readBackup(file)
      const ok = confirm(
        `Restore ${backup.children.length} children and ${backup.sessions.length} sessions from ${backup.exportedAt.slice(0, 10)}?\n\nThis REPLACES everything currently on this device.`,
      )
      if (!ok) return
      await restoreBackup(backup)
      setMessage('Backup restored.')
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <Link to="/" className="btn btn-round" aria-label="Back" onClick={() => sound.tap()}>
          <BackIcon />
        </Link>
        <h1>Therapist tools</h1>
      </div>
      <div className="screen-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2>Backup</h2>
            <p className="muted" style={{ margin: 0 }}>
              All children and results are stored only on this device. Save a backup now and then (for example to
              Files, Drive or email) so nothing is lost if the browser data is cleared or the tablet is replaced.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sky" onClick={() => void exportBackup()}>
                Save backup
              </button>
              <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
                Restore from backup…
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => void restore(e.target.files?.[0])}
              />
            </div>
            {message && <p style={{ margin: 0, fontWeight: 700 }}>{message}</p>}
          </section>

          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2>Tips</h2>
            <ul className="muted" style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6 }}>
              <li>Add FingerUp to the Home Screen (Share → Add to Home Screen) so it runs full screen and offline.</li>
              <li>
                Use <b>Guided Access</b> on iPad (Settings → Accessibility) or <b>App Pinning</b> on Android to keep the
                child inside the app.
              </li>
              <li>To leave a game, press and hold the home button until the ring fills.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
