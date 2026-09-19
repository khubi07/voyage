import { motion } from 'framer-motion'
import { useState } from 'react'
import { Bookmark, Plus, Check } from 'lucide-react'
import type { Recommendation } from '@/types/trip'
import { useToast } from '@/components/ui/Toast'

interface RecommendationCardProps {
  place: Recommendation
  index?: number
  onOpen?: () => void
}

export function RecommendationCard({ place, index = 0, onOpen }: RecommendationCardProps) {
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)
  const { show } = useToast()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group w-64 shrink-0 sm:w-72"
    >
      <button
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-2xl bg-midnight/5 text-left"
      >
        <div className="relative h-40 overflow-hidden sm:h-44">
          {place.image && (
            <motion.img
              src={place.image}
              alt={place.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}
          <div className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2.5 py-1 text-[10px] font-medium tracking-wide text-midnight backdrop-blur-sm">
            Matches your trip
          </div>
        </div>
      </button>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-lg leading-tight text-midnight">{place.name}</p>
            <p className="mt-0.5 text-xs text-midnight/50">
              {place.area} &middot; {place.category}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                setSaved((s) => !s)
                show(saved ? 'Removed from saved' : 'Saved')
              }}
              className="rounded-full p-1.5 text-midnight/40 transition-colors hover:bg-midnight/5 hover:text-terracotta"
              aria-label="Save"
            >
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-terracotta' : ''} />
            </motion.button>
          </div>
        </div>
        <p className="mt-2 text-sm leading-snug text-midnight/70">{place.description}</p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setAdded(true)
            show(`Added ${place.name} to your trip`)
          }}
          disabled={added}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-midnight/15 px-3.5 py-1.5 text-xs font-medium text-midnight transition-colors hover:border-midnight/30 disabled:border-teal/30 disabled:text-teal"
        >
          {added ? <Check size={13} /> : <Plus size={13} />}
          {added ? 'Added to trip' : 'Add to trip'}
        </motion.button>
      </div>
    </motion.div>
  )
}
