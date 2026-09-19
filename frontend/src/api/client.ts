import type { AgentResponse, TripContext } from '@/types/trip'
import { mockTripContext, homeRecommendations, proactiveRainAlternatives } from '@/data/mock'

// Point this at the real FastAPI backend when it's ready:
//   VITE_API_BASE_URL=http://localhost:8000 in a .env file.
// Until then, USE_MOCK stays true and every function below resolves with
// realistic mock data shaped exactly like the real backend response.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined
const USE_MOCK = !API_BASE_URL

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function getTripContext(tripId: number): Promise<TripContext> {
  if (USE_MOCK) {
    return delay({ ...mockTripContext, trip_id: tripId }, 400)
  }
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}/context`)
  if (!res.ok) throw new Error(`Failed to load trip context: ${res.status}`)
  return res.json()
}

// Very small keyword router so the mock concierge feels responsive to what
// the guest actually typed, without needing a real LLM in the prototype.
function mockAgentResponse(query: string): AgentResponse {
  const q = query.toLowerCase()

  if (q.includes('plan') || q.includes('itinerary') || q.includes('days')) {
    return {
      message:
        'Here\u2019s a shape for your days \u2014 mornings easy, evenings local. Take a look and tell me what to change.',
      recommendations: homeRecommendations.slice(0, 3),
      action: 'ADD_ITINERARY_ITEM',
      needs_confirmation: true,
    }
  }

  if (q.includes('rain')) {
    return {
      message:
        'Rain may interrupt your Calangute Beach plan tomorrow. I found a few alternatives that keep the afternoon interesting.',
      recommendations: proactiveRainAlternatives,
      action: 'SUGGEST_ITINERARY_CHANGE',
      needs_confirmation: true,
    }
  }

  if (q.includes('adventurous')) {
    return {
      message:
        'Let\u2019s add a little more movement to the plan. These fit without straying too far from where you\u2019re staying.',
      recommendations: [homeRecommendations[3], homeRecommendations[2]],
      action: null,
      needs_confirmation: false,
    }
  }

  return {
    message:
      'Since you\u2019re looking for something quieter and local, I found a few places that fit tonight.',
    recommendations: homeRecommendations.slice(0, 2),
    action: null,
    needs_confirmation: false,
  }
}

export async function sendChatMessage(
  _tripId: number,
  query: string
): Promise<AgentResponse> {
  if (USE_MOCK) {
    return delay(mockAgentResponse(query), 1100)
  }
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip_id: _tripId, query }),
  })
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
  return res.json()
}
