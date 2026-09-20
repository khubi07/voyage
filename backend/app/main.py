from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import SessionLocal
from .services.context_manager import get_trip_context
from .schemas import ChatRequest, AgentResponse
from .services.agent_client import run_agent

from contextlib import asynccontextmanager
from .services.scheduler import start_scheduler, stop_scheduler
from .services.notification_state import get_notifications

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage resources that should start and stop with the API."""

    # Start background jobs when the application starts.
    start_scheduler()

    yield

    # Stop background jobs gracefully when the application shuts down.
    stop_scheduler()



app = FastAPI(
    title="Wayzyy Trip Concierge",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/trips/{trip_id}/context")
def get_context(
    trip_id: int,
    db: Session = Depends(get_db)
):
    try:
        context = get_trip_context(db, trip_id)
        return context
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

@app.post("/chat", response_model=AgentResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Process a guest message using the trip context and AI agent."""

    try:
        # Build the guest's current trip context from the database.
        trip_context = get_trip_context(db, request.trip_id)

        # Pass both the user's query and trip context to the AI layer.
        response = run_agent(
            query=request.query,
            trip_context=trip_context,
        )

        return response

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

@app.get("/trips/{trip_id}/notifications")
def get_trip_notifications(trip_id: int):
    return get_notifications(trip_id)