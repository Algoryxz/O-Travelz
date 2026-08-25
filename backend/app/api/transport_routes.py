"""Phase 2 & Phase 3 HTTP wiring for verified transport contracts and geospatial endpoints."""
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.db.session import get_db
from app.models.transport import TransportProvider
from app.schemas.transport import ProviderStatusContract, TransportHopContract
from app.transport.engine import TransitEngine
from app.transport.service import ProviderNotAvailableError, SQLAlchemyPlaceResolver, TransportService

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
        "confidence": payload.confidence,
        "is_geometry_available": payload.is_geometry_available,
        "coordinates": payload.coordinates,
        "corridors": payload.corridors,
        "anchor_stops": payload.anchor_stops,
        "notes": payload.notes,
    }


from app.transport.corridor_food import CorridorFoodService


@router.get("/corridor-food")
def get_corridor_food(
    route_id: str = Query(..., description="Target transit route UUID"),
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




