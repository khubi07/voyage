import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockTripContext, img } from '@/data/mock'
import { Tabs } from '@/components/ui/Tabs'
import { ItineraryTimeline } from '@/components/trip/ItineraryTimeline'
import { MapView } from '@/components/trip/MapView'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

const TABS = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'map', label: 'Map' },
  { id: 'details', label: 'Details' },
]

export function MyTrip() {
  const [tab, setTab] = useState('itinerary')
  const trip = mockTripContext
  const hasItinerary = trip.itinerary.length > 0

  return (
    <div className="mx-auto max-w-4xl px-6 pb-28 pt-10 sm:px-8 sm:pt-14">
      <p className="text-xs tracking-[0.16em] text-midnight/45">MY TRIP</p>
      <h1 className="mt-2 font-serif text-4xl text-midnight sm:text-5xl">Your Goa story.</h1>
      <div className="mt-4 text-sm text-midnight/55">
        {trip.property.name} &middot; {trip.property.location}
        <br />
        {new Date(trip.booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        {' \u2014 '}
        {new Date(trip.booking.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        {' \u00b7 '}
        {trip.booking.number_of_guests} guests
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mt-8" />

      <div className="mt-10">
        {tab === 'itinerary' &&
          (hasItinerary ? (
            <>
              <ItineraryTimeline itinerary={trip.itinerary} />
              <div className="mt-14 flex flex-wrap gap-3 border-t border-midnight/10 pt-8">
                <Button variant="secondary">+ Add to itinerary</Button>
                <Button variant="outline-light" className="border-midnight/20 text-midnight hover:bg-midnight/5">
                  Plan with VOYAGE
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              heading="A blank day is a good place to start."
              action={<Button>Plan with VOYAGE</Button>}
            />
          ))}

        {tab === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <MapView propertyName={trip.property.name} itinerary={trip.itinerary} />
          </motion.div>
        )}

        {tab === 'details' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 sm:grid-cols-[1fr_1.1fr]"
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[0.14em] text-midnight/40">PROPERTY</p>
                <p className="mt-1 font-serif text-2xl text-midnight">{trip.property.name}</p>
                <p className="text-sm text-midnight/55">{trip.property.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs tracking-[0.14em] text-midnight/40">CHECK-IN</p>
                  <p className="mt-1 text-sm text-midnight">{trip.property.check_in_time}</p>
                </div>
                <div>
                  <p className="text-xs tracking-[0.14em] text-midnight/40">CHECK-OUT</p>
                  <p className="mt-1 text-sm text-midnight">{trip.property.check_out_time}</p>
                </div>
              </div>
              <div>
                <p className="text-xs tracking-[0.14em] text-midnight/40">PARKING</p>
                <p className="mt-1 text-sm text-midnight/70">{trip.property.parking_info}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.14em] text-midnight/40">PREFERENCES</p>
                <p className="mt-1 text-sm text-midnight/70">
                  {trip.guest.preferences.join(' \u00b7 ')}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl">
              <img src={img('voyage-property-detail', 1000, 900)} alt="" className="h-full w-full object-cover" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
