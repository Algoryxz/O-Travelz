"""Central pytest configuration and fixtures for O-Travelz backend tests."""
from __future__ import annotations

import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base_class import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.models.session import UserSession, SharedTripSnapshot, UserSavedPlace, UserSavedTrip
from app.models.category import Category
from app.models.interest import Interest, PlaceInterest


# Shared in-memory SQLite engine for unit tests
SQLITE_TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=SQLITE_TEST_ENGINE, autoflush=False, autocommit=False)


@pytest.fixture(scope="session", autouse=True)
def setup_unit_test_tables():
    """Create essential relational tables in test SQLite memory."""
    User.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    UserSession.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    UserSavedPlace.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    UserSavedTrip.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    SharedTripSnapshot.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    Category.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    Interest.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    PlaceInterest.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)

    with SQLITE_TEST_ENGINE.connect() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS places (
            id VARCHAR(36) PRIMARY KEY,
            research_id VARCHAR,
            name VARCHAR NOT NULL,
            category_id VARCHAR(36),
            location TEXT,
            description VARCHAR,
            opening_hours JSON,
            opening_hours_source VARCHAR,
            avg_visit_minutes INTEGER,
            price_tier VARCHAR,
            rating FLOAT,
            rating_count INTEGER,
            rating_source VARCHAR,
            source VARCHAR NOT NULL DEFAULT 'official',
            source_url VARCHAR,
            verified_at DATETIME,
            verification_status VARCHAR,
            source_provenance_note VARCHAR,
            coordinate_verification VARCHAR,
            coordinate_audit_status VARCHAR,
            audit_status VARCHAR,
            district VARCHAR,
            contact_phone VARCHAR,
            emergency_phone VARCHAR,
            address VARCHAR,
            cuisine VARCHAR,
            dietary_tags JSON,
            speciality_dishes JSON,
            highway_corridor VARCHAR,
            food_category VARCHAR
        );
        """))
        # Seed canonical places for place validation in unit tests
        conn.execute(text("""
        INSERT OR IGNORE INTO places (id, research_id, name, source, verification_status)
        VALUES 
            ('7b420000-0000-0000-0000-000000000001', 'puri', 'Puri', 'official', 'VERIFIED'),
            ('7b420000-0000-0000-0000-000000000002', 'konark', 'Konark Sun Temple', 'official', 'VERIFIED'),
            ('7b420000-0000-0000-0000-000000000003', 'bhubaneswar', 'Lingaraj Temple', 'official', 'VERIFIED');
        """))
        conn.commit()
    yield
    try:
        Base.metadata.drop_all(SQLITE_TEST_ENGINE, checkfirst=True)
    except Exception:
        pass


@pytest.fixture
def unit_db():
    """Provide an isolated, transactional in-memory database session for unit tests."""
    connection = SQLITE_TEST_ENGINE.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def override_get_db(request):
    """Automatically wire get_db dependency to the isolated in-memory test DB for non-integration tests."""
    if "integration" in request.keywords:
        yield
        return

    connection = SQLITE_TEST_ENGINE.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    def _test_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = _test_get_db
    yield session

    app.dependency_overrides.pop(get_db, None)
    session.close()
    transaction.rollback()
    connection.close()


def _is_postgis_available() -> bool:
    """Check if PostgreSQL/PostGIS database is reachable at configured DATABASE_URL."""
    from app.core.config import settings
    if settings.database_url.startswith("sqlite"):
        return False
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception:
        return False


@pytest.fixture(autouse=True)
def check_integration_environment(request):
    """Ensure integration tests provide a clear diagnostic if PostgreSQL/PostGIS is unavailable."""
    if "integration" in request.keywords:
        if not _is_postgis_available():
            pytest.fail(
                "PostgreSQL/PostGIS integration test environment is unavailable on localhost:5432.\n"
                "To execute integration tests, start the database with: 'docker-compose up -d db'\n"
                "or set DATABASE_URL to a valid PostgreSQL/PostGIS instance."
            )


@pytest.fixture(autouse=True)
def reset_ai_rate_limiter():
    """Reset in-memory AI rate limiter state before and after each test for test isolation."""
    from app.ai.rate_limit import rate_limiter
    rate_limiter.reset()
    yield
    rate_limiter.reset()

