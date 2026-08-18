"""O-Travelz backend entrypoint."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.api.transport_routes import router as transport_router
from app.api.itinerary_routes import router as itinerary_router
from app.schemas.api import APIErrorDetail, APIErrorResponse
from app.services.itinerary import ItineraryPlanningError

app = FastAPI(
    title="O-Travelz API",
    description="Transportation-aware itinerary planning for O-Travelz.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict:
    """Basic liveness check used by docker-compose / CI."""
    return {"status": "ok"}


app.include_router(transport_router, prefix="/transport", tags=["transport"])
app.include_router(itinerary_router, prefix="/itinerary", tags=["itinerary"])


# from app.api.ai_routes import router as ai_router
# app.include_router(ai_router, prefix="/itinerary", tags=["ai"])


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
    response = APIErrorResponse(
        error=APIErrorDetail(code="validation_error", message="Invalid itinerary request"),
        details=details,
    )
    return JSONResponse(status_code=422, content=response.model_dump(mode="json"))
