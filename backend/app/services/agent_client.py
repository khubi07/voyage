from ..schemas import AgentResponse, TripContext


def run_agent(query: str, trip_context: TripContext) -> AgentResponse:
    """
    Temporary mock for AI Agent.

    This keeps our backend integration working while the actual
    AI agent is developed independently.
    """

    # We use the trip location to verify that the backend
    # is successfully passing TripContext to the agent layer.
    location = trip_context.property.location

    return AgentResponse(
        message=f"Mock response for your trip in {location}: {query}",
        recommendations=[],
        action=None,
        needs_confirmation=False,
    )