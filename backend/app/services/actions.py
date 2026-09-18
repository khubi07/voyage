"""
Action values returned in AgentResponse.action, agreed with the backend
(Khubi) integration contract. The backend/notification layer switches on
these exact strings, so they must not be changed without updating both sides.
"""

ADD_ITINERARY_ITEM = "ADD_ITINERARY_ITEM"
SUGGEST_ITINERARY_CHANGE = "SUGGEST_ITINERARY_CHANGE"
