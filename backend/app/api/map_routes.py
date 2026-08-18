"""Phase 6A versioned map projection HTTP boundary."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.geospatial.http_adapter import MapProjectionHTTPAdapter
from app.schemas.map_projection import MapProjectionHTTPRequest, MapProjectionResponse

router = APIRouter()


@router.post("/projection", response_model=MapProjectionResponse)
def project_map_http(
    request: MapProjectionHTTPRequest,
    db: Session = Depends(get_db),
) -> MapProjectionResponse:
    """Project only exact typed backend identities through the accepted core."""

    return MapProjectionHTTPAdapter(db).project(request)
