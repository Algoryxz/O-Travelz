"""Phase 4 facts-only itinerary HTTP boundary."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api import ItineraryPlanResponse
from app.schemas.itinerary import ItineraryPlanRequest
from app.services.itinerary import ItineraryService
from app.services.ranking import SQLAlchemyPlaceRepository
from app.transport.service import SQLAlchemyPlaceResolver, TransportService

router = APIRouter()


@router.post("/plan", response_model=ItineraryPlanResponse)
def plan_itinerary(
    request: ItineraryPlanRequest,
    db: Session = Depends(get_db),
) -> ItineraryPlanResponse:
    repository = SQLAlchemyPlaceRepository(db)
    transport_service = TransportService(SQLAlchemyPlaceResolver(db))
    return ItineraryService(repository, transport_service).plan(request)
