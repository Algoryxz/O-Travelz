"""Endpoint-neutral Phase 6A reduced map-projection contracts.

These models deliberately sit beside, rather than inside, the existing itinerary and
transport contracts.  Geometry is accepted only when it is supplied for an explicit
canonical repository reference; this module never resolves names, providers, GIS IDs,
or endpoints into map entities.
"""
from __future__ import annotations

from typing import Literal
from uuid import UUID

from pydantic import ConfigDict, Field, field_validator, model_validator

from app.geospatial.validation import (
    GeometryValidationError,
    validate_coordinate,
    validate_linestring,
)
from app.schemas.common import ContractModel
from app.schemas.transport import DataTier, TransportHopContract


Entity = Literal["place", "stop", "route"]
FeatureType = Literal["place", "stop", "route_line"]
GeometryStatus = Literal["available", "unavailable"]
UnavailableReason = Literal[
    "coordinate_unverified",
    "identity_unresolved",
    "topology_unresolved",
    "source_missing",
    "source_not_authoritative",
    "not_in_scope",
    "provider_geometry_unavailable",
    "contract_not_approved",
]


class CanonicalRef(ContractModel):
    """A serialized reference; by itself it is not an authoritative identity."""

    entity: Entity
    id: str = Field(min_length=1)

    @field_validator("id")
    @classmethod
    def non_blank_id(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("canonical id must not be blank")
        return value


class AuthorizedCanonicalRef:
    """Opaque canonical identity capability issued from an existing backend model.

    This wrapper performs no lookup and no cross-system matching.  It can only be
    created from an existing ``Place``, ``Stop``, or ``Route`` model instance whose
    database primary key is a UUID.  The projection consumes this capability instead
    of trusting an arbitrary caller-provided ``CanonicalRef``.
    """

    __slots__ = ("_entity", "_id")
    _TOKEN = object()

    def __init__(self, entity: Entity, identifier: UUID, token: object):
        if token is not self._TOKEN:
            raise TypeError("authorized canonical refs must come from backend records")
        self._entity = entity
        self._id = identifier

    @classmethod
    def from_backend_record(cls, record: object) -> "AuthorizedCanonicalRef":
        # Initialize the existing model metadata module before importing a model
        # directly; this avoids the repository's pre-existing base/model cycle.
        from app.db import base as _model_base  # noqa: F401
        from app.models.place import Place
        from app.models.transport import Route, Stop

        if isinstance(record, Place):
            entity: Entity = "place"
        elif isinstance(record, Stop):
            entity = "stop"
        elif isinstance(record, Route):
            entity = "route"
        else:
            raise TypeError("record must be an existing Place, Stop, or Route backend model")

        identifier = getattr(record, "id", None)
        if not isinstance(identifier, UUID):
            raise ValueError("backend canonical records must have a UUID database id")
        return cls(entity, identifier, cls._TOKEN)

    @property
    def canonical_ref(self) -> CanonicalRef:
        return CanonicalRef(entity=self._entity, id=str(self._id))

    @property
    def entity(self) -> Entity:
        return self._entity

    @property
    def identifier(self) -> str:
        return str(self._id)


class PointGeometry(ContractModel):
    type: Literal["Point"]
    coordinates: tuple[float, float]

    @field_validator("coordinates", mode="before")
    @classmethod
    def validate_point(cls, value: object) -> tuple[float, float]:
        try:
            if isinstance(value, (str, bytes)) or len(value) != 2:  # type: ignore[arg-type]
                raise GeometryValidationError("Point coordinates must contain longitude and latitude")
            return validate_coordinate(value[0], value[1])  # type: ignore[index]
        except (GeometryValidationError, TypeError, KeyError, IndexError) as error:
            raise ValueError(str(error)) from error


class LineStringGeometry(ContractModel):
    type: Literal["LineString"]
    coordinates: list[tuple[float, float]]

    @field_validator("coordinates", mode="before")
    @classmethod
    def validate_line(cls, value: object) -> tuple[tuple[float, float], ...]:
        try:
            if isinstance(value, (str, bytes)):
                raise GeometryValidationError("LineString coordinates must be positions")
            return validate_linestring(value)  # type: ignore[arg-type]
        except (GeometryValidationError, TypeError) as error:
            raise ValueError(str(error)) from error


MapGeometry = PointGeometry | LineStringGeometry


class ApprovedFeatureGeometry(ContractModel):
    """Backend-supplied geometry keyed by an authorized canonical backend fact.

    The model intentionally has no name, provider route, source-row, GIS, endpoint,
    or alternate-identifier fields.  A null geometry is still a valid supplied record
    when its unavailable reason is explicit.
    """

    model_config = ConfigDict(
        extra="forbid",
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )

    authorized_ref: AuthorizedCanonicalRef
    geometry: MapGeometry | None = None
    unavailable_reason: UnavailableReason | None = None

    @model_validator(mode="after")
    def validate_feature_geometry(self) -> "ApprovedFeatureGeometry":
        if self.geometry is None and self.unavailable_reason is None:
            raise ValueError("unavailable supplied geometry requires a reason")
        if self.geometry is not None and self.unavailable_reason is not None:
            raise ValueError("available supplied geometry cannot have an unavailable reason")
        expected_type = "route_line" if self.authorized_ref.entity == "route" else self.authorized_ref.entity
        if self.geometry is not None:
            actual_type = "route_line" if isinstance(self.geometry, LineStringGeometry) else "place" if self.authorized_ref.entity == "place" else "stop"
            if actual_type != expected_type:
                raise ValueError(
                    f"{self.authorized_ref.entity} geometry must use the {expected_type} geometry type"
                )
        return self


class RequestedHopContext(ContractModel):
    """An existing approved hop, carried without changing its transport contract."""

    day_number: int = Field(ge=1)
    hop: TransportHopContract


class MapProjectionRequest(ContractModel):
    """Explicit feature and hop set for one deterministic projection."""

    requested_features: list[CanonicalRef] = Field(default_factory=list)
    approved_features: list[ApprovedFeatureGeometry] = Field(default_factory=list)
    requested_hops: list[RequestedHopContext] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_explicit_sets(self) -> "MapProjectionRequest":
        feature_refs = [(item.entity, item.id) for item in self.requested_features]
        if len(feature_refs) != len(set(feature_refs)):
            raise ValueError("requested_features must not contain duplicate canonical references")

        approved_refs = [
            (item.authorized_ref.entity, item.authorized_ref.identifier)
            for item in self.approved_features
        ]
        if len(approved_refs) != len(set(approved_refs)):
            raise ValueError("approved_features must not contain duplicate canonical references")
        requested_ref_set = set(feature_refs)
        if any(ref not in requested_ref_set for ref in approved_refs):
            raise ValueError("approved geometry requires an explicitly requested feature")

        hop_refs = [
            (item.day_number, item.hop.from_sequence, item.hop.to_sequence)
            for item in self.requested_hops
        ]
        if len(hop_refs) != len(set(hop_refs)):
            raise ValueError("requested_hops must not contain duplicate hop references")
        return self


class MapProjectionFeatureRequest(ContractModel):
    """One public HTTP feature request bound to a typed database UUID."""

    entity: Entity
    id: UUID


class MapProjectionHTTPRequest(ContractModel):
    """Public map projection request supporting typed features and optional hop context."""

    requested_features: list[MapProjectionFeatureRequest] = Field(default_factory=list)
    requested_hops: list[RequestedHopContext] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_request(self) -> "MapProjectionHTTPRequest":
        refs = [(item.entity, item.id) for item in self.requested_features]
        if len(refs) != len(set(refs)):
            raise ValueError("requested_features must not contain duplicate typed UUIDs")

        hop_refs = [
            (item.day_number, item.hop.from_sequence, item.hop.to_sequence)
            for item in self.requested_hops
        ]
        if len(hop_refs) != len(set(hop_refs)):
            raise ValueError("requested_hops must not contain duplicate hop references")
        return self


class MapFeature(ContractModel):
    feature_type: FeatureType
    canonical_ref: CanonicalRef
    geometry_status: GeometryStatus
    geometry: MapGeometry | None
    unavailable_reason: UnavailableReason | None = None

    @model_validator(mode="after")
    def validate_feature_state(self) -> "MapFeature":
        expected_type = "route_line" if self.canonical_ref.entity == "route" else self.canonical_ref.entity
        if self.feature_type != expected_type:
            raise ValueError("feature_type does not match canonical_ref.entity")
        if self.geometry_status == "available":
            if self.geometry is None or self.unavailable_reason is not None:
                raise ValueError("available features require geometry and no unavailable reason")
        elif self.geometry is not None or self.unavailable_reason is None:
            raise ValueError("unavailable features require null geometry and an unavailable reason")
        return self


class MapHopRef(ContractModel):
    day_number: int = Field(ge=1)
    from_sequence: int = Field(ge=0)
    to_sequence: int = Field(ge=1)


class MapLeg(ContractModel):
    mode: str
    detail: str
    provider: str | None = None
    route: str | None = None
    geometry_status: GeometryStatus
    geometry: LineStringGeometry | None = None
    route_ref: str | None = None
    stop_refs: list[str] = Field(default_factory=list)
    unavailable_reason: UnavailableReason | None = None

    @model_validator(mode="after")
    def validate_leg_state(self) -> "MapLeg":
        if self.geometry_status == "available":
            if self.geometry is None or self.unavailable_reason is not None:
                raise ValueError("available legs require geometry and no unavailable reason")
        elif self.geometry is not None or self.unavailable_reason is None:
            raise ValueError("unavailable legs require null geometry and an unavailable reason")
        return self


class MapRelationship(ContractModel):
    relationship_type: Literal["itinerary_hop"]
    hop_ref: MapHopRef
    mode: str
    data_tier: DataTier
    reason: str | None = None
    legs: list[MapLeg] = Field(default_factory=list)


class UnavailableItem(ContractModel):
    item_type: Literal["feature", "relationship"]
    ref: CanonicalRef | MapHopRef
    unavailable_reason: UnavailableReason

    @model_validator(mode="after")
    def validate_item_ref(self) -> "UnavailableItem":
        is_feature = isinstance(self.ref, CanonicalRef)
        if (self.item_type == "feature") != is_feature:
            raise ValueError("unavailable item type does not match its reference")
        return self


class MapProjectionResponse(ContractModel):
    requested_features: list[CanonicalRef]
    features: list[MapFeature] = Field(default_factory=list)
    relationships: list[MapRelationship] = Field(default_factory=list)
    unavailable_items: list[UnavailableItem] = Field(default_factory=list)


__all__ = [
    "ApprovedFeatureGeometry",
    "AuthorizedCanonicalRef",
    "CanonicalRef",
    "LineStringGeometry",
    "MapFeature",
    "MapGeometry",
    "MapHopRef",
    "MapLeg",
    "MapProjectionRequest",
    "MapProjectionFeatureRequest",
    "MapProjectionHTTPRequest",
    "MapProjectionResponse",
    "MapRelationship",
    "PointGeometry",
    "RequestedHopContext",
    "UnavailableItem",
]
