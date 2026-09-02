package com.otravelz.shared.provenance

/**
 * Describes the provenance and authority tier of a data record.
 * Answers: "Where did this factual claim or coordinate originate?"
 */
enum class ProvenanceSource {
    /**
     * Verified directly from official government records, gazettes, or transport agency publications
     * (e.g. CRUT route documents, Archaeological Survey of India records).
     */
    VERIFIED_OFFICIAL,

    /**
     * Verified through geospatial satellite cross-referencing, OpenStreetMap, or Nominatim geocoding
     * with high-confidence coordinate matches.
     */
    VERIFIED_GEOSPATIAL,

    /**
     * Verified through on-the-ground contributor review and photographic evidence.
     */
    COMMUNITY_VERIFIED,

    /**
     * Statically researched from secondary sources (e.g. baseline Google Maps ratings, benchmark hours)
     * pending primary official verification.
     */
    RESEARCHED,

    /**
     * Unverified record or draft candidate. Not publishable to the production catalog.
     */
    UNVERIFIED
}

/**
 * Describes the temporal and freshness state of a data record at runtime.
 * Answers: "How fresh or dynamic is this observation right now?"
 */
enum class DataTier {
    /**
     * Real-time live telemetry or observation (e.g. Open-Meteo live API, genuine vehicle GPS).
     */
    LIVE,

    /**
     * Sourced from a published timetable or schedule (e.g. CRUT official bus departure times).
     * Must never be represented as live vehicle tracking.
     */
    SCHEDULED,

    /**
     * Calculated via deterministic heuristics or spherical math (e.g. Haversine distance,
     * walking time estimates).
     */
    ESTIMATED,

    /**
     * Served from bundled offline fallback datasets when live backend connectivity is unavailable.
     */
    FALLBACK,

    /**
     * Data is missing or unavailable. Must not default to fake values (e.g. 0°C or fake 0m).
     */
    UNAVAILABLE
}

/**
 * Structured claim attribution used for AI and search explainability.
 */
enum class ClaimType {
    FACTUAL_VERIFIED,
    SCHEDULED_TIMETABLE,
    GEOSPATIAL_ESTIMATE,
    LIVE_OBSERVATION,
    GENERAL_KNOWLEDGE
}
