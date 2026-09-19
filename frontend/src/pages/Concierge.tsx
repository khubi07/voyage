import { useEffect, useState } from 'react'

import { getTripContext } from '@/api/client'
import type { TripContext } from '@/types/trip'

import { TripContextStrip } from '@/components/trip/TripContextStrip'
import { ConciergeChat } from '@/components/concierge/ConciergeChat'

const TRIP_ID = 2

export function Concierge() {
  const [trip, setTrip] = useState<TripContext | null>(null)
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrip() {
      try {
        console.log("Loading real trip from backend...")
        const context = await getTripContext(TRIP_ID)
        console.log("REAL TRIP CONTEXT:", context)
        setTrip(context)
      } catch (err) {
        console.error('Failed to load trip:', err)
        setError('Unable to load your trip.')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [])

  useEffect(() => {
    const q = sessionStorage.getItem('voyage:pending-query')

    if (q) {
      sessionStorage.removeItem('voyage:pending-query')
      setPendingQuery(q)
    }
  }, [])

  if (loading) {
    return <div className="p-8">Loading your trip...</div>
  }

  if (error || !trip) {
    return <div className="p-8">{error ?? 'Trip not found.'}</div>
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-3xl flex-col px-6 pb-4 pt-8 sm:px-8">
      <div>
        <p className="text-xs tracking-[0.16em] text-midnight/45">
          YOUR CONCIERGE
        </p>

        <h1 className="mt-1 font-serif text-3xl text-midnight sm:text-4xl">
          Tell VOYAGE what you need.
        </h1>

        <TripContextStrip trip={trip} className="mt-3" />
      </div>

      <div className="mt-6 min-h-0 flex-1">
        <ConciergeChat
          tripId={trip.trip_id}
          trip={trip}
          initialQuery={pendingQuery}
          key={pendingQuery ?? 'default'}
        />
      </div>
    </div>
  )
}