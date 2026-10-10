import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './HoldButton.css'

/**
 * A button that only fires after being held, so a child cannot leave a game by accident.
 * The ring fills while held; the therapist learns this once.
 */
export function HoldButton({
  onHold,
  label,
  children,
  holdMs = 1200,
}: {
  onHold: () => void
  label: string
  children: ReactNode
  holdMs?: number
}) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const start = () => {
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      onHold()
    }, holdMs)
  }
  const cancel = () => {
    setHolding(false)
    clearTimeout(timer.current)
  }

  return (
    <button
      type="button"
      className={`hold-btn btn btn-round ${holding ? 'holding' : ''}`}
      style={{ '--hold-ms': `${holdMs}ms` } as CSSProperties}
      aria-label={`${label} (press and hold)`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg className="hold-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" />
      </svg>
      {children}
    </button>
  )
}
