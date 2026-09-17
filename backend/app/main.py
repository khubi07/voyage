from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import SessionLocal
from .services.context_manager import get_trip_context


app = FastAPI(title="Wayzyy Trip Concierge")


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