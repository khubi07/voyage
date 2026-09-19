import type { TripContext, Recommendation, ItineraryItemContext } from '@/types/trip'

// Placeholder photography — swap these seeded picsum URLs for a real Goa
// shoot before the live demo. Seeds keep each image stable across reloads.
export const img = (seed: string, w = 1600, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const mockTripContext: TripContext = {
  trip_id: 1,
  guest: {
    guest_id: 1,
    name: 'Rahul',
    preferences: ['quiet', 'local'],
  },
  booking: {
    booking_id: 1,
    check_in: '2026-09-20',
    check_out: '2026-09-23',
    number_of_guests: 2,
  },
  property: {
    property_id: 1,
    name: 'Palm Grove Villa',
    location: 'Candolim, Goa',
    latitude: 15.517,
    longitude: 73.764,
    check_in_time: '14:00',
    check_out_time: '11:00',
    parking_info: 'Private parking available on-site.',
  },
  itinerary: [
    {
      item_id: 1,
      date: '2026-09-20',
      start_time: '09:00',
      end_time: '10:00',
      title: 'Yoga by the beach',
      location: 'Candolim Beach',
      category: 'activity',
      status: 'ACTIVE',
    },
    {
      item_id: 2,
      date: '2026-09-20',
      start_time: '12:30',
      end_time: '13:30',
      title: 'Lunch at Goan Soul Kitchen',
      location: 'Candolim',
      category: 'restaurant',
      status: 'ACTIVE',
    },
    {
      item_id: 3,
      date: '2026-09-20',
      start_time: '16:00',
      end_time: '18:00',
      title: 'Fort Aguada',
      location: 'Candolim',
      category: 'attraction',
      status: 'ACTIVE',
    },
    {
      item_id: 4,
      date: '2026-09-20',
      start_time: '19:30',
      end_time: '21:00',
      title: 'Dinner at Britto\u2019s',
      location: 'Baga',
      category: 'restaurant',
      status: 'ACTIVE',
    },
    {
      item_id: 5,
      date: '2026-09-21',
      start_time: '10:00',
      end_time: '13:00',
      title: 'Calangute Beach',
      location: 'Calangute, Goa',
      category: 'beach',
      status: 'ACTIVE',
    },
    {
      item_id: 6,
      date: '2026-09-21',
      start_time: '19:00',
      end_time: '21:00',
      title: 'Dinner at Gunpowder',
      location: 'Assagao',
      category: 'restaurant',
      status: 'ACTIVE',
    },
    {
      item_id: 7,
      date: '2026-09-22',
      start_time: '17:30',
      end_time: '19:00',
      title: 'Chapora Fort sunset',
      location: 'Chapora',
      category: 'activity',
      status: 'ACTIVE',
    },
  ],
}

export const dayLabels: Record<string, string> = {
  '2026-09-20': 'Slow beginnings',
  '2026-09-21': 'Local Goa',
  '2026-09-22': 'One last sunset',
}

export function itemsByDate(itinerary: ItineraryItemContext[]) {
  const map = new Map<string, ItineraryItemContext[]>()
  for (const item of itinerary) {
    const list = map.get(item.date) ?? []
    list.push(item)
    map.set(item.date, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  }
  return map
}

export const homeRecommendations: Recommendation[] = [
  {
    name: 'Lila Caf\u00e9',
    category: 'restaurant',
    area: 'Soliim',
    tags: ['quiet', 'local'],
    price: 'medium',
    description:
      'Quiet enough for a slow evening, close enough to keep tonight effortless.',
    image: img('lila-cafe'),
  },
  {
    name: 'Gunpowder',
    category: 'restaurant',
    area: 'Assagao',
    tags: ['quiet', 'garden-seating'],
    price: 'medium',
    description:
      'A short ride, but worth it if you want dinner to feel like an experience.',
    image: img('gunpowder-restaurant'),
  },
  {
    name: 'Chapora Fort',
    category: 'attraction',
    area: 'Chapora',
    tags: ['quiet', 'scenic'],
    price: 'free',
    description:
      'The view that ends up in everyone\u2019s memory of Goa, without the crowd.',
    image: img('chapora-fort'),
  },
  {
    name: 'Sinquerim Kayaking',
    category: 'activity',
    area: 'Candolim',
    tags: ['adventurous'],
    price: 'medium',
    description:
      'Calm morning waters, ten minutes from where you\u2019re staying.',
    image: img('sinquerim-kayak'),
  },
]

export const exploreSections = [
  {
    id: 'coast',
    title: 'The Coast',
    blurb: 'Where the land runs out and the light gets soft.',
    image: img('goa-coast-explore'),
  },
  {
    id: 'table',
    title: 'The Table',
    blurb: 'Where Goa actually eats.',
    image: img('goa-table-explore'),
  },
  {
    id: 'after-dark',
    title: 'After Dark',
    blurb: 'For when the sun gives up.',
    image: img('goa-afterdark-explore'),
  },
  {
    id: 'old-goa',
    title: 'Old Goa',
    blurb: 'Portuguese stone, four hundred years on.',
    image: img('goa-oldtown-explore'),
  },
  {
    id: 'local-favourites',
    title: 'Local Favourites',
    blurb: 'Not on any list but this one.',
    image: img('goa-local-explore'),
  },
  {
    id: 'hidden-corners',
    title: 'Hidden Corners',
    blurb: 'Worth the wrong turn.',
    image: img('goa-hidden-explore'),
  },
]

export const proactiveRainAlternatives: Recommendation[] = [
  {
    name: 'Pottery Workshop, Assagao',
    category: 'activity',
    area: 'Assagao',
    tags: ['quiet', 'indoor', 'creative'],
    price: 'medium',
    description: 'A small-group session, a calm indoor afternoon either way.',
    image: img('pottery-workshop'),
  },
  {
    name: 'Goa State Museum',
    category: 'attraction',
    area: 'Panaji',
    tags: ['quiet', 'indoor', 'cultural'],
    price: 'low',
    description: 'Portuguese-era history, ten minutes from the rain.',
    image: img('goa-museum'),
  },
]
