"""O-Travelz backend entrypoint."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import app.models  # noqa: F401
from app.api.transport_routes import router as transport_router
from app.api.itinerary_routes import router as itinerary_router
from app.api.ai_routes import router as ai_router
from app.api.map_routes import router as map_router
from app.api.places_routes import router as places_router
from app.api.image_routes import router as image_router
from app.api.auth_routes import router as auth_router
from app.api.sync_routes import router as sync_router
from app.api.share_routes import router as share_router
from app.api.weather_routes import router as weather_router
from app.api.location_routes import router as location_router
from app.api.services_routes import router as services_router
from app.api.media_routes import router as media_router
from app.api.heritage_routes import router as heritage_router
from app.core.config import settings
from app.geospatial.http_adapter import MapProjectionHTTPError
from app.schemas.api import APIErrorDetail, APIErrorResponse
from app.services.itinerary import ItineraryPlanningError

import os

app = FastAPI(
    title="O-Travelz API",
    description="Transportation-aware itinerary planning for O-Travelz.",
    version="0.1.0",
)

def _resolve_git_sha() -> str:
    for env_key in ("GIT_SHA", "RENDER_GIT_COMMIT", "VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA"):
        val = os.environ.get(env_key)
        if val:
            return val.strip()[:40]
    try:
        import subprocess
        out = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            stderr=subprocess.DEVNULL,
            timeout=1.0,
            text=True,
        ).strip()
        if out:
            return out
    except Exception:
        pass
    return "593d20263bc3b2442fe3f9ef12dffaefde17b74b"


RELEASE_METADATA = {
    "git_sha": _resolve_git_sha(),
    "alembic_version": "0020_transit_ride_observations",
}

cors_origins_raw = getattr(settings, "cors_origins", None) or os.environ.get("CORS_ORIGINS", "*")
if cors_origins_raw.strip() == "*":
    cors_origins = ["*"]
    allow_credentials = False
else:
    cors_origins = [o.strip().rstrip("/") for o in cors_origins_raw.split(",") if o.strip()]
    allowed_defaults = [
        "https://algoryxz.github.io",
        "https://smarak-padhi.github.io",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ]
    for d in allowed_defaults:
        if d not in cors_origins:
            cors_origins.append(d)
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
def root() -> dict:
    """Root endpoint verifying backend service availability."""
    return {
        "service": "O-Travelz API",
        "status": "running",
        "version": "0.1.0",
        "git_sha": RELEASE_METADATA["git_sha"],
        "alembic_version": RELEASE_METADATA["alembic_version"],
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict:
    """Liveness probe with machine-readable release identity and lightweight DB check."""
    db_status = "connected"
    try:
        from sqlalchemy import text
        from app.db.session import SessionLocal

        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "git_sha": RELEASE_METADATA["git_sha"],
        "alembic_version": RELEASE_METADATA["alembic_version"],
        "database": db_status,
    }


@app.get("/ready")
def ready() -> JSONResponse:
    """Readiness probe checking database connectivity."""
    from sqlalchemy import text
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return JSONResponse(status_code=200, content={"status": "ready", "database": "connected"})
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "unavailable", "database": "disconnected"},
        )
    finally:
        db.close()



app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(sync_router, prefix="/api/v1/sync", tags=["sync"])
app.include_router(share_router, tags=["share"])
app.include_router(share_router, prefix="/api", tags=["share"])
app.include_router(transport_router, prefix="/transport", tags=["transport"])
app.include_router(transport_router, prefix="/api/transport", tags=["transport"])
app.include_router(itinerary_router, prefix="/itinerary", tags=["itinerary"])
app.include_router(itinerary_router, prefix="/api/itinerary", tags=["itinerary"])
app.include_router(places_router, prefix="/places", tags=["places"])
app.include_router(places_router, prefix="/api/places", tags=["places"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(map_router, prefix="/map/v1", tags=["map"])
app.include_router(map_router, prefix="/api/map/v1", tags=["map"])
app.include_router(image_router, prefix="/api/v1/images", tags=["images"])
app.include_router(image_router, prefix="/static/images", tags=["images"])
app.include_router(weather_router, prefix="/weather", tags=["weather"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(location_router, prefix="/location", tags=["location"])
app.include_router(location_router, prefix="/api/location", tags=["location"])
app.include_router(services_router, prefix="/api/v1/services", tags=["services"])
app.include_router(media_router, prefix="/api/v1/media", tags=["media"])
app.include_router(media_router, prefix="/media", tags=["media"])
app.include_router(heritage_router, prefix="/api/v1/heritage", tags=["heritage"])
app.include_router(heritage_router, prefix="/heritage", tags=["heritage"])



@app.exception_handler(MapProjectionHTTPError)
async def map_projection_error_handler(
    request: Request,
    exc: MapProjectionHTTPError,
) -> JSONResponse:
    response = APIErrorResponse(
        error=APIErrorDetail(code=exc.code, message=exc.message, field=exc.field),
    )
    return JSONResponse(status_code=exc.status_code, content=response.model_dump(mode="json"))


@app.exception_handler(ItineraryPlanningError)
async def itinerary_planning_error_handler(
    request: Request,
    exc: ItineraryPlanningError,
) -> JSONResponse:
    response = APIErrorResponse(
        error=APIErrorDetail(code=exc.code, message=exc.message, field=exc.field),
    )
    return JSONResponse(status_code=422, content=response.model_dump(mode="json"))


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = []
    for error in exc.errors():
        location = [str(part) for part in error.get("loc", ()) if part != "body"]
        details.append(
            {
                "field": ".".join(location) or None,
                "message": error.get("msg", "Invalid request"),
            }
        )
    is_map_request = request.url.path == "/map/v1/projection"
    unsupported_relationship_fields = {
        "hops",
        "legs",
        "route_stops",
        "relationships",
    }
    error_fields = {item["field"] for item in details}
    code = "validation_error"
    if is_map_request and error_fields & unsupported_relationship_fields:
        code = "unsupported_relationship"
    response = APIErrorResponse(
        error=APIErrorDetail(
            code=code,
            message="Invalid map projection request" if is_map_request else "Invalid itinerary request",
        ),
        details=details,
    )
    return JSONResponse(status_code=422, content=response.model_dump(mode="json"))
