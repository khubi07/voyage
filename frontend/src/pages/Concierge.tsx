import { useEffect, useState } from 'react'
import { mockTripContext } from '@/data/mock'
import { TripContextStrip } from '@/components/trip/TripContextStrip'
import { ConciergeChat } from '@/components/concierge/ConciergeChat'

export function Concierge() {
  const trip = mockTripContext
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)

  useEffect(() => {
    const q = sessionStorage.getItem('voyage:pending-query')
    if (q) {
      sessionStorage.removeItem('voyage:pending-query')
      setPendingQuery(q)
    }
  }, [])

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-3xl flex-col px-6 pb-4 pt-8 sm:px-8">
      <div>
        <p className="text-xs tracking-[0.16em] text-midnight/45">YOUR CONCIERGE</p>
        <h1 className="mt-1 font-serif text-3xl text-midnight sm:text-4xl">
          Tell VOYAGE what you need.
        </h1>
        <TripContextStrip trip={trip} className="mt-3" />
      </div>

      <div className="mt-6 min-h-0 flex-1">
        <ConciergeChat tripId={trip.trip_id} initialQuery={pendingQuery} key={pendingQuery ?? 'default'} />
      </div>
    </div>
  )
}
