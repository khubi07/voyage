from .agent import run_agent as ai_run_agent
from ..schemas import AgentResponse, TripContext


def run_agent(
    query: str,
    trip_context: TripContext,
) -> AgentResponse:
    """Bridge the backend service layer with the AI agent."""
    return ai_run_agent(
        query=query,
        trip_context=trip_context,
    )