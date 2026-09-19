import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Bookmark, Plus, Check } from 'lucide-react'
import { homeRecommendations, img } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { MapView } from '@/components/trip/MapView'
import { mockTripContext } from '@/data/mock'

export function PlaceDetails() {
  const { id } = useParams()
  const { show } = useToast()
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)

  const place = homeRecommendations.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === id)
    ?? homeRecommendations[0]

  return (
    <div className="pb-24">
      <div className="relative h-[52vh] overflow-hidden sm:h-[62vh]">
        <img src={place.image ?? img('place-detail')} alt={place.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 sm:px-10">
          <p className="text-xs tracking-[0.16em] text-ivory/70">
            {place.category.toUpperCase()} &middot; {place.area.toUpperCase()}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-ivory sm:text-5xl">{place.name}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-10 sm:px-8">
        <p className="text-lg leading-relaxed text-midnight/75">{place.description}</p>

        <div className="mt-8 rounded-2xl bg-sand/40 p-6">
          <p className="text-xs tracking-[0.14em] text-midnight/45">WHY IT FITS YOUR TRIP</p>
          <p className="mt-2 font-serif text-xl leading-snug text-midnight">
            Your itinerary already keeps you near {mockTripContext.property.location.split(',')[0]}, so this fits naturally without adding another long drive.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              setAdded(true)
              show(`Added ${place.name} to your trip`)
            }}
            disabled={added}
          >
            {added ? <Check size={15} /> : <Plus size={15} />}
            {added ? 'Added to trip' : 'Add to trip'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSaved((s) => !s)
              show(saved ? 'Removed from saved' : 'Saved')
            }}
          >
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            Save
          </Button>
          <a
            href="/concierge"
            className="text-sm text-midnight/60 underline-offset-4 hover:text-midnight hover:underline"
          >
            Ask VOYAGE about this place
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <MapView propertyName={mockTripContext.property.name} itinerary={mockTripContext.itinerary.slice(0, 3)} />
        </motion.div>
      </div>
    </div>
  )
}
