"""Phase 2 & Phase 3 HTTP wiring for verified transport contracts and geospatial endpoints."""
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.db.session import get_db
from app.models.transport import TransportProvider, Route
from app.models.transit_observation import (
    TransitRideSession,
    TransitRideSample,
    TransitStopObservation,
)
from app.schemas.transport import ProviderStatusContract, TransportHopContract
from app.transport.engine import TransitEngine
from app.transport.geometry_engine import DeterministicGeometryEngine
from app.transport.service import ProviderNotAvailableError, SQLAlchemyPlaceResolver, TransportService
from app.transport.planner import MultimodalJourneyPlanner
from app.transport.trace_processor import (
    DeterministicTraceCleaner,
    MapMatchingEngine,
    StopEventDetector,
    StopAssociationEngine,
    ConsensusEngine,
)

router = APIRouter()


@router.post("/hop", response_model=TransportHopContract)
def plan_transport_hop(args: PlanTransportHopArgs, db: Session = Depends(get_db)) -> TransportHopContract:
    return TransportService(SQLAlchemyPlaceResolver(db)).plan_transport_hop(args)


@router.get("/providers")
def list_providers(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    providers = db.query(TransportProvider).all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "mode": p.mode,
            "data_tier": p.data_tier.value if hasattr(p.data_tier, "value") else str(p.data_tier),
            "notes": p.notes_on_verification,
        }
        for p in providers
    ]


@router.get("/providers/{provider_id}", response_model=ProviderStatusContract)
def get_provider_status(provider_id: str, db: Session = Depends(get_db)) -> ProviderStatusContract:
    try:
        return TransportService(SQLAlchemyPlaceResolver(db)).get_provider_status(GetProviderStatusArgs(provider_id=provider_id))
    except ProviderNotAvailableError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/stops/nearby")
@router.get("/nearby")
@router.get("/stop_s", include_in_schema=False)
def get_nearby_stops(
    lat: float = Query(..., description="User latitude (WGS84)"),
    lon: float = Query(..., description="User longitude (WGS84)"),
    radius_m: float = Query(2000.0, ge=100.0, le=100000.0, description="Search radius in meters"),
    limit: int = Query(20, ge=1, le=100, description="Maximum stops to return"),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """
    Find official CRUT transit stops within radius_m of (lat, lon), sorted by distance.
    Includes walking estimates and routes serving each stop.
    """
    engine = TransitEngine(db)
    return engine.find_nearby_stops(latitude=lat, longitude=lon, radius_meters=radius_m, limit=limit)


@router.get("/map")
def get_transport_map(
    region: Optional[str] = Query(None, description="Optional region filter (e.g. 'Capital Region', 'Rourkela')"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Expose transport routes, sequences, and stop coordinates for frontend map visualization.
    """
    engine = TransitEngine(db)
    return engine.get_transport_map_data(region=region)


@router.get("/routes")
def list_routes(
    region: Optional[str] = Query(None, description="Filter by service area / region"),
    query: Optional[str] = Query(None, description="Search by route number or name"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    List verified transit routes with search and filtering.
    """
    engine = TransitEngine(db)
    return engine.list_routes(region=region, query=query, limit=limit, offset=offset)


@router.get("/routes/{route_id}")
def get_route(route_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Get full details for a route including ordered stops and departure schedule tables.
    """
    engine = TransitEngine(db)
    detail = engine.get_route_detail(route_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found")
    return detail


@router.get("/routes/{route_id}/geometry")
def get_route_geometry(route_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Get deterministic geometry payload for a route (EXACT, CORRIDOR, PARTIAL, or NONE).
    """
    from app.transport.geometry_engine import DeterministicGeometryEngine

    engine = DeterministicGeometryEngine(db)
    payload = engine.get_route_geometry(route_id)
    if payload is None:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found")

    return {
        "route_id": payload.route_id,
        "route_number": payload.route_number,
        "geometry_status": payload.geometry_status,
        "route_geometry_confidence": payload.route_geometry_confidence,
        "geometry_render_status": payload.geometry_render_status,
        "confidence": payload.confidence,
        "is_geometry_available": payload.is_geometry_available,
        "coordinates": payload.coordinates,
        "corridors": payload.corridors,
        "anchor_stops": payload.anchor_stops,
        "segments": payload.segments,
        "osm_relations_matched": payload.osm_relations_matched,
        "suppressed_outliers": payload.suppressed_outliers,
        "provenance": payload.provenance,
        "validation_metrics": payload.validation_metrics,
        "notes": payload.notes,
    }


from app.transport.corridor_food import CorridorFoodService


@router.get("/corridor-food")
def get_corridor_food(
    route_id: str = Query(..., description="Target transit route ID (e.g. 'rt_10', '10', or UUID)"),
    max_distance_m: float = Query(8000.0, ge=100.0, le=8000.0, description="Maximum corridor search envelope in meters (max 8000m)"),
    food_category: Optional[str] = Query(None, description="Filter by food category"),
    dietary_tag: Optional[str] = Query(None, description="Filter by dietary tag (e.g. 'vegetarian', 'seafood')"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine (e.g. 'Odia Traditional', 'Temple Cuisine')"),
    limit: int = Query(10, ge=1, le=50, description="Maximum candidate places to return"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Discover verified food places spatially associated with a transit route's verified coordinate corridor.
    Classifies candidates into ON_ROUTE (<=300m), SHORT_DETOUR (<=2.5km), and LONG_DETOUR (<=8km).
    """
    service = CorridorFoodService(db)
    try:
        return service.find_corridor_food(
            route_id=route_id,
            max_distance_m=max_distance_m,
            food_category=food_category,
            dietary_tag=dietary_tag,
            cuisine=cuisine,
            limit=limit,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err)) from val_err
    except LookupError as look_err:
        raise HTTPException(status_code=404, detail=str(look_err)) from look_err


from pydantic import BaseModel, Field
from app.transport.planner import MultimodalJourneyPlanner


class PlanJourneyRequest(BaseModel):
    origin_lat: float = Field(..., ge=17.0, le=23.5, description="Origin latitude in Odisha (WGS84)")
    origin_lon: float = Field(..., ge=81.0, le=88.0, description="Origin longitude in Odisha (WGS84)")
    destination_lat: Optional[float] = Field(None, ge=17.0, le=23.5, description="Destination latitude in Odisha (WGS84)")
    destination_lon: Optional[float] = Field(None, ge=81.0, le=88.0, description="Destination longitude in Odisha (WGS84)")
    destination_place_id: Optional[str] = Field(None, description="Optional canonical Place ID for destination")
    destination_stop_id: Optional[str] = Field(None, description="Optional Transit Stop ID for destination")
    max_walking_distance_m: float = Field(2500.0, ge=100.0, le=10000.0, description="Max walking distance to boarding/alighting stops in meters")
    include_food: bool = Field(True, description="Whether to discover and include verified food waypoints on the route")
    food_category: Optional[str] = Field(None, description="Filter food category")
    dietary_tag: Optional[str] = Field(None, description="Filter dietary tag (e.g. vegetarian)")
    cuisine: Optional[str] = Field(None, description="Filter cuisine")
    max_food_detour_m: float = Field(2500.0, ge=100.0, le=8000.0, description="Max detour envelope for food waypoints")
    requested_departure_time: Optional[str] = Field(None, description="Optional requested departure time in 'HH:MM' format")


@router.post("/plan-journey")
def plan_multimodal_journey(
    req: PlanJourneyRequest,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Plan a deterministic multimodal journey combining:
    Origin -> Walk -> Board Transit -> Transit Leg [-> Transfer Hub -> Transit Leg 2] -> Optional Food Waypoint -> Destination
    """
    planner = MultimodalJourneyPlanner(db)
    return planner.plan_journey(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        destination_lat=req.destination_lat,
        destination_lon=req.destination_lon,
        destination_place_id=req.destination_place_id,
        destination_stop_id=req.destination_stop_id,
        max_walking_distance_m=req.max_walking_distance_m,
        include_food=req.include_food,
        food_category=req.food_category,
        dietary_tag=req.dietary_tag,
        cuisine=req.cuisine,
        max_food_detour_m=req.max_food_detour_m,
        requested_departure_time=req.requested_departure_time,
    )


# =====================================================================
# WAVE C5.4: RIDER TRACE & STOP OBSERVATION API ENDPOINTS
# =====================================================================

class StartRideSessionRequest(BaseModel):
    route_number: str = Field(..., description="Bus route number being verified (e.g. '09', '101')")
    sequence_id: Optional[str] = Field(None, description="Optional sequence ID if direction is selected")
    direction: Optional[str] = Field("forward", description="Trip direction ('forward' or 'return')")
    session_hash: str = Field(..., min_length=16, description="Pseudonymous rotating session/device hash")
    consent_version: str = Field("1.0", description="User privacy consent agreement version")
    is_test_fixture: bool = Field(False, description="Flag for automated integration test fixtures")


class AppendSamplesRequest(BaseModel):
    samples: List[Dict[str, Any]] = Field(..., description="Batched GPS telemetry samples (~1Hz)")


class AddStopEventRequest(BaseModel):
    observation_type: str = Field(..., description="BOARDING, ALIGHTING, BUS_STOPPED, LOCAL_CONFIRMATION")
    latitude: Optional[float] = Field(None, ge=17.0, le=23.5)
    longitude: Optional[float] = Field(None, ge=81.0, le=88.0)
    accuracy_m: Optional[float] = Field(None, ge=0.0, le=100.0)
    timestamp: Optional[datetime] = None
    canonical_stop_id: Optional[str] = None
    evidence_pointer: Optional[str] = None
    confirmation_value: Optional[str] = None


class LocalStopConfirmRequest(BaseModel):
    route_number: str = Field(..., description="Bus route number")
    canonical_stop_id: str = Field(..., description="Canonical Stop ID being confirmed")
    confirmation_value: str = Field(..., description="'YES', 'NO', or 'UNSURE'")
    contributor_hash: str = Field(..., min_length=16, description="Pseudonymous contributor hash")
    latitude: Optional[float] = Field(None, ge=17.0, le=23.5)
    longitude: Optional[float] = Field(None, ge=81.0, le=88.0)
    accuracy_m: Optional[float] = Field(None, ge=0.0, le=100.0)
    photo_uri: Optional[str] = None


@router.post("/rides/sessions", status_code=status.HTTP_201_CREATED)
def start_ride_session(
    req: StartRideSessionRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Start a new pseudonymous transit ride verification session."""
    session_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    sess = TransitRideSession(
        id=session_id,
        route_number=req.route_number,
        sequence_id=req.sequence_id,
        direction=req.direction,
        session_hash=req.session_hash,
        consent_version=req.consent_version,
        status="ACTIVE",
        started_at=now,
        is_test_fixture=req.is_test_fixture,
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return {
        "session_id": str(sess.id),
        "route_number": sess.route_number,
        "sequence_id": sess.sequence_id,
        "status": sess.status,
        "started_at": sess.started_at.isoformat(),
    }


@router.post("/rides/sessions/{session_id}/samples")
def append_ride_samples(
    session_id: str,
    req: AppendSamplesRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Append a batch of GPS telemetry samples to an active ride session with cleaning & filtering."""
    try:
        sess_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session UUID")

    sess = db.query(TransitRideSession).filter(TransitRideSession.id == sess_uuid).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Ride session not found")
    if sess.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Cannot append samples to a {sess.status} session")

    # Clean & validate samples
    clean_pts, filtered_pts = DeterministicTraceCleaner.clean_samples(req.samples)

    # Persist all samples with their filter flags
    for p in clean_pts + filtered_pts:
        ts_val = p["timestamp"]
        if isinstance(ts_val, str):
            ts_val = datetime.fromisoformat(ts_val)
        sample = TransitRideSample(
            id=uuid.uuid4(),
            session_id=sess.id,
            timestamp=ts_val,
            latitude=float(p["latitude"]),
            longitude=float(p["longitude"]),
            accuracy_m=float(p.get("accuracy_m", 10.0)),
            speed_mps=float(p["speed_mps"]) if p.get("speed_mps") is not None else None,
            heading_deg=float(p["heading_deg"]) if p.get("heading_deg") is not None else None,
            is_filtered=p.get("is_filtered", False),
            filter_reason=p.get("filter_reason"),
        )
        db.add(sample)

    sess.sample_count += len(clean_pts)
    db.commit()

    return {
        "session_id": str(sess.id),
        "total_received": len(req.samples),
        "accepted_clean": len(clean_pts),
        "filtered_out": len(filtered_pts),
        "current_sample_count": sess.sample_count,
    }


@router.post("/rides/sessions/{session_id}/events", status_code=status.HTTP_201_CREATED)
def record_stop_event(
    session_id: str,
    req: AddStopEventRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Record an explicit stop event (BOARDING, ALIGHTING, BUS_STOPPED)."""
    try:
        sess_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session UUID")

    sess = db.query(TransitRideSession).filter(TransitRideSession.id == sess_uuid).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Ride session not found")

    obs_id = uuid.uuid4()
    obs_time = req.timestamp or datetime.now(timezone.utc)

    # Associate with canonical stop if possible
    assoc_status = None
    matched_stop_id = req.canonical_stop_id

    if req.latitude is not None and req.longitude is not None:
        engine = DeterministicGeometryEngine(db)
        r_payload = engine.get_route_geometry(sess.route_number)
        if r_payload and r_payload.anchor_stops:
            res = StopAssociationEngine.associate_observation(req.latitude, req.longitude, r_payload.anchor_stops)
            assoc_status = res.get("association_status")
            if not matched_stop_id:
                matched_stop_id = res.get("canonical_stop_id")

    obs = TransitStopObservation(
        id=obs_id,
        session_id=sess.id,
        canonical_stop_id=matched_stop_id,
        route_number=sess.route_number,
        sequence_id=sess.sequence_id,
        direction=sess.direction,
        observation_type=req.observation_type,
        latitude=req.latitude,
        longitude=req.longitude,
        accuracy_m=req.accuracy_m,
        observed_at=obs_time,
        contributor_hash=sess.session_hash,
        evidence_pointer=req.evidence_pointer,
        confirmation_value=req.confirmation_value,
        consensus_status="OBSERVED_ONCE",
        stop_association_status=assoc_status,
        is_test_fixture=sess.is_test_fixture,
    )
    db.add(obs)
    db.commit()

    return {
        "observation_id": str(obs.id),
        "session_id": str(sess.id),
        "observation_type": obs.observation_type,
        "canonical_stop_id": obs.canonical_stop_id,
        "stop_association_status": obs.stop_association_status,
    }


@router.post("/rides/sessions/{session_id}/finish")
def finish_ride_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Finish ride session, execute trace cleaning, map matching, and passive pause detection."""
    try:
        sess_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session UUID")

    sess = db.query(TransitRideSession).filter(TransitRideSession.id == sess_uuid).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Ride session not found")

    sess.ended_at = datetime.now(timezone.utc)

    # Load clean samples
    samples = (
        db.query(TransitRideSample)
        .filter(TransitRideSample.session_id == sess.id, TransitRideSample.is_filtered == False)
        .order_by(TransitRideSample.timestamp)
        .all()
    )
    clean_dicts = [
        {
            "timestamp": s.timestamp,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "accuracy_m": s.accuracy_m,
            "speed_mps": s.speed_mps,
        }
        for s in samples
    ]

    # Map-match trace against route geometry
    engine = DeterministicGeometryEngine(db)
    r_payload = engine.get_route_geometry(sess.route_number)
    route_coords = r_payload.coordinates if (r_payload and r_payload.coordinates) else []

    match_result = MapMatchingEngine.match_trace_to_route(clean_dicts, route_coords, sess.route_number)

    sess.status = match_result["status"]
    sess.quarantine_reason = match_result.get("quarantine_reason")
    sess.metadata_json = match_result

    # Passive pause detection if ride completed cleanly
    passive_stops_count = 0
    if sess.status == "COMPLETED":
        pauses = StopEventDetector.detect_passive_pauses(clean_dicts)
        for p in pauses:
            assoc = StopAssociationEngine.associate_observation(
                p["latitude"],
                p["longitude"],
                r_payload.anchor_stops if (r_payload and r_payload.anchor_stops) else [],
            )
            obs = TransitStopObservation(
                id=uuid.uuid4(),
                session_id=sess.id,
                canonical_stop_id=assoc.get("canonical_stop_id"),
                route_number=sess.route_number,
                sequence_id=sess.sequence_id,
                direction=sess.direction,
                observation_type="BUS_STOPPED",
                latitude=p["latitude"],
                longitude=p["longitude"],
                accuracy_m=p["accuracy_m"],
                observed_at=p["observed_at"],
                contributor_hash=sess.session_hash,
                evidence_pointer=f"Passive stationary cluster: duration {p['duration_seconds']}s",
                consensus_status="OBSERVED_ONCE",
                stop_association_status=assoc.get("association_status"),
                is_test_fixture=sess.is_test_fixture,
            )
            db.add(obs)
            passive_stops_count += 1

    db.commit()

    return {
        "session_id": str(sess.id),
        "status": sess.status,
        "sample_count": len(clean_dicts),
        "map_matching": match_result,
        "passive_stop_events_created": passive_stops_count,
    }


@router.post("/stops/confirm", status_code=status.HTTP_201_CREATED)
def submit_local_stop_confirmation(
    req: LocalStopConfirmRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Submit local non-rider verification (e.g. Does Route 09 stop at Niladri Vihar? YES/NO/UNSURE)."""
    if req.confirmation_value.upper() not in ("YES", "NO", "UNSURE"):
        raise HTTPException(status_code=400, detail="confirmation_value must be 'YES', 'NO', or 'UNSURE'")

    obs = TransitStopObservation(
        id=uuid.uuid4(),
        session_id=None,
        canonical_stop_id=req.canonical_stop_id,
        route_number=req.route_number,
        sequence_id=None,
        direction=None,
        observation_type="LOCAL_CONFIRMATION",
        latitude=req.latitude,
        longitude=req.longitude,
        accuracy_m=req.accuracy_m,
        observed_at=datetime.now(timezone.utc),
        contributor_hash=req.contributor_hash,
        evidence_pointer=req.photo_uri,
        confirmation_value=req.confirmation_value.upper(),
        consensus_status="OBSERVED_ONCE",
        stop_association_status="CONFIRMS_EXISTING_EXACT" if req.confirmation_value.upper() == "YES" else "CONTRADICTS_CURRENT_CANDIDATE",
        is_test_fixture=False,
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    return {
        "observation_id": str(obs.id),
        "canonical_stop_id": obs.canonical_stop_id,
        "route_number": obs.route_number,
        "confirmation_value": obs.confirmation_value,
        "status": "ACCEPTED",
    }





