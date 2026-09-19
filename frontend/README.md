# VOYAGE — Frontend

> "The booking ends. The journey doesn't."

An AI-powered post-booking trip concierge frontend, built with React, Vite, TypeScript, Tailwind CSS v4, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The app runs entirely on mock data out of the box — no backend required to explore every screen.

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## Connecting the real backend

The API layer (`src/api/client.ts`) calls mock data by default, and switches to real HTTP calls the moment an API base URL is configured — no UI code needs to change.

1. Create a `.env` file in this folder:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```
2. That's it. `getTripContext()` and `sendChatMessage()` will now call:
   - `GET  {VITE_API_BASE_URL}/trips/{id}/context`
   - `POST {VITE_API_BASE_URL}/chat`

   matching the real backend's contract (`TripContext` in, `AgentResponse` out — see `src/types/trip.ts`, which mirrors `backend/app/schemas.py` field-for-field).

## Project structure

```
src/
├── api/            API client (mock + real backend, one switch)
├── components/
│   ├── brand/      Logo, compass+wave mark
│   ├── concierge/  AI chat interface
│   ├── layout/      Page shell (nav + outlet)
│   ├── nav/         Navbar (desktop), BottomNav (mobile)
│   ├── place/       RecommendationCard
│   ├── trip/         ItineraryTimeline, TripContextStrip, WeatherAlert, MapView
│   └── ui/           Button, Tabs, Modal, BottomSheet, Toast, LoadingState, EmptyState
├── data/            Mock trip context + recommendations
├── pages/           Home, MyTrip, Concierge, Explore, PlaceDetails, Saved
├── types/            TripContext / AgentResponse types (matches backend schema)
├── index.css        Design tokens (color, type) via Tailwind v4 @theme
└── App.tsx           Routing
```

## Design system

- **Color**: deep midnight navy, warm ivory, ocean teal, seafoam, sand, terracotta — see `--color-*` tokens in `src/index.css`
- **Type**: Fraunces (editorial serif, headlines) + Inter (UI, body)
- **Motion**: Framer Motion throughout — hero reveal sequence, AI thinking animation, staggered recommendation cards, animated itinerary timeline, and the signature weather-alert swap interaction

## Known placeholders to swap before a live demo

- **Photography** is currently seeded placeholder imagery (`picsum.photos`, via the `img()` helper in `src/data/mock.ts`) — swap for a real Goa photo set before presenting. Every place that needs a photo goes through that one helper, so swapping the source is a single-file change.
- **Mock recommendations** in `src/data/mock.ts` are illustrative; once the real backend + Goa dataset are live, these fall away automatically since `sendChatMessage`/`getTripContext` prefer the real API whenever `VITE_API_BASE_URL` is set.
