// Mirrors backend/app/schemas.py exactly, so real API responses drop in
// without any UI changes later.

export interface GuestContext {
  guest_id: number
  name: string
  preferences: string[]
}

export interface BookingContext {
  booking_id: number
  check_in: string // ISO date
  check_out: string // ISO date
  number_of_guests: number
}

export interface PropertyContext {
  property_id: number
  name: string
  location: string
  latitude: number
  longitude: number
  check_in_time: string
  check_out_time: string
  parking_info: string
}

export interface ItineraryItemContext {
  item_id: number
  date: string // ISO date
  start_time: string | null
  end_time: string | null
  title: string
  location: string
  category: string
  status: string
}

export interface TripContext {
  trip_id: number
  guest: GuestContext
  booking: BookingContext
  property: PropertyContext
  itinerary: ItineraryItemContext[]
}

// A recommended place, as returned inside AgentResponse.recommendations.
// Loosely typed on the backend (list), but the agent consistently returns
// this shape from the curated Goa dataset.
export interface Recommendation {
  name: string
  category: 'restaurant' | 'activity' | 'attraction' | 'transport' | 'area' | string
  area: string
  tags?: string[]
  price?: string | null
  description: string
  day?: number
  date?: string
  slot?: string
  distance?: string
  image?: string
}

export type AgentAction = null | 'ADD_ITINERARY_ITEM' | 'SUGGEST_ITINERARY_CHANGE'

export interface AgentResponse {
  message: string
  recommendations: Recommendation[]
  action: AgentAction
  needs_confirmation: boolean
}

export interface ChatMessage {
  id: string
  role: 'guest' | 'voyage'
  text: string
  recommendations?: Recommendation[]
  action?: AgentAction
  needsConfirmation?: boolean
  timestamp: number
}

export interface ProactiveEvent {
  type: 'RAIN_EXPECTED'
  affectedItem: ItineraryItemContext
}
