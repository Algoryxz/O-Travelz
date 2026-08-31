"""Crowd intelligence contract models."""
from __future__ import annotations

from typing import Literal
from pydantic import Field

from app.schemas.common import ContractModel

CrowdLevel = Literal["low", "moderate", "high", "unknown"]
CrowdConfidence = Literal["low", "medium", "high"]


class RecommendedWindow(ContractModel):
    """Recommended optimal visiting window."""

    start: str = Field(description="Window start time in HH:MM format (24-hour).")
    end: str = Field(description="Window end time in HH:MM format (24-hour).")


class CrowdEstimate(ContractModel):
    """Deterministic structured crowd estimate."""

    level: CrowdLevel = Field(default="unknown", description="Estimated crowd level.")
    confidence: CrowdConfidence = Field(default="low", description="Confidence tier.")
    recommended_window: RecommendedWindow | None = Field(
        default=None,
        description="Recommended visiting window within valid operating hours.",
    )
    factors: list[str] = Field(default_factory=list, description="Auditable reasoning factors.")
    claim_type: str = Field(default="estimated", description="Truthfulness classification.")
    source: str = Field(default="O-TRAVELZ crowd heuristic", description="Provenance origin.")
