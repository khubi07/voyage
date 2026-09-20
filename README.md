# VOYAGE — AI Trip Concierge

> **The booking ends. The journey doesn't.**

VOYAGE is a context-aware AI Trip Concierge designed to assist travelers after their booking is complete.

Instead of acting as a generic chatbot, VOYAGE uses the guest's trip context — booking details, property information, preferences, and itinerary — to provide personalized recommendations and proactively respond to trip disruptions.

---

## ✨ What VOYAGE Does

### 1. Context-Aware AI Concierge

Guests can interact with VOYAGE through a conversational interface.

The AI receives relevant trip context including:

- Guest preferences
- Booking dates
- Number of guests
- Property details
- Current itinerary

This allows recommendations to be grounded in the guest's actual trip.

### 2. Personalized Local Recommendations

VOYAGE uses a curated Goa dataset with retrieval-based recommendations.

The recommendation pipeline combines:

- BM25 retrieval
- TF-IDF similarity
- Reciprocal Rank Fusion (RRF)
- Metadata filtering

The retrieved recommendations are then passed to the LLM to generate a grounded response.

### 3. Proactive Trip Assistance

VOYAGE doesn't wait for the guest to ask for help.

The backend periodically checks trip conditions and detects relevant events.

For example:

```text
Weather Forecast
      ↓
Event Detection
      ↓
Affected Itinerary Item
      ↓
Trip Context
      ↓
Proactive AI Agent
      ↓
Local Recommendation Retrieval
      ↓
LLM Response
      ↓
Guest Notification

If rain is expected during an outdoor activity such as a beach visit, VOYAGE can proactively suggest indoor alternatives.

4. In-App Trip Notifications

Proactive events are surfaced directly inside the web application.

The prototype uses an in-memory notification store to demonstrate the notification flow without introducing additional infrastructure.

🤖 AI Pipeline
User Query
    ↓
Trip Context
    ↓
Agent / Orchestrator
    ↓
Retrieval
    ├── BM25
    ├── TF-IDF
    └── RRF
    ↓
Relevant Local Places
    ↓
Gemini LLM
    ↓
Structured Agent Response
    ↓
Frontend
The system separates retrieval from generation so that recommendations are grounded in the curated local dataset.

🌧️ Proactive Weather Pipeline
The proactive pipeline is event-driven rather than requiring the guest to continuously ask questions.
Scheduler
    ↓
Weather API
    ↓
Weather Event Detector
    ↓
Find Affected Itinerary Items
    ↓
Build Trip Context
    ↓
Proactive Agent
    ↓
Retrieve Suitable Alternatives
    ↓
Gemini
    ↓
Notification

🗄️ Data Model

The backend uses a relational SQLite database.

Guest

Stores:

Name
Phone
Preferences
Property

Stores:

Property information
Location
Coordinates
Check-in/check-out information
Parking information
Booking

Stores:

Booking reference
Guest
Property
Check-in/check-out
Number of guests
Trip

Stores:

Trip reference
Guest
Booking
Trip status
ItineraryItem

Stores:

Date
Time
Activity
Location
Category
Status

The backend converts these normalized database records into a single TripContext object before sending relevant information to the AI layer.

🛠️ Tech Stack
Backend
Python
FastAPI
SQLAlchemy
SQLite
APScheduler
Pydantic
AI
Gemini
BM25
TF-IDF
Reciprocal Rank Fusion (RRF)
Curated local recommendation dataset
External Services
Open-Meteo Weather API
Frontend
React
TypeScript
Vite
Tailwind CSS
Framer Motion
Lucide React
Deployment
Backend: Render
Frontend: Vercel

🔮 Future Improvements

The prototype can be extended with:

Persistent notification storage
WhatsApp / Telegram integration
Real-time places and maps APIs
Sentence Transformer embeddings
More event types such as flight delays and property changes
Automatic itinerary modification after guest confirmation
Multi-trip support
Production-grade background job infrastructure
Notification delivery through external messaging platforms


