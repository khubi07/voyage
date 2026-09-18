from .database import SessionLocal
from .services.context_manager import get_trip_context


db = SessionLocal()

context = get_trip_context(db, trip_id=1)

print(context.model_dump_json(indent=2))

db.close()