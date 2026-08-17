"""SQLAlchemy engine/session setup. Owner: Smarak."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    """FastAPI dependency yielding a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
