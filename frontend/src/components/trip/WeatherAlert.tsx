import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { CloudRain, ArrowRight, Clock } from 'lucide-react'
import type { ItineraryItemContext, Recommendation } from '@/types/trip'
import { Button } from '@/components/ui/Button'

interface WeatherAlertProps {
  affectedItem: ItineraryItemContext
  alternatives: Recommendation[]
  message: string
}

type Stage = 'suggested' | 'swapped' | 'kept'

export function WeatherAlert({ affectedItem, alternatives, message }: WeatherAlertProps) {
  const [stage, setStage] = useState<Stage>('suggested')
  const [chosen, setChosen] = useState<Recommendation | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-3xl border border-midnight/10 bg-midnight text-ivory"
    >
      <div className="flex items-center gap-2.5 border-b border-ivory/10 px-6 py-4">
        <CloudRain size={17} className="text-seafoam" />
        <span className="text-sm font-medium tracking-tight">A change of plans</span>
      </div>

      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {stage === 'suggested' && (
            <motion.div
              key="suggested"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-serif text-2xl leading-snug sm:text-[28px]">
                Tomorrow needs a backup plan.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/70">{message}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <motion.div
                  animate={{ opacity: [1, 0.55, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="flex-1 rounded-2xl border border-ivory/15 bg-ivory/5 px-4 py-3"
                >
                  <p className="text-[10px] tracking-[0.14em] text-ivory/45">CURRENT</p>
                  <p className="mt-1 font-serif text-base">{affectedItem.title}</p>
                  <p className="flex items-center gap-1 text-xs text-ivory/50">
                    <Clock size={11} /> {affectedItem.start_time}
                  </p>
                </motion.div>
                <ArrowRight size={16} className="mx-auto shrink-0 text-ivory/40 sm:mx-0" />
                <div className="flex-1 rounded-2xl border border-seafoam/30 bg-seafoam/10 px-4 py-3">
                  <p className="text-[10px] tracking-[0.14em] text-seafoam">SUGGESTED</p>
                  <p className="mt-1 font-serif text-base">
                    {alternatives[0]?.name ?? 'Indoor alternative'}
                  </p>
                  <p className="text-xs text-ivory/50">{affectedItem.start_time}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto rail pb-1">
                {alternatives.map((alt, i) => (
                  <motion.button
                    key={alt.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    onClick={() => setChosen(alt)}
                    className={`w-48 shrink-0 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      chosen?.name === alt.name
                        ? 'border-seafoam bg-seafoam/10'
                        : 'border-ivory/15 hover:border-ivory/30'
                    }`}
                  >
                    <p className="font-serif text-sm leading-tight">{alt.name}</p>
                    <p className="mt-1 text-[11px] text-ivory/50">
                      {alt.area} &middot; {alt.category}
                    </p>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  className="bg-seafoam text-midnight hover:bg-seafoam/90"
                  onClick={() => setStage('swapped')}
                >
                  Swap plan
                </Button>
                <Button variant="outline-light" onClick={() => setStage('kept')}>
                  Keep my plan
                </Button>
                <button className="text-xs text-ivory/50 underline-offset-4 hover:text-ivory/80 hover:underline">
                  More options
                </button>
              </div>

              <p className="mt-5 text-[11px] tracking-wide text-ivory/40">
                WAITING FOR YOUR CONFIRMATION
              </p>
            </motion.div>
          )}

          {stage === 'swapped' && (
            <motion.div
              key="swapped"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="py-4 text-center"
            >
              <p className="font-serif text-2xl">Your trip is still on track.</p>
              <p className="mt-2 text-sm text-ivory/60">
                {affectedItem.title} has been swapped for{' '}
                {chosen?.name ?? alternatives[0]?.name}.
              </p>
            </motion.div>
          )}

          {stage === 'kept' && (
            <motion.div
              key="kept"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="py-4 text-center"
            >
              <p className="font-serif text-2xl">Noted &mdash; plan unchanged.</p>
              <p className="mt-2 text-sm text-ivory/60">
                We&rsquo;ll keep an eye on the forecast for {affectedItem.title}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
