import { useEffect, useState } from 'react'

import { getTripContext } from '@/api/client'
import type { TripContext } from '@/types/trip'

import { TripContextStrip } from '@/components/trip/TripContextStrip'
import { ConciergeChat } from '@/components/concierge/ConciergeChat'

import { getNotifications } from '@/api/client'

const TRIP_ID = Number(import.meta.env.VITE_TRIP_ID ?? 1)

export function Concierge() {
  const [trip, setTrip] = useState<TripContext | null>(null)
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<
    { message: string; read: boolean }[]
  >([])

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
    if (!trip) return
    const tripId = trip.trip_id

    async function loadNotifications() {
      try {
        const data = await getNotifications(tripId)
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    loadNotifications()

    const interval = setInterval(loadNotifications, 10000)

    return () => clearInterval(interval)
  }, [trip])

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

      {notifications.length > 0 && (
        <div className="mb-4 rounded-2xl border border-midnight/10 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-midnight/45">
            Trip update
          </p>

          <p className="mt-1 text-sm text-midnight">
            🌧️ {notifications[notifications.length - 1].message}
          </p>
        </div>
      )}

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