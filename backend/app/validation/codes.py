"""
Deterministic Issue Code Taxonomy for O-TRAVELZ V4 Canonical Data Quality.

Stable, machine-readable identifiers suitable for CI/CD gates, automated reporting,
and regression gating.
"""

# -----------------------------------------------------------------------------
# 1. IDENTITY DOMAIN (ID_*)
# -----------------------------------------------------------------------------
ID_MISSING_IDENTIFIER = "ID_MISSING_IDENTIFIER"
ID_DUPLICATE_ENTITY_ID = "ID_DUPLICATE_ENTITY_ID"
ID_NAME_COLLISION = "ID_NAME_COLLISION"

# -----------------------------------------------------------------------------
# 2. LOCALIZATION DOMAIN (LOC_*)
# -----------------------------------------------------------------------------
LOC_INVALID_STRUCTURE = "LOC_INVALID_STRUCTURE"
LOC_MISSING_CANONICAL_EN = "LOC_MISSING_CANONICAL_EN"
LOC_EMPTY_STRING = "LOC_EMPTY_STRING"
LOC_INVALID_LOCALE = "LOC_INVALID_LOCALE"
LOC_ODIA_ABSENT = "LOC_ODIA_ABSENT"
LOC_HINDI_ABSENT = "LOC_HINDI_ABSENT"

# -----------------------------------------------------------------------------
# 3. PROVENANCE DOMAIN (PRV_*)
# -----------------------------------------------------------------------------
PRV_MISSING_SOURCE = "PRV_MISSING_SOURCE"
PRV_INVALID_STATUS = "PRV_INVALID_STATUS"
PRV_OFFICIAL_UNVERIFIED = "PRV_OFFICIAL_UNVERIFIED"
PRV_STALE_VERIFICATION = "PRV_STALE_VERIFICATION"

# -----------------------------------------------------------------------------
# 4. GEOSPATIAL DOMAIN (GEO_*)
# -----------------------------------------------------------------------------
GEO_OUT_OF_WGS84 = "GEO_OUT_OF_WGS84"
GEO_LAT_LON_SWAP = "GEO_LAT_LON_SWAP"
GEO_OUT_OF_EXPECTED_REGION = "GEO_OUT_OF_EXPECTED_REGION"
GEO_UNRESOLVED_NON_NULL = "GEO_UNRESOLVED_NON_NULL"
GEO_MISSING_COORDINATES = "GEO_MISSING_COORDINATES"

# -----------------------------------------------------------------------------
# 5. RELATIONSHIPS DOMAIN (REL_*)
# -----------------------------------------------------------------------------
REL_ORPHAN_REFERENCE = "REL_ORPHAN_REFERENCE"
REL_INVALID_TYPE = "REL_INVALID_TYPE"
REL_DUPLICATE_EDGE = "REL_DUPLICATE_EDGE"
REL_SELF_LOOP = "REL_SELF_LOOP"
REL_UNASSIGNED_CONFIDENCE = "REL_UNASSIGNED_CONFIDENCE"

# -----------------------------------------------------------------------------
# 6. MEDIA DOMAIN (MED_*)
# -----------------------------------------------------------------------------
MED_INVALID_SHA256 = "MED_INVALID_SHA256"
MED_INVALID_STORAGE_KEY = "MED_INVALID_STORAGE_KEY"
MED_ORPHAN_ASSOCIATION = "MED_ORPHAN_ASSOCIATION"
MED_REJECTED_PUBLIC = "MED_REJECTED_PUBLIC"
MED_TECHNICAL_AS_PHOTO = "MED_TECHNICAL_AS_PHOTO"
MED_CROSS_ENTITY_REUSE = "MED_CROSS_ENTITY_REUSE"
MED_REGISTRY_DESYNC = "MED_REGISTRY_DESYNC"

# -----------------------------------------------------------------------------
# 7. TRANSIT DOMAIN (TRN_*)
# -----------------------------------------------------------------------------
TRN_UNKNOWN_PROVIDER = "TRN_UNKNOWN_PROVIDER"
TRN_UNKNOWN_STOP = "TRN_UNKNOWN_STOP"
TRN_SEQUENCE_GAP = "TRN_SEQUENCE_GAP"
TRN_DUPLICATE_SEQUENCE = "TRN_DUPLICATE_SEQUENCE"
TRN_INVALID_SCHEDULE_TIME = "TRN_INVALID_SCHEDULE_TIME"
TRN_SCHEDULE_NOT_SORTED = "TRN_SCHEDULE_NOT_SORTED"
TRN_COORDINATE_WITHOUT_PROVENANCE = "TRN_COORDINATE_WITHOUT_PROVENANCE"
TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE = "TRN_LIVE_CLAIM_WITHOUT_REALTIME_SOURCE"