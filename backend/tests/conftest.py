"""Central pytest configuration and fixtures for O-Travelz backend tests."""
from __future__ import annotations

import os
import pytest
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base_class import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.models.session import UserSession, SharedTripSnapshot, UserSavedPlace, UserSavedTrip
from app.models.category import Category
from app.models.interest import Interest, PlaceInterest
from app.models.transit_observation import (
    TransitRideSession,
    TransitRideSample,
    TransitStopObservation,
)


# Shared in-memory SQLite engine for unit tests
SQLITE_TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(SQLITE_TEST_ENGINE, "connect")
def _register_sqlite_spatial_shims(dbapi_connection, connection_record):
    dbapi_connection.create_function("AsBinary", 1, lambda val: val.encode() if isinstance(val, str) else (val or b""))
    dbapi_connection.create_function("ST_AsBinary", 1, lambda val: val.encode() if isinstance(val, str) else (val or b""))


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
    TransitRideSession.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    TransitRideSample.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)
    TransitStopObservation.__table__.create(SQLITE_TEST_ENGINE, checkfirst=True)

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
            food_category VARCHAR,
            localized_names JSON,
            confidence VARCHAR(16),
            last_verified_at DATETIME
        );
        """))

        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS place_images (
            id VARCHAR(36) PRIMARY KEY,
            place_id VARCHAR(36) NOT NULL,
            storage_key VARCHAR,
            url VARCHAR NOT NULL,
            thumbnail_url VARCHAR,
            card_url VARCHAR,
            alt_text VARCHAR,
            title VARCHAR,
            source_url VARCHAR,
            source_name VARCHAR NOT NULL DEFAULT 'Wikimedia Commons',
            creator VARCHAR,
            license VARCHAR NOT NULL DEFAULT 'CC BY-SA 4.0',
            attribution TEXT NOT NULL DEFAULT '',
            retrieval_timestamp DATETIME,
            width INTEGER,
            height INTEGER,
            aspect_ratio FLOAT,
            content_sha256 VARCHAR(64),
            content_type VARCHAR(64) DEFAULT 'image/webp',
            size_bytes INTEGER,
            status VARCHAR NOT NULL DEFAULT 'verified',
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_primary BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        );
        """))

        # Seed canonical categories, places, and images for unit tests
        conn.execute(text("""
        INSERT OR IGNORE INTO categories (id, name, display_name, description)
        VALUES ('7b420000-0000-0000-0000-000000000010', 'temple', 'Temples', 'Heritage Temples of Odisha');
        """))

        conn.execute(text("""
        INSERT OR IGNORE INTO places (id, research_id, name, category_id, source, verification_status, verified_at, coordinate_verification)
        VALUES 
            ('7b420000-0000-0000-0000-000000000001', 'puri', 'Puri', '7b420000-0000-0000-0000-000000000010', 'official', 'VERIFIED', '2026-01-01 00:00:00', 'EXACT_COORDINATES_VERIFIED'),
            ('7b420000-0000-0000-0000-000000000002', 'konark', 'Konark Sun Temple', '7b420000-0000-0000-0000-000000000010', 'official', 'VERIFIED', '2026-01-01 00:00:00', 'EXACT_COORDINATES_VERIFIED'),
            ('7b420000-0000-0000-0000-000000000003', 'place_bbsr_001', 'Lingaraj Temple', '7b420000-0000-0000-0000-000000000010', 'official', 'VERIFIED', '2026-01-01 00:00:00', 'EXACT_COORDINATES_VERIFIED');
        """))

        conn.execute(text("""
        INSERT OR IGNORE INTO place_images (id, place_id, storage_key, url, thumbnail_url, card_url, alt_text, status, is_primary)
        VALUES
            ('7b420000-0000-0000-0000-000000000020', '7b420000-0000-0000-0000-000000000003', 'places/place_bbsr_001/06a456469886/hero.webp', '/static/images/places/place_bbsr_001/06a456469886/hero.webp', '/static/images/places/place_bbsr_001/06a456469886/thumbnail.webp', '/static/images/places/place_bbsr_001/06a456469886/card.webp', 'Lingaraj Temple', 'verified', 1);
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

