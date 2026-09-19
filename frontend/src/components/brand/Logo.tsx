import { clsx } from 'clsx'
import { CompassMark } from './CompassMark'

interface LogoProps {
  variant?: 'dark' | 'light'
  withDescriptor?: boolean
  className?: string
}

export function Logo({ variant = 'dark', withDescriptor = false, className }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-midnight' : 'text-ivory'
  const dimColor = variant === 'dark' ? 'text-midnight/50' : 'text-ivory/60'

  return (
    <div className={clsx('flex items-center gap-2.5', className)}>
      <CompassMark size={22} className={textColor} />
      <div>
        <span className={clsx('font-serif text-lg tracking-tight', textColor)}>
          VOYAGE
        </span>
        {withDescriptor && (
          <div className={clsx('-mt-0.5 text-[10px] tracking-[0.18em]', dimColor)}>
            THE INTELLIGENT TRIP CONCIERGE
          </div>
        )}
      </div>
    </div>
  )
}
