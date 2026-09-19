import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { mockTripContext, homeRecommendations, img } from '@/data/mock'
import { TripContextStrip } from '@/components/trip/TripContextStrip'
import { RecommendationCard } from '@/components/place/RecommendationCard'
import { sendChatMessage } from '@/api/client'

const SUGGESTED_PROMPTS = [
  'Plan my first day',
  'Find somewhere quiet for dinner',
  'What should we do tonight?',
  'Make tomorrow more adventurous',
  'What if it rains tomorrow?',
]

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Home() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const trip = mockTripContext

  async function goToConciergeWith(query: string) {
    if (!query.trim() || sending) return
    setSending(true)
    // Pre-fetch isn't strictly needed here, but warms the mock/API path
    // before navigating so the concierge page can show the answer fast.
    sessionStorage.setItem('voyage:pending-query', query)
    await sendChatMessage(trip.trip_id, query).catch(() => null)
    navigate('/concierge')
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={img('voyage-hero-goa', 2000, 1400)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-midnight/20" />
        </motion.div>

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex min-h-[calc(100dvh-86px)] max-w-4xl flex-col justify-end px-6 pb-16 pt-40 sm:px-8 sm:pb-24"
        >
          <motion.p variants={heroItem} className="mb-4 text-xs tracking-[0.2em] text-ivory/60">
            THE INTELLIGENT TRIP CONCIERGE
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="max-w-2xl font-serif text-4xl leading-[1.08] text-ivory sm:text-6xl"
          >
            Your stay is booked.
            <br />
            Now the journey begins.
          </motion.h1>
          <motion.p variants={heroItem} className="mt-5 max-w-md text-base text-ivory/75 sm:text-lg">
            VOYAGE understands your trip and helps you make the most of every day.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8">
            <TripContextStrip trip={trip} variant="dark" />
          </motion.div>

          <motion.div variants={heroItem} className="mt-8">
            <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-2 py-2 pl-5 backdrop-blur-md">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToConciergeWith(input)}
                placeholder="What do you feel like doing?"
                className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none sm:text-base"
              />
              <button
                onClick={() => goToConciergeWith(input)}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta text-ivory transition-opacity disabled:opacity-30"
                aria-label="Ask VOYAGE"
              >
                <ArrowUp size={17} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={prompt}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.08 }}
                  onClick={() => goToConciergeWith(prompt)}
                  className="rounded-full border border-ivory/20 px-3.5 py-1.5 text-xs text-ivory/80 transition-colors hover:border-ivory/40 hover:bg-ivory/10"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* TRIP SNAPSHOT */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1fr_1.2fr] sm:items-center">
          <div>
            <p className="mb-3 text-xs tracking-[0.16em] text-midnight/45">DAY 01 OF 03</p>
            <h2 className="font-serif text-3xl text-midnight sm:text-4xl">
              Your journey, so far.
            </h2>
            <p className="mt-4 max-w-sm text-midnight/60">
              {trip.property.name} in {trip.property.location}, {' '}
              {new Date(trip.booking.check_in).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              through{' '}
              {new Date(trip.booking.check_out).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
              , for {trip.booking.number_of_guests} guests who like it {trip.guest.preferences.join(' and ')}.
            </p>
            <a
              href="/trip"
              className="mt-6 inline-block border-b border-midnight/30 pb-0.5 text-sm text-midnight transition-colors hover:border-midnight"
            >
              View full itinerary
            </a>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl"
          >
            <img src={img('voyage-trip-snapshot', 1200, 800)} alt="" className="h-72 w-full object-cover sm:h-80" />
          </motion.div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <h2 className="font-serif text-3xl text-midnight sm:text-4xl">Made for this trip.</h2>
        <p className="mt-2 max-w-md text-midnight/55">
          Not the most popular places. The places that make sense for you.
        </p>
        <div className="mt-8 flex gap-5 overflow-x-auto rail pb-2">
          {homeRecommendations.map((place, i) => (
            <RecommendationCard key={place.name} place={place} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
