"""SQLAlchemy engine/session setup. Owner: Smarak."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine_kwargs = {"future": True}

# Apply connection pool hardening for non-SQLite databases
if not settings.database_url.startswith("sqlite"):
    engine_kwargs.update({
        "pool_pre_ping": settings.db_pool_pre_ping,
        "pool_recycle": settings.db_pool_recycle,
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_max_overflow,
    })
else:
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
    })

engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)



def get_db():
    """FastAPI dependency yielding a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
