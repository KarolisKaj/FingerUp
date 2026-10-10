import { StarIcon } from './icons'
import './StarJar.css'

/** One star per finished round. There is no rating: every finished round earns its star. */
export function StarJar({ earned, total }: { earned: number; total: number }) {
  return (
    <div className="star-jar" aria-label={`${earned} of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < earned ? 'star-earned' : ''}>
          <StarIcon size={34} filled={i < earned} />
        </span>
      ))}
    </div>
  )
}
