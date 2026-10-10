import { Link } from 'react-router'
import { Mascot } from '../components/Mascot'

export function NotFound() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Mascot mood="idle" size={140} />
      <h2>Oops, nothing here.</h2>
      <Link to="/" className="btn btn-sky">
        Go home
      </Link>
    </div>
  )
}
