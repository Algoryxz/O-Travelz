"""Phase 3 HTTP wiring for the existing transport tool contracts."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.schemas import GetProviderStatusArgs, PlanTransportHopArgs
from app.db.session import get_db
from app.schemas.transport import ProviderStatusContract, TransportHopContract
from app.transport.service import ProviderNotAvailableError, SQLAlchemyPlaceResolver, TransportService

router = APIRouter()


@router.post("/hop", response_model=TransportHopContract)
def plan_transport_hop(args: PlanTransportHopArgs, db: Session = Depends(get_db)) -> TransportHopContract:
    return TransportService(SQLAlchemyPlaceResolver(db)).plan_transport_hop(args)


@router.get("/providers/{provider_id}", response_model=ProviderStatusContract)
def get_provider_status(provider_id: str, db: Session = Depends(get_db)) -> ProviderStatusContract:
    try:
        return TransportService(SQLAlchemyPlaceResolver(db)).get_provider_status(GetProviderStatusArgs(provider_id=provider_id))
    except ProviderNotAvailableError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
