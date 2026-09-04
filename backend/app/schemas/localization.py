"""
Universal Localized Entity Identity Schema.

Provides a reusable, language-first localization contract applicable across
domains: Place, Stop, CraftTradition, ArtisanCluster, RailwayStation, etc.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LocalizedNames(BaseModel):
    """
    Standard multi-lingual name container.
    English (`en`) is the canonical fallback, with Odia (`or`) and Hindi (`hi`)
    as first-class Odishan language representations.
    """
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    en: str = Field(..., description="Canonical English name")
    or_: Optional[str] = Field(None, alias="or", description="Odia (ଓଡ଼ିଆ) script name")
    hi: Optional[str] = Field(None, description="Hindi (हिन्दी) Devanagari script name")

    def resolve(self, lang_code: str = "en") -> str:
        """
        Resolve best matching localized name by requested language code.
        Falls back to English if requested translation is absent.
        """
        normalized = (lang_code or "en").strip().lower()
        if normalized in ("or", "odi", "odia"):
            return self.or_ or self.en
        if normalized in ("hi", "hin", "hindi"):
            return self.hi or self.en
        return self.en

    def to_dict(self) -> dict[str, Optional[str]]:
        """Serialize with 'or' key for canonical JSON storage."""
        return {
            "en": self.en,
            "or": self.or_,
            "hi": self.hi,
        }

    @classmethod
    def from_record(
        cls,
        name: str,
        localized_data: Optional[dict] = None,
    ) -> LocalizedNames:
        """Create a LocalizedNames instance from a record, defaulting English to the primary name."""
        if not localized_data:
            return cls(en=name)
        data = dict(localized_data)
        if "en" not in data or not data["en"]:
            data["en"] = name
        return cls(**data)