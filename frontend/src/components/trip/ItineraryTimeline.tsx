import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'
import type { ItineraryItemContext } from '@/types/trip'
import { dayLabels, itemsByDate, img } from '@/data/mock'

interface ItineraryTimelineProps {
  itinerary: ItineraryItemContext[]
  onAskVoyage?: (item: ItineraryItemContext) => void
}

function dayNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function formatDayHeading(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
}

export function ItineraryTimeline({ itinerary, onAskVoyage }: ItineraryTimelineProps) {
  const grouped = itemsByDate(itinerary)
  const dates = Array.from(grouped.keys()).sort()

  return (
    <div className="space-y-16">
      {dates.map((date, dayIndex) => (
        <div key={date}>
          <div className="mb-8 flex items-baseline gap-4">
            <span className="font-serif text-sm text-midnight/35">Day {dayNumber(dayIndex)}</span>
            <h3 className="font-serif text-2xl text-midnight sm:text-3xl">
              {dayLabels[date] ?? formatDayHeading(date)}
            </h3>
          </div>

          <div className="relative pl-8 sm:pl-10">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="absolute left-[9px] top-2 bottom-2 w-px bg-midnight/12 sm:left-[13px]"
            />

            <div className="space-y-10">
              {(grouped.get(date) ?? []).map((item, i) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative"
                >
                  <div className="absolute -left-8 top-1.5 h-2 w-2 rounded-full bg-terracotta sm:-left-10" />
                  <div className="flex items-start gap-4">
                    {item.start_time && (
                      <span className="w-12 shrink-0 pt-0.5 font-serif text-sm text-midnight/45">
                        {item.start_time}
                      </span>
                    )}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-midnight/5">
                      <img
                        src={img(`itinerary-${item.item_id}`, 200, 200)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="truncate font-serif text-lg text-midnight">{item.title}</p>
                      <p className="text-xs text-midnight/50">
                        {item.location} &middot; {item.category}
                      </p>
                    </div>
                    <button
                      onClick={() => onAskVoyage?.(item)}
                      className="mt-0.5 shrink-0 rounded-full p-1.5 text-midnight/35 transition-colors hover:bg-midnight/5 hover:text-midnight"
                      aria-label="Item actions"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
