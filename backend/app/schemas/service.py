"""Canonical Pydantic contracts for Traveller Essentials & Local Services."""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


ServiceCategoryType = Literal[
    "healthcare",
    "police",
    "hotel",
    "restaurant",
    "fuel",
    "transit",
    "atm",
    "safety",
]

DistanceSemanticsType = Literal[
    "straight_line_haversine",
    "walking_estimate",
    "driving_estimate",
    "road_network_exact",
]


class ServiceRecordContract(BaseModel):
    """Canonical model for a single verified local support service."""
    id: str
    name: str
    category: ServiceCategoryType
    subcategory: str
    district: str
    locality: Optional[str] = None
    lat: float
    lon: float
    address: str
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    is_24x7: bool = False
    opening_hours: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)
    fuel_types: List[str] = Field(default_factory=list)
    routes_served: List[str] = Field(default_factory=list)
    bank_name: Optional[str] = None
    cuisine: Optional[str] = None
    price_tier: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    source_type: str
    verification_status: str = "verified"
    data_type: str = "static"
    last_verified: str
    notes: Optional[str] = None


class NearbyServiceResultContract(ServiceRecordContract):
    """Service record enriched with geospatial proximity and semantic labels."""
    distance_km: float
    distance_formatted: str
    distance_semantics: DistanceSemanticsType = "straight_line_haversine"
    estimated_drive_minutes: int
    estimated_walk_minutes: int


class EmergencyContactContract(BaseModel):
    label: str
    number: str
    service_type: str
    is_24x7: bool = True


class SafetyAdvisoryItemContract(BaseModel):
    category: str
    title: str
    guidance: str
    severity: Literal["info", "caution", "warning"]


class DestinationSafetyContract(BaseModel):
    """Authoritative safety profile and emergency helplines for a destination."""
    destination_id: str
    destination_name: str
    district: str
    nearest_police_station_id: str
    nearest_police_station_name: str
    nearest_hospital_id: str
    nearest_hospital_name: str
    emergency_contacts: List[EmergencyContactContract] = Field(default_factory=list)
    safety_advisories: List[SafetyAdvisoryItemContract] = Field(default_factory=list)
    network_connectivity: Optional[str] = "good_4g_5g"
    best_visiting_hours: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    last_verified: str


class NearbyServicesGroupedResponse(BaseModel):
    """Structured response grouping nearby essentials and safety around a destination or coordinate."""
    destination_id: Optional[str] = None
    destination_name: Optional[str] = None
    query_lat: float
    query_lon: float
    requested_radius_km: float
    active_radius_km: float
    is_expanded: bool
    total_services_count: int
    distance_semantics: DistanceSemanticsType = "straight_line_haversine"
    healthcare: List[NearbyServiceResultContract] = Field(default_factory=list)
    police: List[NearbyServiceResultContract] = Field(default_factory=list)
    hotels: List[NearbyServiceResultContract] = Field(default_factory=list)
    restaurants: List[NearbyServiceResultContract] = Field(default_factory=list)
    fuel: List[NearbyServiceResultContract] = Field(default_factory=list)
    transit: List[NearbyServiceResultContract] = Field(default_factory=list)
    atms: List[NearbyServiceResultContract] = Field(default_factory=list)
    safety_advisory: Optional[DestinationSafetyContract] = None


class NearbyServicesListResponse(BaseModel):
    """Flat filtered list response for nearby service queries."""
    query_lat: float
    query_lon: float
    category: Optional[ServiceCategoryType] = None
    requested_radius_km: float
    active_radius_km: float
    is_expanded: bool
    count: int
    distance_semantics: DistanceSemanticsType = "straight_line_haversine"
    services: List[NearbyServiceResultContract] = Field(default_factory=list)
