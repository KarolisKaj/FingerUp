import type { CSSProperties } from 'react'
import { artUrl, type ArtId } from './art'

export function Art({
  id,
  size,
  className,
  style,
}: {
  id: ArtId
  size?: number | string
  className?: string
  style?: CSSProperties
}) {
  return (
    <img
      src={artUrl(id)}
      alt=""
      draggable={false}
      className={className}
      style={{ width: size, height: size, display: 'block', pointerEvents: 'none', ...style }}
    />
  )
}
