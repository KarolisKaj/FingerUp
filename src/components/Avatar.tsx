export function Avatar({ name, color, size = 96 }: { name: string; color: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.45,
        fontWeight: 800,
        boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}
