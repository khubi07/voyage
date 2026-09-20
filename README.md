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