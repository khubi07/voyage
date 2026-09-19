import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { RecommendationCard } from '@/components/place/RecommendationCard'
import { homeRecommendations } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'places', label: 'Places' },
  { id: 'experiences', label: 'Experiences' },
]

export function Saved() {
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  // Demo: show mock recommendations as "saved" so the page never feels
  // hollow. In the real app this reads from actual saved-state.
  const saved = homeRecommendations

  const filtered = saved.filter((p) => {
    if (tab === 'all') return true
    if (tab === 'food') return p.category === 'restaurant'
    if (tab === 'places') return p.category === 'attraction' || p.category === 'area'
    if (tab === 'experiences') return p.category === 'activity'
    return true
  })

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8 sm:pt-14">
      <p className="text-xs tracking-[0.16em] text-midnight/45">SAVED</p>
      <h1 className="mt-2 font-serif text-4xl text-midnight sm:text-5xl">
        Places worth remembering.
      </h1>
      <p className="mt-3 max-w-md text-midnight/55">
        Keep the places you don&rsquo;t want to forget.
      </p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mt-8" />

      <div className="mt-10">
        {filtered.length === 0 ? (
          <EmptyState
            heading="Nothing saved yet."
            body="Keep the places you don\u2019t want to forget."
            action={<Button onClick={() => navigate('/explore')}>Explore Goa</Button>}
          />
        ) : (
          <div className="flex flex-wrap gap-6">
            {filtered.map((place, i) => (
              <RecommendationCard key={place.name} place={place} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
