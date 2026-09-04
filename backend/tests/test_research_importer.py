"""
Tests for Phase 6A Transit Research Intelligence Importer.

Verifies:
- First-time import creates normalized intelligence records.
- Idempotency: Repeated imports preserve record counts and prevent duplicates.
- Production isolation: Existing routes, stops, and route_stops are never mutated.
- Provenance and confidence fields are preserved accurately.
- Relational foreign keys between intelligence models are established properly.
"""
import pytest
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration

from app.db.session import SessionLocal
from app.models.transport import Route, Stop, RouteStop
from app.models.transit_intelligence import (
    EvidenceCitation,
    RouteIntelligence,
    RouteCorridorIntelligence,
    StopIntelligence,
    StopAlias,
    UnresolvedStopRegistry,
)
from app.transport.research_importer import TransitIntelligenceImporter


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_research_importer_first_run(db_session: Session):
    """Test importing Phase 6A research artifacts for the first time."""
    importer = TransitIntelligenceImporter(db_session)
    report = importer.import_all()

    assert report.routes_count == 154
    assert report.stops_count == 1487
    assert report.corridors_count == 154
    assert report.evidence_count >= 10
    assert report.aliases_count >= 3
    assert report.unresolved_count >= 800

    # Verify Database Tables
    ri_count = db_session.query(RouteIntelligence).count()
    assert ri_count == 154

    ci_count = db_session.query(RouteCorridorIntelligence).count()
    assert ci_count == 154

    si_count = db_session.query(StopIntelligence).count()
    assert si_count == 1487

    ev_count = db_session.query(EvidenceCitation).count()
    assert ev_count >= 10

    unres_count = db_session.query(UnresolvedStopRegistry).count()
    assert unres_count >= 800


def test_research_importer_idempotency(db_session: Session):
    """Test that running the importer a second time is completely idempotent."""
    importer = TransitIntelligenceImporter(db_session)
    report = importer.import_all()

    assert report.routes_count == 154
    assert report.stops_count == 1487
    assert report.corridors_count == 154

    # Counts must remain identical after second import
    assert db_session.query(RouteIntelligence).count() == 154
    assert db_session.query(RouteCorridorIntelligence).count() == 154
    assert db_session.query(StopIntelligence).count() == 1487
    assert db_session.query(EvidenceCitation).count() == report.evidence_count
    assert db_session.query(StopAlias).count() == report.aliases_count
    assert db_session.query(UnresolvedStopRegistry).count() == report.unresolved_count


def test_production_tables_unmutated_after_import(db_session: Session):
    """Verify that authoritative production transit tables were not modified by the research importer."""
    prod_routes_count = db_session.query(Route).count()
    assert prod_routes_count == 154

    prod_stops_count = db_session.query(Stop).count()
    assert prod_stops_count == 1430

    prod_links_count = db_session.query(RouteStop).count()
    assert prod_links_count == 1491


def test_route_intelligence_linkage_and_confidence(db_session: Session):
    """Verify that RouteIntelligence links to existing routes and preserves confidence/geometry_status."""
    route_10 = (
        db_session.query(RouteIntelligence)
        .filter(RouteIntelligence.route_number == "10")
        .first()
    )
    assert route_10 is not None
    assert route_10.overall_confidence == "CONFIRMED"
    assert route_10.region == "Capital Region"
    assert len(route_10.corridors) >= 1
    assert "EV-CRUT-CR-SCHED-2026" in route_10.route_level_evidence


def test_stop_intelligence_provenance_preservation(db_session: Session):
    """Verify that StopIntelligence records preserve coordinates and provenance."""
    # Check a geocoded stop
    verified_stop = (
        db_session.query(StopIntelligence)
        .filter(StopIntelligence.resolved_latitude.isnot(None))
        .first()
    )
    assert verified_stop is not None
    assert verified_stop.geographic_status == "verified"
    assert verified_stop.coordinate_provenance in (
        "official_source",
        "geocoded",
        "osm_verified",
        "research_approximate",
    )
    assert verified_stop.confidence == "CONFIRMED"

    # Check an unresolved stop
    unres_stop = (
        db_session.query(StopIntelligence)
        .filter(StopIntelligence.resolved_latitude.is_(None))
        .first()
    )
    assert unres_stop is not None
    assert unres_stop.geographic_status == "unresolved"
    assert unres_stop.coordinate_provenance is None
