package com.otravelz.android.domain.model

import com.otravelz.android.data.network.dto.RouteGeometryDto
import com.otravelz.android.data.network.dto.ServiceItemDto
import com.otravelz.android.data.network.dto.StopNearbyDto
import com.otravelz.shared.geo.HaversineDistance

/**
 * Validated geographic coordinate strictly checked against Odisha bounds.
 * Never allows (0.0, 0.0) or out-of-state fabrications.
 */
data class GeoCoordinate(
    val lat: Double,
    val lon: Double
) {
    init {
        require(isValid(lat, lon)) {
            "Coordinate ($lat, $lon) falls outside Odisha geographic boundary [17.78..22.57 N, 81.39..87.53 E]"
        }
    }

    fun distanceKmTo(other: GeoCoordinate): Double {
        return HaversineDistance.calculateKm(lat, lon, other.lat, other.lon)
    }

    companion object {
        const val ODISHA_LAT_MIN = 17.78
        const val ODISHA_LAT_MAX = 22.57
        const val ODISHA_LON_MIN = 81.39
        const val ODISHA_LON_MAX = 87.53

        // Statewide Odisha center
        val ODISHA_CENTER = GeoCoordinate(20.27, 84.85)

        fun isValid(lat: Double?, lon: Double?): Boolean {
            if (lat == null || lon == null) return false
            if (lat.isNaN() || lon.isNaN() || lat.isInfinite() || lon.isInfinite()) return false
            if (Math.abs(lat) < 1e-5 && Math.abs(lon) < 1e-5) return false
            return lat in ODISHA_LAT_MIN..ODISHA_LAT_MAX && lon in ODISHA_LON_MIN..ODISHA_LON_MAX
        }

        fun fromOrNull(lat: Double?, lon: Double?): GeoCoordinate? {
            return if (isValid(lat, lon)) GeoCoordinate(lat!!, lon!!) else null
        }
    }
}

/**
 * Transit stop verification tiers as defined in TRANSIT_PRODUCT_MODEL.
 */
enum class StopVerificationTier {
    VERIFIED_OFFICIAL,
    VERIFIED_GEOSPATIAL,
    CANDIDATE_HIGH,
    CANDIDATE_MEDIUM,
    LOCALITY_ONLY,
    UNRESOLVED;

    val isVerifiedPhysicalPole: Boolean
        get() = this == VERIFIED_OFFICIAL || this == VERIFIED_GEOSPATIAL

    val isCandidate: Boolean
        get() = this == CANDIDATE_HIGH || this == CANDIDATE_MEDIUM

    val allowsFirstMileWalk: Boolean
        get() = isVerifiedPhysicalPole

    val allowsExternalNavigation: Boolean
        get() = isVerifiedPhysicalPole

    companion object {
        fun fromString(raw: String?): StopVerificationTier {
            return when (raw?.trim()?.uppercase()) {
                "VERIFIED_OFFICIAL", "OFFICIAL" -> VERIFIED_OFFICIAL
                "VERIFIED_GEOSPATIAL", "GEOSPATIAL" -> VERIFIED_GEOSPATIAL
                "CANDIDATE_HIGH" -> CANDIDATE_HIGH
                "CANDIDATE_MEDIUM" -> CANDIDATE_MEDIUM
                "LOCALITY_ONLY" -> LOCALITY_ONLY
                else -> UNRESOLVED
            }
        }
    }
}

/**
 * Transit stop marker model for spatial map display.
 */
data class TransitStopMarker(
    val stopId: String,
    val name: String,
    val publishedName: String? = null,
    val coordinate: GeoCoordinate? = null,
    val tier: StopVerificationTier = StopVerificationTier.UNRESOLVED,
    val city: String? = null,
    val district: String? = null,
    val routesServing: List<String> = emptyList(),
    val walkingEstimateMins: Int? = null,
    val distanceM: Double? = null
) {
    val canRenderMarker: Boolean
        get() = coordinate != null && tier.isVerifiedPhysicalPole

    val canRenderCandidateMarker: Boolean
        get() = coordinate != null && tier.isCandidate

    companion object {
        fun fromDto(dto: StopNearbyDto): TransitStopMarker {
            val coord = GeoCoordinate.fromOrNull(dto.latitude, dto.longitude)
            val tier = StopVerificationTier.fromString(dto.coordinateStatus)
            return TransitStopMarker(
                stopId = dto.stopId,
                name = dto.name,
                publishedName = dto.publishedName,
                coordinate = coord,
                tier = tier,
                city = dto.city,
                district = dto.district,
                routesServing = dto.routesServingStop,
                walkingEstimateMins = dto.walkingEstimateMins,
                distanceM = dto.distanceM
            )
        }
    }
}

/**
 * Route geometry confidence tiers.
 */
enum class RouteGeometryConfidence {
    VERIFIED_ROUTE_GEOMETRY,
    HIGH_CONFIDENCE_ROUTE_GEOMETRY,
    MEDIUM_CONFIDENCE_ROUTE_GEOMETRY,
    GEOMETRY_UNAVAILABLE;

    val isRenderable: Boolean
        get() = this != GEOMETRY_UNAVAILABLE

    companion object {
        fun fromString(raw: String?): RouteGeometryConfidence {
            return when (raw?.trim()?.uppercase()) {
                "VERIFIED_ROUTE_GEOMETRY", "EXACT" -> VERIFIED_ROUTE_GEOMETRY
                "HIGH_CONFIDENCE_ROUTE_GEOMETRY", "ROAD_FOLLOWING" -> HIGH_CONFIDENCE_ROUTE_GEOMETRY
                "MEDIUM_CONFIDENCE_ROUTE_GEOMETRY", "PARTIAL" -> MEDIUM_CONFIDENCE_ROUTE_GEOMETRY
                else -> GEOMETRY_UNAVAILABLE
            }
        }
    }
}

/**
 * Transit route surveyed road geometry. Strictly 0 straight-line bridging.
 */
data class TransitRouteGeometry(
    val routeId: String,
    val routeNumber: String,
    val routeName: String,
    val confidence: RouteGeometryConfidence,
    val coordinates: List<GeoCoordinate>
) {
    val isRenderable: Boolean
        get() = confidence.isRenderable && coordinates.size >= 2

    companion object {
        fun fromDto(dto: RouteGeometryDto, routeNumber: String = "", routeName: String = ""): TransitRouteGeometry {
            val conf = when {
                dto.coordinates.size >= 2 -> RouteGeometryConfidence.HIGH_CONFIDENCE_ROUTE_GEOMETRY
                else -> RouteGeometryConfidence.GEOMETRY_UNAVAILABLE
            }
            val validCoords = dto.coordinates.mapNotNull { pair ->
                if (pair.size >= 2) GeoCoordinate.fromOrNull(pair[0], pair[1]) else null
            }
            return TransitRouteGeometry(
                routeId = dto.routeId,
                routeNumber = routeNumber,
                routeName = routeName,
                confidence = if (validCoords.size >= 2) conf else RouteGeometryConfidence.GEOMETRY_UNAVAILABLE,
                coordinates = validCoords
            )
        }
    }
}

/**
 * Civic essentials categories.
 */
enum class CivicServiceCategory {
    HEALTHCARE,
    POLICE,
    FUEL,
    ATM,
    HOTEL,
    RESTAURANT,
    TRANSIT_HUB,
    OTHER;

    companion object {
        fun fromString(raw: String?): CivicServiceCategory {
            return when (raw?.trim()?.lowercase()) {
                "healthcare", "hospital" -> HEALTHCARE
                "police" -> POLICE
                "fuel", "petrol" -> FUEL
                "atm", "bank" -> ATM
                "hotel", "accommodation" -> HOTEL
                "restaurant", "dining" -> RESTAURANT
                "transit", "transit_hub" -> TRANSIT_HUB
                else -> OTHER
            }
        }
    }
}

/**
 * Civic service marker model.
 */
data class CivicServiceMarker(
    val id: String,
    val name: String,
    val category: CivicServiceCategory,
    val coordinate: GeoCoordinate,
    val address: String? = null,
    val phone: String? = null,
    val distanceKm: Double? = null
) {
    companion object {
        fun fromDto(dto: ServiceItemDto): CivicServiceMarker? {
            val coord = GeoCoordinate.fromOrNull(dto.lat, dto.lon) ?: return null
            return CivicServiceMarker(
                id = dto.id,
                name = dto.name,
                category = CivicServiceCategory.fromString(dto.category),
                coordinate = coord,
                address = dto.address,
                phone = dto.phone,
                distanceKm = dto.distanceKm
            )
        }
    }
}

/**
 * Map layer visibility toggles.
 * Enforces mutual exclusivity between deep leisure and essentials.
 */
data class MapLayersState(
    val showDestinations: Boolean = true,
    val showTransitRoutes: Boolean = false,
    val showVerifiedStops: Boolean = false,
    val showCandidateStops: Boolean = false,
    val showEssentials: Boolean = false,
    val showUserLocation: Boolean = false
) {
    /**
     * Toggling essentials dims leisure destinations to avoid visual pin clutter.
     */
    fun toggleEssentials(): MapLayersState {
        val next = !showEssentials
        return copy(
            showEssentials = next,
            showDestinations = !next // mutually exclusive focus
        )
    }

    fun toggleDestinations(): MapLayersState {
        val next = !showDestinations
        return copy(
            showDestinations = next,
            showEssentials = if (next) false else showEssentials
        )
    }
}

/**
 * Selected entity on the map canvas. Explicit, type-safe truth semantics.
 */
sealed interface SelectedMapEntity {
    data object None : SelectedMapEntity
    data class Destination(val place: DiscoverPlace) : SelectedMapEntity
    data class TransitStop(val stop: TransitStopMarker) : SelectedMapEntity
    data class TransitRoute(val route: TransitRouteGeometry) : SelectedMapEntity
    data class CivicService(val service: CivicServiceMarker) : SelectedMapEntity
}

/**
 * Production map state model.
 */
sealed interface MapProductState {
    data object Loading : MapProductState
    data object Ready : MapProductState
    data class ProviderUnavailable(val reason: String) : MapProductState
    data class DataUnavailable(val error: String) : MapProductState
}

/**
 * Traveler device location state.
 */
sealed interface LocationStatus {
    data object Unknown : LocationStatus
    data object PermissionRequired : LocationStatus
    data object PermissionDenied : LocationStatus
    data object LocationUnavailable : LocationStatus
    data class Live(
        val lat: Double,
        val lon: Double,
        val accuracyMeters: Float? = null
    ) : LocationStatus {
        val coordinate: GeoCoordinate?
            get() = GeoCoordinate.fromOrNull(lat, lon)
    }
}
