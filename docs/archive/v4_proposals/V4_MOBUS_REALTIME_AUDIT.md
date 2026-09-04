# O-TRAVELZ V4 — CRUT / Mo Bus Realtime Feeds Audit & Truth Specification

> **Authoritative Technical Audit on Public Transit Telemetry, GTFS-RT & Realtime Truth Rules**  
> Document Version: `4.0.0` | Date: `2026-09-02`

---

## 1. Core Truthfulness Invariant: Zero Synthesized Tracking

> **CRITICAL RULE**: The application must NEVER synthesize moving bus icons, fake ETA countdowns, or simulated GPS pings. Presenting schedule estimates as live GPS vehicle telemetry is strictly prohibited.

---

## 2. The Three Operating Modes

All mobile and web transit user interfaces must explicitly operate under one of three transparent modes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MODE 1: LIVE TELEMETRY                          │
│  Condition: Genuine official GTFS-RT / CRUT vehicle telemetry active.   │
│  UI Label:  "LIVE VEHICLE TELEMETRY • CRUT GPS" (Emerald Green Badge)  │
│  Display:   Real lat/lon vehicle marker with bearing & speed.          │
├────────────────────────────────────────────────────────────────────────┤
│                       MODE 2: PUBLISHED SCHEDULE                       │
│  Condition: No live vehicle telemetry feed available.                  │
│  UI Label:  "SCHEDULED TIMETABLE • Published CRUT Timetable" (Orange)  │
│  Display:   Static timetable departure times, route stops & frequency. │
├────────────────────────────────────────────────────────────────────────┤
│                  MODE 3: ESTIMATED PROGRESS (SCHEDULED)                │
│  Condition: High-confidence departure elapsed, schedule modeling only. │
│  UI Label:  "ESTIMATED PROGRESS FROM TIMETABLE • Not Live GPS" (Amber) │
│  Display:   Interpolated stop position along canonical stop sequence.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Investigation of CRUT / Mo Bus Data Sources

An exhaustive technical investigation into public and governmental APIs in Odisha was conducted to determine if a legitimate live vehicle telemetry feed exists:

### 3.1 Investigated Channels
1. **CRUT / Mo Bus Official Feeds**:
   - Status: CRUT operates an internal Automated Vehicle Location System (AVLS) for operational monitoring and the official *Mo Bus App*. However, as of September 2026, **no public, unauthenticated GTFS-RT (Realtime) endpoint is published for third-party consumption**.
2. **Bhubaneswar.me / Bhubaneswar Smart City / BhubaneswarOne**:
   - Status: Open data portal provides static stop and route listings, but no public streaming WebSocket or REST endpoint with high-frequency vehicle coordinate telemetry.
3. **OpenStreetMap / OpenTripPlanner**:
   - Status: Community-mapped routes and stops exist, but zero live telemetry feeds.

### 3.2 Audit Verdict
* **Current Operational Mode**: **MODE 2 (PUBLISHED SCHEDULE)**.
* **Production Stance**: O-TRAVELZ V4 ships a **world-class, high-density scheduled transit experience** powered by our verified 154-route canonical dataset, 1,430 stops, and 5,549 official departure times.
* **Adapter Readiness**: The backend and mobile architectures implement a pluggable `TransitRealtimeProvider` interface ready to activate Mode 1 the moment an official API or partner access is granted.

---

## 4. `TransitRealtimeProvider` Adapter Architecture

To cleanly isolate potential future live feeds from core domain logic, all transit telemetry is abstracted behind a strict provider interface in `backend/app/transport/realtime/`:

```python
# backend/app/transport/realtime/provider.py

from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class VehiclePosition(BaseModel):
    vehicle_id: str
    route_id: str
    trip_id: Optional[str] = None
    latitude: float
    longitude: float
    bearing: Optional[float] = None
    speed_kmh: Optional[float] = None
    timestamp: datetime
    data_tier: str = "live"

class TripUpdate(BaseModel):
    trip_id: str
    route_id: str
    stop_id: str
    delay_seconds: int
    estimated_arrival: datetime
    data_tier: str = "live"

class ServiceAlert(BaseModel):
    alert_id: str
    route_ids: List[str]
    header_text: str
    description_text: str
    severity: str # INFO, WARNING, SEVERE
    active_from: datetime
    active_to: Optional[datetime] = None

class ProviderStatus(BaseModel):
    provider_name: str
    is_healthy: bool
    last_poll_timestamp: Optional[datetime] = None
    mode: str # "LIVE" | "SCHEDULED" | "DEGRADED"

class TransitRealtimeProvider(ABC):
    @abstractmethod
    async def get_vehicle_positions(self, route_id: Optional[str] = None) -> List[VehiclePosition]:
        """Fetch real-time vehicle GPS positions. Returns empty if feed unavailable."""
        pass

    @abstractmethod
    async def get_trip_updates(self, route_id: Optional[str] = None) -> List[TripUpdate]:
        """Fetch estimated arrival updates and delays."""
        pass

    @abstractmethod
    async def get_service_alerts(self) -> List[ServiceAlert]:
        """Fetch active service disruptions or advisories."""
        pass

    @abstractmethod
    async def get_provider_status(self) -> ProviderStatus:
        """Returns provider health and active operating mode."""
        pass
```

### 4.1 Fallback Provider Implementation
When no external telemetry API is configured, the `NullRealtimeProvider` gracefully returns Mode 2 status:
```python
class NullRealtimeProvider(TransitRealtimeProvider):
    async def get_vehicle_positions(self, route_id: Optional[str] = None) -> List[VehiclePosition]:
        return []

    async def get_trip_updates(self, route_id: Optional[str] = None) -> List[TripUpdate]:
        return []

    async def get_service_alerts(self) -> List[ServiceAlert]:
        return []

    async def get_provider_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider_name="CRUT Scheduled Timetable Engine",
            is_healthy=True,
            last_poll_timestamp=datetime.utcnow(),
            mode="SCHEDULED"
        )
```

---

## 5. UI Requirements for Transit Truthfulness

1. **Stop Detail Screen**:
   - Header badge: `Scheduled Timetable · Published CRUT Timetable`
   - Next service row: `Route 10: Next departure 08:30 IST (Scheduled)`
   - Disclaimer text: *"Arrival and departure times are derived from published CRUT schedules. Real-time GPS bus tracking is currently not available."*
2. **Route Detail Screen**:
   - Ordered list of all sequence stops.
   - First and last bus service hours from canonical records.
   - Zero moving bus animations along the route polyline.
3. **Map Basemap**:
   - Stop markers rendered as fixed pins with route badge popups.
   - Zero animated moving markers on the map canvas unless Mode 1 is active.
