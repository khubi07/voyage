import type { TripContext } from '@/types/trip'
import { clsx } from 'clsx'

interface TripContextStripProps {
  trip: TripContext
  variant?: 'light' | 'dark'
  className?: string
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
}

export function TripContextStrip({ trip, variant = 'light', className }: TripContextStripProps) {
  const dim = variant === 'dark' ? 'text-ivory/60' : 'text-midnight/50'
  const main = variant === 'dark' ? 'text-ivory' : 'text-midnight'

  return (
    <div className={clsx('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}>
      <span className={clsx('font-medium', main)}>{trip.property.name}</span>
      <span className={dim}>&middot;</span>
      <span className={dim}>{trip.property.location}</span>
      <span className={dim}>&middot;</span>
      <span className={dim}>
        {formatDate(trip.booking.check_in)} &ndash; {formatDate(trip.booking.check_out)}
      </span>
      <span className={dim}>&middot;</span>
      <span className={dim}>
        {trip.booking.number_of_guests} guest{trip.booking.number_of_guests > 1 ? 's' : ''}
      </span>
      {trip.guest.preferences.length > 0 && (
        <>
          <span className={dim}>&middot;</span>
          <span className={dim}>{trip.guest.preferences.join(' \u00b7 ')}</span>
        </>
      )}
    </div>
  )
}
