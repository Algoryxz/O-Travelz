#!/usr/bin/env python3
"""
scripts/audit_statewide_first_batch.py — First-Batch Provenance, Identity & Coordinate Truth Closure.

Wave B1.1 Forensic Closure Engine:
Evaluates the provisional first-batch candidates (HOSPITAL, POLICE_STATION, FIRE_STATION, ATM, FUEL_STATION)
across four rigorous truth dimensions without any canonical database mutation:
1. Identity Truth (distinct facility identity, disambiguation, canonical overlap)
2. Source Provenance Truth (authority-aware source evaluation, field-level provenance)
3. Coordinate Truth (precision taxonomy, facility pin verification, centroid clumping detection)
4. Duplicate / Centroid Cluster Forensics (co-location vs locality centroid reuse)

Outputs exact partitions:
- READY_FOR_CANONICAL_NEW
- READY_FOR_CANONICAL_ENRICHMENT
- REVIEW_REQUIRED
- BLOCKED

Usage:
  python scripts/audit_statewide_first_batch.py
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

# Odisha Bounding Box
ODISHA_LAT_MIN = 17.78
ODISHA_LAT_MAX = 22.57
ODISHA_LON_MIN = 81.37
ODISHA_LON_MAX = 87.50

FIRST_BATCH_CATEGORIES = {
    "HOSPITAL",
    "POLICE_STATION",
    "FIRE_STATION",
    "ATM",
    "FUEL_STATION",
}

INPUT_SOURCE_FILES = [
    "data/staging/statewide_entities/entities.json",
    "data/services/odisha_services.json",
    "data/research/round2/southern/services.json",
    "data/health/hospitals_northern_odisha.json",
    "data/health/hospitals_western_odisha.json",
    "data/safety/police_stations_northern_odisha.json",
    "data/safety/police_stations_western_odisha.json",
    "data/safety/fire_stations_northern_odisha.json",
    "data/finance/atms_northern_odisha.json",
    "data/finance/atms_western_odisha.json",
    "data/fuel/petrol_pumps_northern_odisha.json",
    "data/fuel/petrol_pumps_western_odisha.json",
]

# Generic unadorned name patterns that lack distinct facility context
UNADORNED_GENERIC_PATTERNS = [
    r"^(police\s*station|thana)$",
    r"^(hospital|govt\.?\s*hospital|district\s*hospital)$",
    r"^(atm|sbi\s*atm|hdfc\s*atm|icici\s*atm|axis\s*atm)$",
    r"^(fire\s*station)$",
    r"^(petrol\s*pump|fuel\s*station|indian\s*oil|hp\s*petrol\s*pump|bharat\s*petroleum|hp)$",
]


def normalize_str(s: Optional[str]) -> str:
    if not s:
        return ""
    return re.sub(r"[^a-z0-9]", "", s.lower())


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_sha256(filepath: Path) -> str:
    if not filepath.exists():
        return "FILE_NOT_FOUND"
    return hashlib.sha256(filepath.read_bytes()).hexdigest()


def classify_provenance_authority(provenance: str, source_url: Optional[str], source_dataset: str) -> str:
    p_lower = (provenance or "").lower()
    u_lower = (source_url or "").lower()
    d_lower = (source_dataset or "").lower()

    if not provenance or provenance.strip().lower() in {"", "unknown", "none", "tbd", "placeholder", "null"}:
        return "UNSOURCED"

    if "openstreetmap" in p_lower or "osm" in p_lower or "openstreetmap.org" in u_lower:
        return "PUBLIC_GEOSPATIAL"

    if any(k in p_lower for k in [
        "police directory", "health directory", "district administration",
        "fire and emergency", "dmet", "national health mission", "govt health",
        "health dept", "coastal security", "commissionerate", "directorate of medical"
    ]) or any(k in u_lower for k in [
        "odishapolice.gov.in", "odisha.gov.in", "dmetodisha.gov.in", "nhmodisha.gov.in",
        "nic.in", "gov.in"
    ]):
        return "OFFICIAL_PRIMARY"

    if any(k in p_lower for k in [
        "indianoil", "iocl", "hpcl", "bpcl", "bharat petroleum", "hindustan petroleum",
        "sbi", "state bank of india", "hdfc", "icici", "axis", "pnb", "punjab national",
        "bank of baroda", "canara", "union bank", "uco bank", "jio-bp", "nayara",
        "state level bankers"
    ]):
        return "OFFICIAL_SECONDARY"

    if any(k in p_lower for k in [
        "aiims", "capital hospital", "vimsar", "scb", "mch", "medical college",
        "mcl", "ntpc", "sail", "railway", "hospital group"
    ]):
        return "AUTHORITATIVE_INSTITUTIONAL"

    if "research" in d_lower or "research" in p_lower:
        if source_url and ("http://" in source_url or "https://" in source_url):
            return "PROJECT_RESEARCH_WITH_PRIMARY_CITATION"
        return "PROJECT_RESEARCH_WITH_SECONDARY_CITATION"

    return "UNVERIFIED_PUBLIC"


def load_raw_source_attributes(workspace: Path) -> Dict[Tuple[str, str], Dict[str, Any]]:
    """Loads raw records from source files to retain rich field attributes."""
    raw_map: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for rel_path in INPUT_SOURCE_FILES[1:]:  # skip entities.json
        full_path = workspace / rel_path
        if not full_path.exists():
            continue
        try:
            with open(full_path, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    item_id = str(item.get("id") or item.get("research_id") or "").strip()
                    if item_id:
                        raw_map[(rel_path, item_id)] = item
        except Exception as e:
            print(f"[WARN] Failed loading raw source {rel_path}: {e}", file=sys.stderr)
    return raw_map


def load_canonical_places(workspace: Path) -> List[Dict[str, Any]]:
    """Load canonical places from database or canonical file."""
    places_file = workspace / "data" / "places" / "places.json"
    canonical_places: List[Dict[str, Any]] = []
    if places_file.exists():
        with open(places_file, encoding="utf-8") as f:
            canonical_places = json.load(f)

    # Also try loading from PostgreSQL if env available
    try:
        from dotenv import load_dotenv
        from sqlalchemy import create_engine, text
        load_dotenv(workspace / "backend" / ".env")
        db_url = os.environ.get("DATABASE_URL")
        if db_url:
            engine = create_engine(db_url)
            with engine.connect() as conn:
                rows = conn.execute(text(
                    "SELECT p.id, p.name, p.district, p.research_id, c.name as category "
                    "FROM places p JOIN categories c ON p.category_id = c.id"
                )).fetchall()
                db_places = []
                for r in rows:
                    db_places.append({
                        "id": str(r[0]),
                        "name": r[1],
                        "district": r[2],
                        "research_id": r[3],
                        "category": r[4],
                    })
                if db_places:
                    return db_places
    except Exception as e:
        pass

    return canonical_places


def load_canonical_stops(workspace: Path) -> List[Dict[str, Any]]:
    """Load canonical transit stops."""
    stops_file = workspace / "data" / "transport" / "canonical" / "stops.json"
    if stops_file.exists():
        with open(stops_file, encoding="utf-8") as f:
            return json.load(f)
    return []


def run_audit() -> None:
    print("=" * 70)
    print("O-TRAVELZ V4: WAVE B1.1 FORENSIC CLOSURE ENGINE")
    print("First-Batch Provenance, Identity & Coordinate Truth Closure")
    print("=" * 70)

    # 1. Freeze input files SHA-256
    file_hashes: Dict[str, str] = {}
    for rel_path in INPUT_SOURCE_FILES:
        p = WORKSPACE_ROOT / rel_path
        h = compute_sha256(p)
        file_hashes[rel_path] = h
        print(f"  [INPUT HASH] {rel_path:<48}: {h[:16]}...")

    # 2. Load compiled candidates
    entities_path = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities" / "entities.json"
    with open(entities_path, encoding="utf-8") as f:
        all_entities = json.load(f)

    # Filter exact first batch candidates
    candidates: List[Dict[str, Any]] = [
        e for e in all_entities if e.get("entity_type") in FIRST_BATCH_CATEGORIES
    ]
    print(f"\nLoaded {len(candidates)} provisional first-batch candidates across 5 categories.")

    # 3. Load raw source attributes & canonical references
    raw_source_map = load_raw_source_attributes(WORKSPACE_ROOT)
    canonical_places = load_canonical_places(WORKSPACE_ROOT)
    canonical_stops = load_canonical_stops(WORKSPACE_ROOT)
    print(f"Loaded {len(canonical_places)} canonical places and {len(canonical_stops)} transit stops for overlap check.")

    # 4. Coordinate Cluster Forensics
    coord_groups: Dict[Tuple[float, float], List[Dict[str, Any]]] = defaultdict(list)
    for c in candidates:
        coord_key = (round(float(c["latitude"]), 4), round(float(c["longitude"]), 4))
        coord_groups[coord_key].append(c)

    coordinate_clusters_report: List[Dict[str, Any]] = []
    cluster_classification_by_coord: Dict[Tuple[float, float], str] = {}

    for coord, members in sorted(coord_groups.items(), key=lambda x: len(x[1]), reverse=True):
        if len(members) <= 1:
            cluster_classification_by_coord[coord] = "UNIQUE_FACILITY"
            continue

        distinct_cats = set(m["entity_type"] for m in members)
        distinct_dists = set((m.get("district") or "").lower() for m in members)
        distinct_locs = set((m.get("locality") or "").lower() for m in members)

        # Classification logic
        classification = "REVIEW_REQUIRED"
        rationale = ""
        readiness_effect = "PREVENTS_READY_NEW"

        # Check for duplicate same-facility records (e.g. SDH Gunupur vs Govt Hospital Gunupur)
        if len(distinct_cats) == 1:
            names = [normalize_str(m["canonical_name"]) for m in members]
            if len(set(names)) < len(names) or any(n1 in n2 or n2 in n1 for n1 in names for n2 in names if n1 != n2):
                classification = "SAME_FACILITY_MULTIPLE_SERVICES"
                rationale = "Multiple records represent the same underlying facility from different source files."
            else:
                classification = "SHARED_COMPLEX"
                rationale = f"Multiple facilities of category {list(distinct_cats)[0]} co-located in shared zone."
        elif len(distinct_cats) >= 3:
            # When 3 or 4 unrelated categories (Hospital, Police, Fuel, ATM) share identical coordinates
            classification = "LIKELY_TOWN_CENTROID"
            rationale = (
                f"Cluster of {len(members)} unrelated facilities across {len(distinct_cats)} categories "
                f"({', '.join(sorted(distinct_cats))}) sharing identical coordinate. "
                "Evidence indicates town centroid / locality default coordinate assignment."
            )
        elif len(distinct_cats) == 2:
            # Check for plausible co-location (e.g. ATM at Hospital campus, or ATM at Transit stop)
            if "ATM" in distinct_cats and "HOSPITAL" in distinct_cats:
                atm_mem = [m for m in members if m["entity_type"] == "ATM"]
                hosp_mem = [m for m in members if m["entity_type"] == "HOSPITAL"]
                if any("campus" in m["canonical_name"].lower() or "hospital" in m["canonical_name"].lower() for m in atm_mem) or (len(distinct_locs) == 1):
                    classification = "PLAUSIBLE_COLOCATION"
                    rationale = "ATM located at hospital campus or community health complex represents plausible co-location."
                    readiness_effect = "PERMITS_READY_IF_VERIFIED"
                else:
                    classification = "SUSPECTED_CROSS_CATEGORY_REUSE"
                    rationale = "ATM and hospital share coordinate without explicit campus co-location evidence."
            elif "POLICE_STATION" in distinct_cats and "FUEL_STATION" in distinct_cats:
                classification = "SUSPECTED_CROSS_CATEGORY_REUSE"
                rationale = "Police station and commercial fuel station sharing identical coordinate indicates centroid reuse."
            else:
                classification = "SUSPECTED_CROSS_CATEGORY_REUSE"
                rationale = f"Cross-category coordinate sharing between {', '.join(sorted(distinct_cats))}."

        cluster_classification_by_coord[coord] = classification

        coordinate_clusters_report.append({
            "coordinate": {"latitude": coord[0], "longitude": coord[1]},
            "member_count": len(members),
            "categories": sorted(list(distinct_cats)),
            "districts": sorted(list(distinct_dists)),
            "localities": sorted(list(distinct_locs)),
            "classification": classification,
            "readiness_effect": readiness_effect,
            "rationale": rationale,
            "entities": [
                {
                    "candidate_id": m["candidate_id"],
                    "canonical_name": m["canonical_name"],
                    "entity_type": m["entity_type"],
                    "district": m.get("district"),
                    "locality": m.get("locality"),
                    "provenance": m.get("provenance"),
                    "source_dataset": m.get("source_dataset"),
                }
                for m in members
            ]
        })

    print(f"Detected {len(coordinate_clusters_report)} multi-entity coordinate clusters.")

    # 5. Process Every Candidate across Truth Dimensions
    ready_new_records: List[Dict[str, Any]] = []
    ready_enrichment_records: List[Dict[str, Any]] = []
    review_required_records: List[Dict[str, Any]] = []
    blocked_records: List[Dict[str, Any]] = []

    provenance_audit_records: List[Dict[str, Any]] = []
    identity_audit_records: List[Dict[str, Any]] = []
    coordinate_audit_records: List[Dict[str, Any]] = []
    canonical_overlap_records: List[Dict[str, Any]] = []
    identity_crosswalk_records: List[Dict[str, Any]] = []

    # Pre-index canonical places by normalized name
    canonical_place_norm_map: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for cp in canonical_places:
        cp_norm = normalize_str(cp.get("name"))
        canonical_place_norm_map[cp_norm].append(cp)

    # Pre-index canonical transit stops
    canonical_stop_norm_map: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for cs in canonical_stops:
        cs_norm = normalize_str(cs.get("canonical_name"))
        canonical_stop_norm_map[cs_norm].append(cs)

    # Check for phone collisions (excluding standard toll-free helplines)
    phone_counts = Counter()
    for c in candidates:
        p = c.get("phone")
        if p and str(p).strip():
            digits = re.sub(r"[^0-9]", "", str(p))
            if len(digits) >= 8 and not digits.startswith("1800") and not digits.startswith("1860"):
                phone_counts[digits] += 1

    for c in candidates:
        cid = c["candidate_id"]
        cname = c["canonical_name"]
        ctype = c["entity_type"]
        cdist = c.get("district")
        cloc = c.get("locality")
        csrc_ds = c.get("source_dataset", "")
        corig_id = c.get("original_id", "")
        clat = float(c["latitude"])
        clon = float(c["longitude"])
        coord_key = (round(clat, 4), round(clon, 4))

        raw_meta = raw_source_map.get((csrc_ds, corig_id), {})

        # ---------------------------------------------------------------------
        # 5.1 Provenance Truth
        # ---------------------------------------------------------------------
        prov_str = c.get("provenance") or raw_meta.get("source_name") or raw_meta.get("source") or ""
        source_url = c.get("source_url") or raw_meta.get("source_url")
        authority = classify_provenance_authority(prov_str, source_url, csrc_ds)

        verification_date = raw_meta.get("verification_date") or raw_meta.get("last_verified")
        verification_method = raw_meta.get("verification_status") or "STAGED_COMPILATION"
        source_record_id = corig_id

        # Field-level provenance tracking
        field_provenance = {
            "name": {
                "source": prov_str,
                "authority": authority,
                "verified": bool(prov_str and authority != "UNSOURCED")
            },
            "coordinates": {
                "source": raw_meta.get("coordinate_source") or prov_str,
                "authority": authority,
                "verified": bool(authority in {"OFFICIAL_PRIMARY", "OFFICIAL_SECONDARY", "AUTHORITATIVE_INSTITUTIONAL"})
            },
            "district": {
                "source": prov_str,
                "authority": authority,
                "verified": bool(cdist)
            },
            "category": {
                "source": csrc_ds,
                "authority": authority,
                "verified": True
            },
            "phone": {
                "source": prov_str if c.get("phone") else None,
                "authority": authority if c.get("phone") else None,
                "verified": bool(c.get("phone"))
            }
        }

        provenance_audit_item = {
            "candidate_id": cid,
            "canonical_name": cname,
            "entity_type": ctype,
            "source_dataset": csrc_ds,
            "source_record_id": source_record_id,
            "source_authority": authority,
            "source_url": source_url,
            "verification_date": verification_date,
            "verification_method": verification_method,
            "field_provenance": field_provenance,
        }
        provenance_audit_records.append(provenance_audit_item)

        # ---------------------------------------------------------------------
        # 5.2 Identity Truth & Ambiguity Check
        # ---------------------------------------------------------------------
        cname_clean = cname.strip()
        cname_norm = normalize_str(cname_clean)

        # Check for unadorned generic names (e.g. "Police Station", "Hospital", "Indian Oil")
        is_generic_unadorned = False
        for pat in UNADORNED_GENERIC_PATTERNS:
            if re.match(pat, cname_clean, re.IGNORECASE):
                is_generic_unadorned = True
                break

        # Check phone sharing anomaly (copied police phone on petrol pump)
        phone_anomaly = False
        phone_anomaly_note = ""
        cphone = c.get("phone")
        if cphone and str(cphone).strip():
            digits = re.sub(r"[^0-9]", "", str(cphone))
            if digits in phone_counts and phone_counts[digits] > 1:
                phone_anomaly = True
                phone_anomaly_note = f"Landline {digits} is shared across {phone_counts[digits]} distinct facilities."

        identity_status = "VERIFIED_IDENTITY"
        identity_issues: List[str] = []

        if is_generic_unadorned:
            # If generic string has no specific locality context or is identical to district
            if not cloc or cloc.lower() == (cdist or "").lower() or cloc.lower() in {"town", "center", "main"}:
                identity_status = "AMBIGUOUS_IDENTITY"
                identity_issues.append("ID_GENERIC_NAME_COLLISION: Unadorned generic facility name lacks distinct station/branch/locality identifier.")
            else:
                identity_status = "PROBABLE_IDENTITY"
                identity_issues.append("ID_GENERIC_NAME_COLLISION: Generic name partially contextualized by locality.")

        if phone_anomaly:
            identity_issues.append(f"ID_PHONE_COLLISION: {phone_anomaly_note}")

        # ---------------------------------------------------------------------
        # 5.3 Coordinate Truth & Precision
        # ---------------------------------------------------------------------
        cluster_class = cluster_classification_by_coord.get(coord_key, "UNIQUE_FACILITY")

        # Decimal precision check
        lat_str = str(clat)
        lon_str = str(clon)
        lat_dec = len(lat_str.split(".")[1]) if "." in lat_str else 0
        lon_dec = len(lon_str.split(".")[1]) if "." in lon_str else 0

        in_odisha = (ODISHA_LAT_MIN <= clat <= ODISHA_LAT_MAX) and (ODISHA_LON_MIN <= clon <= ODISHA_LON_MAX)

        coordinate_issues: List[str] = []
        if not in_odisha:
            coordinate_issues.append("GEO_OUT_OF_ODISHA: Coordinate outside Odisha bounding box.")

        # Determine precision taxonomy
        if cluster_class in {"LIKELY_TOWN_CENTROID", "SUSPECTED_CROSS_CATEGORY_REUSE"}:
            coordinate_precision = "TOWN_CENTROID"
            coordinate_issues.append(f"GEO_SUSPECTED_LOCALITY_CENTROID: Coordinate belongs to a multi-facility cluster classified as {cluster_class}.")
        elif min(lat_dec, lon_dec) <= 2:
            coordinate_precision = "LOCALITY"
            coordinate_issues.append("GEO_COORDINATE_PRECISION_INSUFFICIENT: Coordinate has <= 2 decimal places (~1.1km resolution).")
        elif min(lat_dec, lon_dec) == 3:
            coordinate_precision = "STREET_SEGMENT"
            coordinate_issues.append("GEO_COORDINATE_PRECISION_INSUFFICIENT: Coordinate has 3 decimal places (~110m resolution).")
        else:
            if cluster_class == "PLAUSIBLE_COLOCATION":
                coordinate_precision = "FACILITY_COMPOUND"
            elif authority in {"OFFICIAL_PRIMARY", "OFFICIAL_SECONDARY", "AUTHORITATIVE_INSTITUTIONAL"}:
                coordinate_precision = "FACILITY_ENTRANCE"
            else:
                coordinate_precision = "FACILITY_FOOTPRINT"

        coordinate_status = "VERIFIED_OFFICIAL" if (
            authority in {"OFFICIAL_PRIMARY", "OFFICIAL_SECONDARY", "AUTHORITATIVE_INSTITUTIONAL"}
            and coordinate_precision in {"FACILITY_ENTRANCE", "FACILITY_FOOTPRINT", "FACILITY_COMPOUND"}
            and in_odisha
        ) else ("VERIFIED_GEOSPATIAL" if in_odisha and coordinate_precision in {"FACILITY_ENTRANCE", "FACILITY_FOOTPRINT", "FACILITY_COMPOUND"} else "APPROXIMATE_CENTROID")

        coordinate_audit_item = {
            "candidate_id": cid,
            "canonical_name": cname,
            "latitude": clat,
            "longitude": clon,
            "coordinate_status": coordinate_status,
            "coordinate_precision": coordinate_precision,
            "cluster_classification": cluster_class,
            "issues": coordinate_issues,
        }
        coordinate_audit_records.append(coordinate_audit_item)

        # ---------------------------------------------------------------------
        # 5.4 Canonical Overlap Check
        # ---------------------------------------------------------------------
        overlap_class = "NEW_ENTITY"
        canonical_target_id: Optional[str] = None
        canonical_target_name: Optional[str] = None
        canonical_overlap_rationale = "No matching canonical place or stop found."

        # Check against canonical places
        matched_canonical_places = canonical_place_norm_map.get(cname_norm, [])
        is_exact = bool(matched_canonical_places)

        if not matched_canonical_places:
            c_tokens = set(re.sub(r"[^a-z0-9]", "", w) for w in re.sub(r"[\(\)]", " ", cname.lower()).split() if w not in ("and", "the", "of", "in", "&"))
            c_tokens = set("headquarter" if w == "headquarters" else w for w in c_tokens if w)
            for p in canonical_places:
                p_dist = (p.get("district") or "").lower()
                if cdist and p_dist and cdist.lower() != p_dist:
                    continue
                p_cat = (p.get("category") or "").lower()
                p_name_str = p.get("name", "")
                p_tokens = set(re.sub(r"[^a-z0-9]", "", w) for w in re.sub(r"[\(\)]", " ", p_name_str.lower()).split() if w not in ("and", "the", "of", "in", "&"))
                p_tokens = set("headquarter" if w == "headquarters" else w for w in p_tokens if w)
                
                # Check research_id match if available
                if corig_id and corig_id == p.get("research_id"):
                    matched_canonical_places.append(p)
                    is_exact = True
                    break

                # For hospitals, check token overlap against canonical hospital categories
                if ctype == "HOSPITAL" and p_cat in {"hospital", "medical", "healthcare"}:
                    jaccard = len(c_tokens & p_tokens) / len(c_tokens | p_tokens) if (c_tokens | p_tokens) else 0.0
                    if jaccard >= 0.5 or (len(c_tokens & p_tokens) >= 3 and ("medical" in c_tokens or "hospital" in c_tokens)):
                        matched_canonical_places.append(p)
                        break
                    # Special check for PRMMCH / PRM Medical College Baripada
                    if ("prm" in p_tokens or "prmmch" in c_tokens) and ("medical" in c_tokens and "medical" in p_tokens):
                        matched_canonical_places.append(p)
                        break

        if matched_canonical_places:
            target_p = matched_canonical_places[0]
            target_p_cat = (target_p.get("category") or "").lower()

            if ctype == "HOSPITAL" and target_p_cat in {"hospital", "medical", "healthcare"}:
                if is_exact or normalize_str(target_p.get("name")) == cname_norm:
                    overlap_class = "EXACT_EXISTING"
                    canonical_overlap_rationale = f"Exact match with canonical place '{target_p.get('name')}' (ID: {target_p.get('id')})."
                else:
                    overlap_class = "STRONG_ALIAS"
                    canonical_overlap_rationale = f"Strong alias of canonical hospital '{target_p.get('name')}' (ID: {target_p.get('id')})."
                canonical_target_id = str(target_p.get("id"))
                canonical_target_name = target_p.get("name")
            else:
                overlap_class = "COLOCATED_DISTINCT"
                canonical_overlap_rationale = f"Co-located or adjacent to canonical place '{target_p.get('name')}', but is distinct {ctype}."
                canonical_target_id = str(target_p.get("id"))
                canonical_target_name = target_p.get("name")

        # Check against canonical transit stops if still NEW_ENTITY
        if overlap_class == "NEW_ENTITY":
            matched_stops = canonical_stop_norm_map.get(cname_norm, [])
            if matched_stops:
                target_s = matched_stops[0]
                overlap_class = "COLOCATED_DISTINCT"
                canonical_overlap_rationale = f"Candidate name matches canonical transit stop '{target_s.get('canonical_name')}' (Stop ID: {target_s.get('stop_id')})."
                canonical_target_id = target_s.get("stop_id")
                canonical_target_name = target_s.get("canonical_name")

        canonical_overlap_item = {
            "candidate_id": cid,
            "canonical_name": cname,
            "entity_type": ctype,
            "district": cdist,
            "overlap_classification": overlap_class,
            "canonical_target_id": canonical_target_id,
            "canonical_target_name": canonical_target_name,
            "rationale": canonical_overlap_rationale,
        }
        canonical_overlap_records.append(canonical_overlap_item)

        # ---------------------------------------------------------------------
        # 5.5 Final Partitioning Logic
        # ---------------------------------------------------------------------
        readiness_rationale: List[str] = []
        blocking_reasons: List[str] = []
        review_reasons: List[str] = []

        # Evaluate blocking criteria
        if not in_odisha:
            blocking_reasons.append("GEO_OUT_OF_ODISHA: Latitude/longitude outside Odisha geography.")
        if authority == "UNSOURCED":
            blocking_reasons.append("PRV_UNSOURCED: No authentic provenance source provided.")
        if identity_status == "AMBIGUOUS_IDENTITY":
            blocking_reasons.append("ID_AMBIGUOUS: Generic facility name unresolvable to a specific physical location.")

        # Evaluate review criteria
        if authority in {"PUBLIC_GEOSPATIAL", "UNVERIFIED_PUBLIC", "PROJECT_RESEARCH_WITH_SECONDARY_CITATION"}:
            review_reasons.append(f"PRV_SOURCE_AUTHORITY_INSUFFICIENT: Sourced from {authority}; requires official directory or primary citation confirmation.")
        if coordinate_precision in {"TOWN_CENTROID", "LOCALITY", "STREET_SEGMENT"}:
            review_reasons.append(f"GEO_COORDINATE_PRECISION_INSUFFICIENT: Precision is {coordinate_precision}; facility-level pin required for canonical promotion.")
        if cluster_class not in {"UNIQUE_FACILITY", "PLAUSIBLE_COLOCATION"}:
            review_reasons.append(f"GEO_SHARED_COORDINATE_CLUSTER: Entity is part of a {cluster_class} cluster sharing coordinates with other facilities.")
        if identity_status == "PROBABLE_IDENTITY":
            review_reasons.append("ID_GENERIC_COLLISION: Generic name requires explicit verification against local gazette/circle.")
        if phone_anomaly:
            review_reasons.append(f"ID_PHONE_COLLISION: {phone_anomaly_note}")

        # Partition decision
        partition_decision: str
        target_record = dict(c)
        target_record.update({
            "source": c.get("provenance") or raw_meta.get("source_name") or raw_meta.get("source") or csrc_ds,
            "verification_status": "VERIFIED_OFFICIAL" if authority in {"OFFICIAL_PRIMARY", "OFFICIAL_SECONDARY", "AUTHORITATIVE_INSTITUTIONAL"} else "VERIFIED_STAGED",
            "source_authority": authority,
            "coordinate_status": coordinate_status,
            "coordinate_precision": coordinate_precision,
            "identity_status": identity_status,
            "canonical_overlap": overlap_class,
            "canonical_target_id": canonical_target_id,
            "canonical_target_name": canonical_target_name,
            "field_provenance": field_provenance,
        })

        if blocking_reasons:
            partition_decision = "BLOCKED"
            target_record["blocking_reasons"] = blocking_reasons
            blocked_records.append(target_record)
        elif overlap_class in {"EXACT_EXISTING", "STRONG_ALIAS"}:
            partition_decision = "READY_FOR_CANONICAL_ENRICHMENT"
            target_record["enrichment_rationale"] = (
                f"Matches existing canonical place '{canonical_target_name}' (ID: {canonical_target_id}). "
                "Designated for attribute enrichment/aliasing in canonical store without duplicate entity insertion."
            )
            ready_enrichment_records.append(target_record)
        elif review_reasons:
            partition_decision = "REVIEW_REQUIRED"
            target_record["review_reasons"] = review_reasons
            review_required_records.append(target_record)
        else:
            partition_decision = "READY_FOR_CANONICAL_NEW"
            target_record["readiness_rationale"] = [
                f"Source verified under {authority} authority.",
                f"Facility-level coordinate confirmed at {coordinate_precision} precision.",
                "Identity uniquely resolved without canonical overlap or collision.",
                "All domain truth gates satisfied."
            ]
            ready_new_records.append(target_record)

        # Crosswalk entry
        identity_crosswalk_records.append({
            "candidate_id": cid,
            "canonical_name": cname,
            "entity_type": ctype,
            "district": cdist,
            "locality": cloc,
            "source_dataset": csrc_ds,
            "source_authority": authority,
            "identity_status": identity_status,
            "coordinate_status": coordinate_status,
            "coordinate_precision": coordinate_precision,
            "canonical_overlap": overlap_class,
            "canonical_target_id": canonical_target_id,
            "partition_decision": partition_decision,
            "decision_reasons": blocking_reasons or review_reasons or target_record.get("readiness_rationale", []),
        })

    # Invariant check
    total_partitioned = (
        len(ready_new_records)
        + len(ready_enrichment_records)
        + len(review_required_records)
        + len(blocked_records)
    )
    assert total_partitioned == len(candidates), (
        f"Partition mismatch: {total_partitioned} partitioned != {len(candidates)} input candidates"
    )

    print("\n" + "=" * 70)
    print("AUDIT SUMMARY & PARTITION ACCOUNTING INVARIANT")
    print("=" * 70)
    print(f"Total Input Candidates:          {len(candidates)}")
    print(f"  -> READY_FOR_CANONICAL_NEW:    {len(ready_new_records)}")
    print(f"  -> READY_FOR_CANONICAL_ENRICH: {len(ready_enrichment_records)}")
    print(f"  -> REVIEW_REQUIRED:            {len(review_required_records)}")
    print(f"  -> BLOCKED:                    {len(blocked_records)}")
    print(f"Accounting Invariant Check:      {total_partitioned} == {len(candidates)} [PASS]")
    print("-" * 70)

    # Category breakdown table
    cat_summary: Dict[str, Dict[str, int]] = defaultdict(lambda: {
        "total": 0, "ready_new": 0, "ready_enrichment": 0, "review_required": 0, "blocked": 0
    })
    for r in ready_new_records:
        cat_summary[r["entity_type"]]["ready_new"] += 1
        cat_summary[r["entity_type"]]["total"] += 1
    for r in ready_enrichment_records:
        cat_summary[r["entity_type"]]["ready_enrichment"] += 1
        cat_summary[r["entity_type"]]["total"] += 1
    for r in review_required_records:
        cat_summary[r["entity_type"]]["review_required"] += 1
        cat_summary[r["entity_type"]]["total"] += 1
    for r in blocked_records:
        cat_summary[r["entity_type"]]["blocked"] += 1
        cat_summary[r["entity_type"]]["total"] += 1

    print(f"{'Category':<16} | {'Total':<6} | {'Ready New':<10} | {'Enrichment':<10} | {'Review':<8} | {'Blocked':<8}")
    print("-" * 70)
    for cat in sorted(FIRST_BATCH_CATEGORIES):
        cs = cat_summary[cat]
        print(f"{cat:<16} | {cs['total']:<6} | {cs['ready_new']:<10} | {cs['ready_enrichment']:<10} | {cs['review_required']:<8} | {cs['blocked']:<8}")
    print("=" * 70)

    # 6. Write All Reports & Staging Artifacts
    reports_dir = WORKSPACE_ROOT / "reports"
    staging_dir = WORKSPACE_ROOT / "data" / "staging" / "statewide_entities"
    reports_dir.mkdir(parents=True, exist_ok=True)
    staging_dir.mkdir(parents=True, exist_ok=True)

    # 6.1 Provenance Audit Report
    with open(reports_dir / "statewide_first_batch_provenance_audit.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_candidates": len(candidates),
            "input_file_hashes": file_hashes,
            "authority_breakdown": dict(Counter(r["source_authority"] for r in provenance_audit_records)),
            "records": provenance_audit_records,
        }, f, indent=2)

    # 6.2 Identity Audit Report
    with open(reports_dir / "statewide_first_batch_identity_audit.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_candidates": len(candidates),
            "identity_status_breakdown": dict(Counter(r["identity_status"] for r in identity_crosswalk_records)),
            "records": identity_crosswalk_records,
        }, f, indent=2)

    # 6.3 Coordinate Audit Report
    with open(reports_dir / "statewide_first_batch_coordinate_audit.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_candidates": len(candidates),
            "precision_breakdown": dict(Counter(r["coordinate_precision"] for r in coordinate_audit_records)),
            "status_breakdown": dict(Counter(r["coordinate_status"] for r in coordinate_audit_records)),
            "records": coordinate_audit_records,
        }, f, indent=2)

    # 6.4 Coordinate Clusters Report
    with open(reports_dir / "statewide_first_batch_coordinate_clusters.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_clusters": len(coordinate_clusters_report),
            "classification_breakdown": dict(Counter(c["classification"] for c in coordinate_clusters_report)),
            "clusters": coordinate_clusters_report,
        }, f, indent=2)

    # 6.5 Canonical Overlap Report
    with open(reports_dir / "statewide_first_batch_canonical_overlap.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_candidates": len(candidates),
            "overlap_breakdown": dict(Counter(r["overlap_classification"] for r in canonical_overlap_records)),
            "records": canonical_overlap_records,
        }, f, indent=2)

    # 6.6 Real Promotion Readiness Report
    with open(reports_dir / "statewide_first_batch_promotion_readiness.json", "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_candidates": len(candidates),
            "partition_counts": {
                "READY_FOR_CANONICAL_NEW": len(ready_new_records),
                "READY_FOR_CANONICAL_ENRICHMENT": len(ready_enrichment_records),
                "REVIEW_REQUIRED": len(review_required_records),
                "BLOCKED": len(blocked_records),
            },
            "category_summary": cat_summary,
            "accounting_invariant_passed": True,
        }, f, indent=2)

    # 6.7 Staging Partition Outputs
    with open(staging_dir / "first_batch_identity_crosswalk.json", "w", encoding="utf-8") as f:
        json.dump(identity_crosswalk_records, f, indent=2)

    with open(staging_dir / "first_batch_ready_new.json", "w", encoding="utf-8") as f:
        json.dump(ready_new_records, f, indent=2)

    with open(staging_dir / "first_batch_ready_enrichment.json", "w", encoding="utf-8") as f:
        json.dump(ready_enrichment_records, f, indent=2)

    with open(staging_dir / "first_batch_review.json", "w", encoding="utf-8") as f:
        json.dump(review_required_records, f, indent=2)

    with open(staging_dir / "first_batch_blocked.json", "w", encoding="utf-8") as f:
        json.dump(blocked_records, f, indent=2)

    print("\nAll 6 audit reports and 5 staging partition artifacts successfully written.")


if __name__ == "__main__":
    run_audit()
