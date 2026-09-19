import { motion } from 'framer-motion'
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import type { ItineraryItemContext } from '@/types/trip'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'

interface MapViewProps {
  propertyName: string
  itinerary: ItineraryItemContext[]
}

// Deterministic pseudo-coordinates spread across the canvas so pins don't
// overlap and stay stable across renders, without needing a real map SDK.
function pinPosition(seed: number) {
  const x = 18 + ((seed * 37) % 64)
  const y = 15 + ((seed * 53) % 62)
  return { left: `${x}%`, top: `${y}%` }
}

export function MapView({ propertyName, itinerary }: MapViewProps) {
  const [selected, setSelected] = useState<ItineraryItemContext | null>(null)

  return (
    <div className="relative h-[420px] overflow-hidden rounded-3xl bg-teal-deep sm:h-[520px]">
      {/* stylized terrain texture */}
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 400 400" preserveAspectRatio="none">
        <path d="M0 260 C 80 220, 140 300, 220 250 S 340 200, 400 240 V400 H0 Z" fill="#2C6E6A" />
        <path d="M0 320 C 100 290, 180 350, 260 310 S 360 280, 400 310 V400 H0 Z" fill="#245855" />
      </svg>

      <div className="absolute left-6 top-6 rounded-full bg-ivory/95 px-3 py-1.5 text-xs font-medium text-midnight shadow">
        {propertyName}
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ left: '44%', top: '48%' }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-3 w-3 rounded-full border-2 border-ivory bg-terracotta shadow-lg" />
      </motion.div>

      {itinerary.map((item, i) => {
        const pos = pinPosition(item.item_id + i)
        return (
          <motion.button
            key={item.item_id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 + i * 0.06 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => setSelected(item)}
            style={pos}
            className="absolute -translate-x-1/2 -translate-y-full text-ivory drop-shadow-lg"
          >
            <MapPin size={26} fill="#F7F2E9" className="text-midnight" strokeWidth={1.5} />
          </motion.button>
        )
      })}

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <p className="text-xs tracking-[0.14em] text-midnight/45">
              {selected.location.toUpperCase()} &middot; {selected.category.toUpperCase()}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-midnight">{selected.title}</h3>
            <p className="mt-2 text-sm text-midnight/60">Part of your itinerary.</p>
            <div className="mt-5 flex gap-3">
              <Button size="sm">View</Button>
              <Button size="sm" variant="ghost">
                Ask VOYAGE
              </Button>
              <Button size="sm" variant="ghost" className="text-terracotta">
                Remove
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
