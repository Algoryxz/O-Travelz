"""Minimal conversational planning boundary for Phase 5."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.model import RuleBasedModelAdapter
from app.ai.orchestrator import AIOrchestrator
from app.ai.schemas import AIPlanRequest, AIResponse
from app.ai.tools import BuildItineraryTool, GetProviderStatusTool, PlanTransportHopTool
from app.db.session import get_db
from app.services.itinerary import ItineraryService
from app.services.ranking import SQLAlchemyPlaceRepository
from app.transport.service import SQLAlchemyPlaceResolver, TransportService

router = APIRouter()


def get_ai_orchestrator(db: Session = Depends(get_db)) -> AIOrchestrator:
    repository = SQLAlchemyPlaceRepository(db)
    transport_service = TransportService(SQLAlchemyPlaceResolver(db))
    itinerary_service = ItineraryService(repository, transport_service)
    return AIOrchestrator(
        RuleBasedModelAdapter(),
        build_itinerary=BuildItineraryTool(itinerary_service),
        plan_transport_hop=PlanTransportHopTool(transport_service),
        get_provider_status=GetProviderStatusTool(transport_service),
    )


@router.post("/plan", response_model=AIResponse)
def plan_with_ai(request: AIPlanRequest, orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)) -> AIResponse:
    return orchestrator.orchestrate(request.message, request.constraints)
