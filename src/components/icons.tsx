/** Small inline icons, sized by the surrounding font size. */

type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const HomeIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 11 12 3l9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-5h4v5" />
  </svg>
)

export const BackIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M15 5 8 12l7 7" />
  </svg>
)

export const GearIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M10.3 2.5h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9-2.6-.5v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
)

export const ChartIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const PlusIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const StarIcon = ({ size = 28, filled = true }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"
      fill={filled ? '#FFC94A' : '#E3ECF5'}
      stroke={filled ? '#F2A900' : '#C9D7E5'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)
