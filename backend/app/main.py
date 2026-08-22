"""O-Travelz backend entrypoint."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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
from app.geospatial.http_adapter import MapProjectionHTTPError
from app.schemas.api import APIErrorDetail, APIErrorResponse
from app.services.itinerary import ItineraryPlanningError

import os

app = FastAPI(
    title="O-Travelz API",
    description="Transportation-aware itinerary planning for O-Travelz.",
    version="0.1.0",
)

cors_origins_raw = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_raw.strip() == "*":
    cors_origins = ["*"]
    allow_credentials = False
else:
    cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Basic liveness check used by docker-compose / CI."""
    return {"status": "ok"}


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(sync_router, prefix="/api/v1/sync", tags=["sync"])
app.include_router(share_router, tags=["share"])
app.include_router(transport_router, prefix="/transport", tags=["transport"])
app.include_router(itinerary_router, prefix="/itinerary", tags=["itinerary"])
app.include_router(places_router, prefix="/places", tags=["places"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(map_router, prefix="/map/v1", tags=["map"])
app.include_router(image_router, prefix="/api/v1/images", tags=["images"])
app.include_router(image_router, prefix="/static/images", tags=["images"])
app.include_router(weather_router, prefix="/weather", tags=["weather"])



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
