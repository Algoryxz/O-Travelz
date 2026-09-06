#!/usr/bin/env python3
"""
scripts/compile_c5_4_observation_registry.py — Wave C5.4 Observation Candidate Registry Generator.

Aggregates field observations into data/transport/staging/ama_bus/c5_4_observation_candidates.json.
Enforces:
- Separation of test fixtures from real production observations.
- Multi-session consensus rules.
- Zero mutation of canonical stops.json.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.db.session import SessionLocal
from app.models.transit_observation import TransitStopObservation, TransitRideSession
from app.transport.trace_processor import ConsensusEngine

def main():
    db = SessionLocal()
    try:
        # Query non-test-fixture observations
        real_obs = (
            db.query(TransitStopObservation)
            .filter(TransitStopObservation.is_test_fixture == False)
            .all()
        )
        real_sessions = (
            db.query(TransitRideSession)
            .filter(TransitRideSession.is_test_fixture == False)
            .all()
        )

        with open(REPO_ROOT / "data/transport/staging/ama_bus/c5_stop_resolution.json", encoding="utf-8") as f:
            c5_stops = json.load(f)
        c5_by_id = {s["stop_id"]: s for s in c5_stops}

        # Group observations by canonical_stop_id
        obs_by_stop = {}
        for o in real_obs:
            if not o.canonical_stop_id:
                continue
            if o.canonical_stop_id not in obs_by_stop:
                obs_by_stop[o.canonical_stop_id] = []
            obs_by_stop[o.canonical_stop_id].append({
                "observation_id": str(o.id),
                "session_id": str(o.session_id) if o.session_id else None,
                "contributor_hash": o.contributor_hash,
                "latitude": o.latitude,
                "longitude": o.longitude,
                "accuracy_m": o.accuracy_m,
                "observation_type": o.observation_type,
                "observed_at": o.observed_at.isoformat() if o.observed_at else None,
                "confirmation_value": o.confirmation_value,
                "stop_association_status": o.stop_association_status,
                "is_test_fixture": o.is_test_fixture,
            })

        candidate_records = []
        for stop_id, obs_list in obs_by_stop.items():
            consensus = ConsensusEngine.evaluate_stop_observations(obs_list)
            c5_entry = c5_by_id.get(stop_id, {})
            record = {
                "canonical_stop_id": stop_id,
                "canonical_name": c5_entry.get("canonical_name", stop_id),
                "region": c5_entry.get("region"),
                "current_coordinate_status": c5_entry.get("resolution_status", "UNRESOLVED"),
                "current_c5_candidate": {
                    "lat": c5_entry.get("candidate_lat"),
                    "lon": c5_entry.get("candidate_lon"),
                    "source": c5_entry.get("candidate_source"),
                },
                "observed_candidate": {
                    "centroid_latitude": consensus.get("centroid_latitude"),
                    "centroid_longitude": consensus.get("centroid_longitude"),
                    "dispersion_radius_m": consensus.get("dispersion_radius_m"),
                },
                "total_observations": len(obs_list),
                "independent_sessions_count": consensus.get("independent_session_count", 0),
                "contributor_count": consensus.get("contributor_count", 0),
                "evidence_types": sorted(list(set(o["observation_type"] for o in obs_list))),
                "contradictions_count": sum(1 for o in obs_list if o.get("stop_association_status") == "CONTRADICTS_CURRENT_CANDIDATE"),
                "consensus_status": consensus.get("consensus_status", "OBSERVED_ONCE"),
                "is_review_ready": consensus.get("is_review_ready", False),
                "observations": obs_list,
            }
            candidate_records.append(record)

        registry_payload = {
            "registry_name": "c5_4_observation_candidates",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "real_ride_sessions_count": len(real_sessions),
            "real_observations_count": len(real_obs),
            "candidate_stops_count": len(candidate_records),
            "review_ready_stops_count": sum(1 for c in candidate_records if c["is_review_ready"]),
            "canonical_stop_coordinates_changed": 0,
            "candidates": candidate_records,
        }

        out_path = REPO_ROOT / "data/transport/staging/ama_bus/c5_4_observation_candidates.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(registry_payload, f, indent=2)

        print(f"Saved {out_path} (Real sessions: {len(real_sessions)}, Real obs: {len(real_obs)}, Candidates: {len(candidate_records)})")
    finally:
        db.close()

if __name__ == "__main__":
    main()
