interface CompassMarkProps {
  size?: number
  className?: string
}

// Abstract compass + wave symbol. Deliberately not a literal compass rose
// or airplane — a single needle arcing into a wave line underneath.
export function CompassMark({ size = 24, className }: CompassMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="13" r="10.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M20.5 8.5L14 14.5L11.5 19L18 13L20.5 8.5Z"
        fill="currentColor"
      />
      <path
        d="M3 25.5C5.5 23.5 8.5 23.5 11 25.5C13.5 27.5 16.5 27.5 19 25.5C21.5 23.5 24.5 23.5 29 25.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
