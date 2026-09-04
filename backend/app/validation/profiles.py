"""
Validation Profiles for O-TRAVELZ V4 Canonical Data Quality.
"""
from typing import Set
from app.validation.models import ValidationProfile
from app.validation import codes

# CI Profile enforces formally adopted clean invariants.
# Legacy debt does not break CI until baselined / remediated.
CI_BLOCKING_CODES: Set[str] = {
    codes.ID_MISSING_IDENTIFIER,
    codes.ID_DUPLICATE_ENTITY_ID,
    codes.LOC_MISSING_CANONICAL_EN,
    codes.LOC_INVALID_STRUCTURE,
    codes.LOC_EMPTY_STRING,
    codes.PRV_MISSING_SOURCE,
    codes.PRV_INVALID_STATUS,
    codes.GEO_OUT_OF_WGS84,
    codes.GEO_LAT_LON_SWAP,
    codes.GEO_UNRESOLVED_NON_NULL,
    codes.REL_DUPLICATE_EDGE,
    codes.REL_SELF_LOOP,
    codes.MED_INVALID_SHA256,
    codes.MED_REJECTED_PUBLIC,
    codes.MED_TECHNICAL_AS_PHOTO,
    codes.TRN_UNKNOWN_PROVIDER,
    codes.TRN_UNKNOWN_STOP,
    codes.TRN_DUPLICATE_SEQUENCE,
    codes.TRN_INVALID_SCHEDULE_TIME,
    codes.TRN_SCHEDULE_NOT_SORTED,
    codes.TRN_COORDINATE_WITHOUT_PROVENANCE,
    codes.TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE,
}