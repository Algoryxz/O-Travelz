#!/usr/bin/env python3
"""
scripts/compute_c5_4_collection_leverage.py — Phase 2 Collection Leverage Analyzer.

Ranks the 79 remaining non-renderable transit sequences by information gain leverage
across the whole transit network.
"""
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def main():
    with open(REPO_ROOT / "data/transport/staging/ama_bus/c5_route_geometry.json", encoding="utf-8") as f:
        routes = json.load(f)

    with open(REPO_ROOT / "data/transport/canonical/stops.json", encoding="utf-8") as f:
        stops_list = json.load(f)

    stops_by_id = {s["stop_id"]: s for s in stops_list}

    # Non-renderable sequences (79 total)
    non_renderable = [r for r in routes if not r["is_renderable"]]
    print(f"Analyzing {len(non_renderable)} non-renderable sequences...")

    # Stop to sequences mapping
    stop_to_seqs = defaultdict(set)
    stop_to_unres_seqs = defaultdict(set)
    for r in routes:
        sid = r["sequence_id"]
        for a in r["anchor_stops"]:
            st_id = a.get("stop_id") or a.get("canonical_stop_id")
            if st_id:
                stop_to_seqs[st_id].add(sid)
                if not r["is_renderable"]:
                    stop_to_unres_seqs[st_id].add(sid)

    scored_sequences = []
    for r in non_renderable:
        sid = r["sequence_id"]
        rnum = r["route_number"]
        region = r.get("region", "Capital Region")
        anchors = r["anchor_stops"]
        num_stops = len(anchors)
        num_segs = max(0, num_stops - 1)

        unres_stops = 0
        candidate_stops = 0
        generic_stops = 0
        shared_stop_links = 0
        shared_unres_links = 0
        indirect_benefiting_seqs = set()

        for a in anchors:
            st_id = a.get("stop_id") or a.get("canonical_stop_id")
            res_status = a.get("stop_resolution_status", "UNRESOLVED")
            if res_status in ("UNRESOLVED", "LOCALITY_ONLY"):
                unres_stops += 1
            if a.get("render_candidate_marker"):
                candidate_stops += 1
            s_obj = stops_by_id.get(st_id, {})
            name = a.get("name", "")
            if any(w in name.lower() for w in ["square", "chhak", "chowk", "market", "basti", "terminal", "gate", "road", "stand"]):
                generic_stops += 1

            other_seqs = stop_to_seqs[st_id] - {sid}
            shared_stop_links += len(other_seqs)
            other_unres = stop_to_unres_seqs[st_id] - {sid}
            shared_unres_links += len(other_unres)
            indirect_benefiting_seqs.update(other_unres)

        est_duration_min = round(10 + num_stops * 2.5)
        difficulty = "HIGH" if num_stops >= 20 else ("MEDIUM" if num_stops >= 10 else "LOW")

        leverage_score = round(
            (unres_stops * 3.0) +
            (len(indirect_benefiting_seqs) * 4.0) +
            (candidate_stops * 2.0) +
            (generic_stops * 1.5) +
            (shared_unres_links * 1.0),
            1
        )

        origin = anchors[0]["name"] if anchors else "Unknown"
        dest = anchors[-1]["name"] if anchors else "Unknown"

        scored_sequences.append({
            "sequence_id": sid,
            "route_number": rnum,
            "direction": r.get("direction", "forward"),
            "region": region,
            "origin": origin,
            "destination": dest,
            "total_stops": num_stops,
            "unresolved_stops_count": unres_stops,
            "unresolved_segments_count": num_segs,
            "candidate_stops_count": candidate_stops,
            "generic_stops_count": generic_stops,
            "shared_stops_total_links": shared_stop_links,
            "shared_unresolved_links": shared_unres_links,
            "indirect_benefiting_sequences_count": len(indirect_benefiting_seqs),
            "indirect_benefiting_sequences": sorted(list(indirect_benefiting_seqs)),
            "estimated_ride_duration_min": est_duration_min,
            "collection_difficulty": difficulty,
            "leverage_score": leverage_score
        })

    scored_sequences.sort(key=lambda x: x["leverage_score"], reverse=True)

    def compute_cumulative_gain(seq_list):
        seen_stops = set()
        seen_segs = set()
        seen_indirect = set()
        total_time = 0
        for s in seq_list:
            total_time += s["estimated_ride_duration_min"]
            r_obj = next(r for r in non_renderable if r["sequence_id"] == s["sequence_id"])
            for a in r_obj["anchor_stops"]:
                st_id = a.get("stop_id") or a.get("canonical_stop_id")
                if a.get("stop_resolution_status") in ("UNRESOLVED", "LOCALITY_ONLY"):
                    seen_stops.add(st_id)
            for seg in r_obj.get("segments", []):
                seen_segs.add(f"{s['sequence_id']}_{seg['segment_index']}")
            seen_indirect.update(s["indirect_benefiting_sequences"])
        return {
            "unique_uncertain_stops_touched": len(seen_stops),
            "unique_uncertain_segments_touched": len(seen_segs),
            "indirect_sequences_benefiting": len(seen_indirect),
            "total_estimated_duration_min": total_time
        }

    best_1 = scored_sequences[:1]
    best_3 = scored_sequences[:3]
    best_5 = scored_sequences[:5]
    best_10 = scored_sequences[:10]

    # Concrete 4-hour recommendation for Smarak:
    # 4 hours = 240 minutes. Pick top 2-3 high-leverage routes in Capital Region with cumulative time <= 240 min.
    capital_top = [s for s in scored_sequences if s["region"] == "Capital Region"]
    four_hour_plan = []
    cum_time = 0
    for s in capital_top:
        if cum_time + s["estimated_ride_duration_min"] <= 240:
            four_hour_plan.append(s)
            cum_time += s["estimated_ride_duration_min"]
        if len(four_hour_plan) == 3:
            break

    four_hour_gain = compute_cumulative_gain(four_hour_plan)

    report = {
        "report_name": "transit_c5_4_collection_leverage",
        "simulation_label": "THEORETICAL_COLLECTION_LEVERAGE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_unresolved_sequences_analyzed": len(non_renderable),
        "methodology": {
            "scoring_formula": "leverage_score = (unresolved_stops * 3) + (indirect_benefiting_sequences * 4) + (candidate_stops * 2) + (generic_stops * 1.5) + (shared_unresolved_links * 1)",
            "goal": "Prioritize physical bus rides that maximize network-wide information gain across multiple overlapping routes."
        },
        "four_hour_recommendation": {
            "question": "If Smarak has four hours, which 2–3 actual bus rides should he take first to improve O-TRAVELZ the most?",
            "recommended_routes": [
                {
                    "rank": idx + 1,
                    "route_number": s["route_number"],
                    "sequence_id": s["sequence_id"],
                    "region": s["region"],
                    "corridor": f"{s['origin']} -> {s['destination']}",
                    "stops_count": s["total_stops"],
                    "unresolved_stops": s["unresolved_stops_count"],
                    "estimated_duration_min": s["estimated_ride_duration_min"],
                    "why": f"Touches {s['unresolved_stops_count']} unresolved stops and directly assists {s['indirect_benefiting_sequences_count']} other routes through shared transit junctions."
                }
                for idx, s in enumerate(four_hour_plan)
            ],
            "cumulative_impact": {
                "total_duration_hours": round(four_hour_gain["total_estimated_duration_min"] / 60, 2),
                "unique_uncertain_stops_touched": four_hour_gain["unique_uncertain_stops_touched"],
                "unique_uncertain_segments_touched": four_hour_gain["unique_uncertain_segments_touched"],
                "other_routes_indirectly_benefiting": four_hour_gain["indirect_sequences_benefiting"]
            },
            "disclaimer": "Ground-truth recording on these routes provides spatial observation evidence; stops become verified only upon meeting multi-observation consensus criteria."
        },
        "ranked_bundles": {
            "best_1_route": {
                "route": best_1[0],
                "cumulative_gain": compute_cumulative_gain(best_1)
            },
            "best_3_routes": {
                "routes": best_3,
                "cumulative_gain": compute_cumulative_gain(best_3)
            },
            "best_5_routes": {
                "routes": best_5,
                "cumulative_gain": compute_cumulative_gain(best_5)
            },
            "best_10_routes": {
                "routes": best_10,
                "cumulative_gain": compute_cumulative_gain(best_10)
            }
        },
        "all_ranked_sequences": scored_sequences
    }

    out_path = REPO_ROOT / "reports/transit_c5_4_collection_leverage.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Generated {out_path} successfully.")
    print("\n--- 4-HOUR ACTION PLAN FOR SMARAK ---")
    for r in report["four_hour_recommendation"]["recommended_routes"]:
        print(f"#{r['rank']}: Route {r['route_number']} ({r['region']}): {r['corridor']} ({r['estimated_duration_min']}m)")
    print(f"Total time: {report['four_hour_recommendation']['cumulative_impact']['total_duration_hours']} hours")
    print(f"Unique uncertain stops touched: {report['four_hour_recommendation']['cumulative_impact']['unique_uncertain_stops_touched']}")
    print(f"Other sequences benefiting: {report['four_hour_recommendation']['cumulative_impact']['other_routes_indirectly_benefiting']}")

if __name__ == "__main__":
    main()
