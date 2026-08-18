"""
O-Travelz backend entrypoint.

Owner: Rudra for backend/API wiring, with Smarak owning the itinerary and AI
orchestration logic behind those routes. Router modules are stubbed here and filled in
by their owners in later phases.
"""
from fastapi import FastAPI
from app.api.transport_routes import router as transport_router

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


# Routers are registered here as they land. Left commented until their owners'
# phases are complete, so `main.py` always reflects what's actually wired up.
#
# from app.api.itinerary_routes import router as itinerary_router
# app.include_router(itinerary_router, prefix="/itinerary", tags=["itinerary"])
#
# from app.api.ai_routes import router as ai_router
# app.include_router(ai_router, prefix="/itinerary", tags=["ai"])
