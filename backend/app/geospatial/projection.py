"""Deterministic Phase 6A map projection over explicitly approved inputs."""
from __future__ import annotations

from app.schemas.map_projection import (
    ApprovedFeatureGeometry,
    MapFeature,
    MapHopRef,
    MapLeg,
    MapProjectionRequest,
    MapProjectionResponse,
    MapRelationship,
    RequestedHopContext,
    UnavailableItem,
)
from app.schemas.transport import TransportLeg


class MapProjectionService:
    """Project canonical features and existing hop context without inference.

    The service is intentionally endpoint-neutral.  It accepts a request containing
    an explicit feature set and backend-supplied geometry records.  Missing records
    become explicit identity-unresolved items; supplied null geometry remains a
    feature with its supplied unavailable reason.  No repository-wide query, lookup
    by name, transport-route promotion, or geometry derivation occurs here.
    """

    def project(self, request: MapProjectionRequest) -> MapProjectionResponse:
        supplied = {
            (item.authorized_ref.entity, item.authorized_ref.identifier): item
            for item in request.approved_features
        }
        features: list[MapFeature] = []
        unavailable: list[UnavailableItem] = []
        for requested in request.requested_features:
            item = supplied.get((requested.entity, requested.id))
            if item is None:
                unavailable.append(
                    UnavailableItem(
                        item_type="feature",
                        ref=requested,
                        unavailable_reason="identity_unresolved",
                    )
                )
                continue
            features.append(self._feature(item))

        relationships = [self._relationship(item) for item in request.requested_hops]
        return MapProjectionResponse(
            requested_features=list(request.requested_features),
            features=features,
            relationships=relationships,
            unavailable_items=unavailable,
        )

    @staticmethod
    def _feature(item: ApprovedFeatureGeometry) -> MapFeature:
        geometry_status = "available" if item.geometry is not None else "unavailable"
        canonical_ref = item.authorized_ref.canonical_ref
        feature_type = "route_line" if canonical_ref.entity == "route" else canonical_ref.entity
        return MapFeature(
            feature_type=feature_type,
            canonical_ref=canonical_ref,
            geometry_status=geometry_status,
            geometry=item.geometry,
            unavailable_reason=item.unavailable_reason,
        )

    @staticmethod
    def _relationship(item: RequestedHopContext) -> MapRelationship:
        hop = item.hop
        return MapRelationship(
            relationship_type="itinerary_hop",
            hop_ref=MapHopRef(
                day_number=item.day_number,
                from_sequence=hop.from_sequence,
                to_sequence=hop.to_sequence,
            ),
            mode=hop.mode,
            data_tier=hop.data_tier,
            reason=hop.reason,
            legs=[MapProjectionService._leg(leg) for leg in hop.legs],
        )

    @staticmethod
    def _leg(leg: TransportLeg) -> MapLeg:
        # TransportLeg.route is deliberately copied only as display text.  Without
        # an explicit approved Route.id/Stop.id binding, no canonical refs are made.
        return MapLeg(
            mode=leg.mode,
            detail=leg.detail,
            provider=leg.provider,
            route=leg.route,
            geometry_status="unavailable",
            geometry=None,
            route_ref=None,
            stop_refs=[],
            unavailable_reason=(
                "provider_geometry_unavailable"
                if leg.provider or leg.mode == "provider"
                else "source_missing"
            ),
        )


def project_map(request: MapProjectionRequest) -> MapProjectionResponse:
    """Convenience boundary for a single deterministic projection."""

    return MapProjectionService().project(request)


__all__ = ["MapProjectionService", "project_map"]
