"""
Canonical Transit Hub Domain Model and Aliasing Registry.

Solves the semantic stop naming fragmentation across official CRUT datasets
(e.g., 'BHUBANESWAR AIRPORT' vs 'AIRPORT' vs 'BIJU PATNAIK INTERNATIONAL AIRPORT')
without mutating underlying database records or fabricating coordinates.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set
from uuid import UUID

from sqlalchemy.orm import Session
from app.models.transport import Stop


@dataclass(frozen=True)
class CanonicalHub:
    hub_key: str
    hub_name: str
    city: str
    district: str
    representative_stop_name: str
    representative_lat: float
    representative_lon: float
    member_stop_names: Set[str]
    member_stop_ids: Set[str] = field(default_factory=set)

    def matches_stop(self, stop_name: str, stop_id: str | UUID, city: Optional[str] = None) -> bool:
        """Check if a stop belongs to this canonical hub."""
        str_id = str(stop_id)
        if str_id in self.member_stop_ids:
            return True
        norm_name = stop_name.strip().upper()
        if norm_name in self.member_stop_names:
            if city and city.lower() != self.city.lower():
                # Prevent cross-city collisions
                return False
            return True
        return False


# Curated, authoritative Canonical Hubs across Odisha transit regions
CANONICAL_HUBS: Dict[str, CanonicalHub] = {
    "HUB_BHUBANESWAR_AIRPORT": CanonicalHub(
        hub_key="HUB_BHUBANESWAR_AIRPORT",
        hub_name="Biju Patnaik International Airport Hub",
        city="Bhubaneswar",
        district="Khordha",
        representative_stop_name="BHUBANESWAR AIRPORT",
        representative_lat=20.252295,
        representative_lon=85.813485,
        member_stop_names={
            "BHUBANESWAR AIRPORT",
            "AIRPORT",
            "BIJU PATNAIK INTERNATIONAL AIRPORT, BBSR",
            "BIJU PATNAIK INTERNATIONAL AIRPORT",
        },
        member_stop_ids={
            "4f295c1f-d478-4b35-b77b-e46722a3cd50",
            "1d190390-ff3d-419c-9ca9-dd17bc0ce14e",
            "b5a521df-809b-4fad-b09a-15e4d8cbebb3",
            "6afcad38-fce3-4ad3-821b-1a8c751a212f",
        },
    ),
    "HUB_MASTER_CANTEEN": CanonicalHub(
        hub_key="HUB_MASTER_CANTEEN",
        hub_name="Master Canteen / Bhubaneswar Railway Station Hub",
        city="Bhubaneswar",
        district="Khordha",
        representative_stop_name="BHUBANESWAR RAILWAY STATION",
        representative_lat=20.266777,
        representative_lon=85.843559,
        member_stop_names={
            "BHUBANESWAR RAILWAY STATION",
            "MASTER CANTEEN",
            "MASTER CANTEEN - SCB MEDICAL",
        },
        member_stop_ids={
            "e633a3b6-b0e6-409f-a418-f80384e30f6a",
            "590c6d95-fb91-441e-9657-a2b785fb2691",
            "a92d109b-7d6c-4927-9b7d-7e421a7f80f6",
        },
    ),
    "HUB_BARAMUNDA_BSABT": CanonicalHub(
        hub_key="HUB_BARAMUNDA_BSABT",
        hub_name="Baramunda BSABT / ISBT Interchange Terminal",
        city="Bhubaneswar",
        district="Khordha",
        representative_stop_name="BARAMUNDA BSABT",
        representative_lat=20.273141,
        representative_lon=85.792270,
        member_stop_names={
            "BARAMUNDA BSABT",
            "BARAMUNDA ISBT",
            "BARAMUNDA",
        },
        member_stop_ids={
            "1a69f886-6b06-405b-8d33-851355c1d168",
            "9bbce580-15a3-420b-a810-28064ff168ce",
            "bcf79029-5bf0-4276-8711-03b1666aabc9",
        },
    ),
    "HUB_AIIMS_BHUBANESWAR": CanonicalHub(
        hub_key="HUB_AIIMS_BHUBANESWAR",
        hub_name="AIIMS Bhubaneswar Hospital Terminal",
        city="Bhubaneswar",
        district="Khordha",
        representative_stop_name="AIIMS",
        representative_lat=20.231200,
        representative_lon=85.789100,
        member_stop_names={
            "AIIMS",
            "AIIMS BHUBANESWAR",
        },
        member_stop_ids={
            "3b807167-e6f7-42e9-9985-5ada17326176",
        },
    ),
    "HUB_NANDANKANAN": CanonicalHub(
        hub_key="HUB_NANDANKANAN",
        hub_name="Nandankanan Zoological Park & Botanical Garden",
        city="Bhubaneswar",
        district="Khordha",
        representative_stop_name="NANDANKANAN",
        representative_lat=20.395556,
        representative_lon=85.825556,
        member_stop_names={
            "NANDANKANAN",
            "NANDANKANAN BOTANICAL GARDEN",
        },
        member_stop_ids={
            "48131d75-8ad7-4f2f-9a36-db5840ada85b",
            "e757548a-bb5f-4931-b5f4-4abcc259b1fd",
        },
    ),
    "HUB_SCB_MEDICAL": CanonicalHub(
        hub_key="HUB_SCB_MEDICAL",
        hub_name="SCB Medical College & Hospital Cuttack",
        city="Cuttack",
        district="Cuttack",
        representative_stop_name="SCB MEDICAL",
        representative_lat=20.472500,
        representative_lon=85.886400,
        member_stop_names={
            "SCB MEDICAL",
            "SCB MEDICAL,CUTTACK",
        },
        member_stop_ids={
            "af4b1bb8-eb0d-4bc0-ab65-2fdcf82324c3",
            "df7a9e73-5342-4f0d-a8cb-48d40ffef4d9",
        },
    ),
    "HUB_MKCG_BERHAMPUR": CanonicalHub(
        hub_key="HUB_MKCG_BERHAMPUR",
        hub_name="MKCG Medical College & Hospital Berhampur",
        city="Berhampur",
        district="Ganjam",
        representative_stop_name="MKCG MEDICAL",
        representative_lat=19.308300,
        representative_lon=84.808300,
        member_stop_names={
            "MKCG MEDICAL",
            "MKCG MEDICAL COLLEGE",
            "MKCG STATE BANK",
            "MKCG MEDICAL COLLEGE SQUARE",
        },
        member_stop_ids={
            "8959d94d-7afa-4285-bdfd-128af4d947a4",
            "0e4d0b13-9a3d-4c3e-b810-74d12bb812a1",
            "5b564dc2-e352-476f-acaa-55daeb6ead4f",
            "09b3074c-813d-405f-bbf0-93a8e9e9841f",
        },
    ),
}


def get_canonical_hub_for_stop(stop: Stop) -> Optional[CanonicalHub]:
    """Resolve the CanonicalHub for a given Stop entity, if applicable."""
    city = None
    if stop.notes:
        try:
            city = json.loads(stop.notes).get("city")
        except Exception:
            pass

    for hub in CANONICAL_HUBS.values():
        if hub.matches_stop(stop.name, stop.id, city):
            return hub
    return None


def expand_stops_with_canonical_hubs(
    session: Session,
    verified_stops_with_dist: List[tuple[Stop, float]],
) -> List[tuple[Stop, float, Optional[str]]]:
    """
    Given a list of spatially verified (Stop, distance_m) pairs,
    expand the set to include all member stop nodes of any matching Canonical Hubs.
    Member stops inherit the distance estimate of the verified representative.
    
    Returns list of (Stop, distance_m, canonical_hub_name | None).
    """
    seen_stop_ids: Set[str] = set()
    expanded: List[tuple[Stop, float, Optional[str]]] = []

    for stop, dist in verified_stops_with_dist:
        str_id = str(stop.id)
        if str_id not in seen_stop_ids:
            seen_stop_ids.add(str_id)
            hub = get_canonical_hub_for_stop(stop)
            hub_name = hub.hub_name if hub else None
            expanded.append((stop, dist, hub_name))

            if hub:
                # Query member stops in the database by names or IDs
                member_stops = (
                    session.query(Stop)
                    .filter(
                        (Stop.id.in_([UUID(sid) for sid in hub.member_stop_ids if _is_valid_uuid(sid)])) |
                        (Stop.name.in_(list(hub.member_stop_names)))
                    )
                    .all()
                )

                for m_stop in member_stops:
                    m_id = str(m_stop.id)
                    if m_id not in seen_stop_ids:
                        seen_stop_ids.add(m_id)
                        # Inherit distance from the verified hub representative
                        expanded.append((m_stop, dist, hub.hub_name))

    return expanded


def _is_valid_uuid(val: str) -> bool:
    try:
        UUID(val)
        return True
    except (ValueError, TypeError):
        return False
