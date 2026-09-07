# O-TRAVELZ Mobile V4 — Product Event & Quality Telemetry Model

> **Authoritative Observability Specification**  
> Core Policy: **Privacy-First Observability; Zero Invasive Surveillance**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Privacy-Preserving Event Architecture

O-TRAVELZ Mobile records telemetry **strictly** to measure system reliability, UI crash resilience, and high-level journey completion.
- **NEVER RECORDED**: Precise raw GPS continuous tracking trails, free-form AI chat conversation texts, personal identity names, or financial payment details.
- **AGGREGATED & ANONYMIZED**: Session identifiers rotate and are never cross-referenced across third-party ad networks.

---

## 2. Permitted Quality & Journey Events

| Event Name | Category | Parameters Captured | Purpose & Quality Metric |
|---|---|---|---|
| `place_opened` | Journey | `place_id`, `district`, `entry_surface` | Measures catalog interest and district discovery balance. |
| `place_saved` | Journey | `place_id`, `total_saved_count` | Evaluates traveler bookmark conversion rate. |
| `plan_requested` | Planning | `duration_days`, `travel_style`, `start_hub` | Analyzes common travel constraints entered by users. |
| `plan_generated` | Planning | `duration_days`, `solver_latency_ms`, `is_fallback` | Tracks itinerary solver speed and fallback frequency. |
| `route_opened` | Transit | `route_id`, `operator` (CRUT / OSRTC) | Identifies highest-demand public bus corridors. |
| `trip_started` | Active Trip | `trip_id`, `days_count` | Measures transition from planning to real-world travel. |
| `trip_stop_completed`| Active Trip | `trip_id`, `stop_index`, `is_on_time` | Evaluates schedule realism and milestone pacing. |
| `offline_entered` | System | `duration_offline_ms`, `cached_items_viewed` | Proves offline catalog resilience in remote areas. |
| `navigation_handoff`| Navigation | `destination_lat_lon_coarse`, `target_app` | Measures handoffs to Google Maps / Apple Maps. |
| `stop_checkin_submitted`| Verification | `route_id`, `stop_id` (anonymized device ID) | Feeds crowdsourced transit stop consensus engine. |
