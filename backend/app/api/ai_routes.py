from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.ai.adapter import create_provider_adapter
from app.ai.boundary import ToolExecutionBoundary
from app.ai.contracts import ChatMessage
from app.ai.conversation import GroundedConversationOrchestrator, GroundedConversationResponse
from app.ai.model import RuleBasedModelAdapter
from app.ai.orchestrator import AIOrchestrator
from app.ai.rate_limit import rate_limiter
from app.ai.schemas import AIPlanRequest, AIResponse, AppContextPayload, PlanningConstraints
from app.ai.tools import BuildItineraryTool, GetProviderStatusTool, PlanTransportHopTool, SearchPlacesTool
from app.ai.tools.adapters import create_default_tool_registry
from app.core.config import settings
from app.db.session import get_db
from app.services.itinerary import ItineraryService
from app.services.ranking import SQLAlchemyPlaceRepository
from app.transport.service import SQLAlchemyPlaceResolver, TransportService
from pydantic import BaseModel

router = APIRouter()


class AIConversationRequest(BaseModel):
    messages: list[ChatMessage]
    constraints: PlanningConstraints | None = None
    context: AppContextPayload | None = None


def get_ai_orchestrator(db: Session = Depends(get_db)) -> AIOrchestrator:
    repository = SQLAlchemyPlaceRepository(db)
    transport_service = TransportService(SQLAlchemyPlaceResolver(db))
    itinerary_service = ItineraryService(repository, transport_service)
    return AIOrchestrator(
        RuleBasedModelAdapter(),
        build_itinerary=BuildItineraryTool(itinerary_service),
        plan_transport_hop=PlanTransportHopTool(transport_service),
        get_provider_status=GetProviderStatusTool(transport_service),
        search_places=SearchPlacesTool(db),
    )


def get_grounded_orchestrator(db: Session = Depends(get_db)) -> GroundedConversationOrchestrator:
    repository = SQLAlchemyPlaceRepository(db)
    transport_service = TransportService(SQLAlchemyPlaceResolver(db))
    itinerary_service = ItineraryService(repository, transport_service)
    registry = create_default_tool_registry(db, itinerary_service, transport_service)
    boundary = ToolExecutionBoundary(registry)
    provider_adapter = create_provider_adapter(settings)
    return GroundedConversationOrchestrator(
        registry=registry,
        boundary=boundary,
        provider_adapter=provider_adapter,
        model_adapter=RuleBasedModelAdapter(),
    )


@router.post("/plan", response_model=AIResponse)
def plan_with_ai(
    request: AIPlanRequest,
    req: Request,
    orchestrator: GroundedConversationOrchestrator = Depends(get_grounded_orchestrator),
) -> AIResponse:
    client_ip = req.client.host if req.client else "127.0.0.1"
    is_ext = getattr(settings, "ai_allow_external_provider", False) and getattr(settings, "ai_provider", "") not in ("mock", "rule_based")
    rate_limiter.enforce_rate_limit(client_ip, is_external_request=is_ext, settings=settings)
    return orchestrator.plan_with_ai(request.message, request.constraints)


@router.post("/converse", response_model=GroundedConversationResponse)
def converse_with_ai(
    request: AIConversationRequest,
    req: Request,
    orchestrator: GroundedConversationOrchestrator = Depends(get_grounded_orchestrator),
) -> GroundedConversationResponse:
    client_ip = req.client.host if req.client else "127.0.0.1"
    is_ext = getattr(settings, "ai_allow_external_provider", False) and getattr(settings, "ai_provider", "") not in ("mock", "rule_based")
    rate_limiter.enforce_rate_limit(client_ip, is_external_request=is_ext, settings=settings)
    return orchestrator.converse(request.messages, request.constraints, app_context=request.context)
