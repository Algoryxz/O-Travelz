package com.otravelz.android.domain.model

import com.otravelz.shared.engine.FirstMileEngine
import com.otravelz.shared.engine.FirstMileGuidance
import com.otravelz.shared.engine.ScheduledDepartureResult
import com.otravelz.shared.engine.TimetableEngine
import com.otravelz.shared.geo.HaversineDistance

/**
 * 5 Canonical Transit Operational Regions across Odisha.
 */
enum class TransitRegion(
    val id: String,
    val displayName: String,
    val odiaName: String
) {
    CAPITAL_REGION("capital_region", "Capital Region", "କ୍ୟାପିଟାଲ୍ ରିଜିଅନ୍"),
    ROURKELA("rourkela", "Rourkela", "ରାଉରକେଲା"),
    SAMBALPUR("sambalpur", "Sambalpur", "ସମ୍ବଲପୁର"),
    BERHAMPUR("berhampur", "Berhampur", "ବ୍ରହ୍ମପୁର"),
    KEONJHAR("keonjhar", "Keonjhar", "କେନ୍ଦୁଝର");

    companion object {
        fun fromString(raw: String?): TransitRegion? {
            if (raw.isNullOrBlank()) return null
            val norm = raw.trim().lowercase()
            return when {
                norm.contains("capital") || norm.contains("bhubaneswar") || norm.contains("cuttack") || norm.contains("puri") || norm.contains("khordha") -> CAPITAL_REGION
                norm.contains("rourkela") || norm.contains("sundergarh") || norm.contains("sundargarh") -> ROURKELA
                norm.contains("sambalpur") || norm.contains("burla") -> SAMBALPUR
                norm.contains("berhampur") || norm.contains("brahmapur") || norm.contains("ganjam") -> BERHAMPUR
                norm.contains("keonjhar") || norm.contains("kendujhar") -> KEONJHAR
                else -> null
            }
        }

        fun inferFromRouteNumber(routeNumber: String): TransitRegion {
            val digits = routeNumber.trim().filter { it.isDigit() }
            val num = digits.toIntOrNull()
            return when {
                num != null && num in 100..199 -> ROURKELA
                num != null && num in 200..299 -> SAMBALPUR
                num != null && num in 300..399 -> BERHAMPUR
                num != null && num in 400..499 -> KEONJHAR
                else -> CAPITAL_REGION
            }
        }
    }
}

/**
 * Lightweight summary of a transit route for catalog browsing and search.
 */
data class TransitRouteSummary(
    val routeId: String,
    val routeNumber: String,
    val routeName: String,
    val region: TransitRegion,
    val operatorName: String = "CRUT",
    val networkType: String = "AMA Bus",
    val origin: String,
    val destination: String,
    val via: String? = null,
    val hasSchedule: Boolean = true,
    val totalStops: Int = 0
)

/**
 * Individual stop in a route sequence.
 * Strictly preserves physical verification boundary:
 * Verified physical poles have coordinates; locality-only stops have null coordinates.
 */
data class TransitStop(
    val stopId: String,
    val name: String,
    val sequenceOrder: Int = 0,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val tier: StopVerificationTier = StopVerificationTier.UNRESOLVED,
    val locality: String? = null,
    val city: String? = null,
    val routesServing: List<String> = emptyList()
) {
    val isVerifiedPhysicalPole: Boolean
        get() = tier.isVerifiedPhysicalPole && latitude != null && longitude != null

    val isLocalityOnly: Boolean
        get() = !isVerifiedPhysicalPole

    val coordinate: GeoCoordinate?
        get() = if (latitude != null && longitude != null) GeoCoordinate.fromOrNull(latitude, longitude) else null

    val allowsExternalNavigation: Boolean
        get() = isVerifiedPhysicalPole && coordinate != null

    /**
     * Evaluates first-mile distance guidance for verified physical stops.
     * Evaluates strictly when [isRealGps] is true AND the stop has verified physical coordinates.
     * Locality stops or unverified coordinates strictly return null.
     */
    fun evaluateFirstMile(userLat: Double?, userLon: Double?, isRealGps: Boolean): FirstMileGuidance? {
        if (!isRealGps || !isVerifiedPhysicalPole || latitude == null || longitude == null || userLat == null || userLon == null) {
            return null
        }
        val distM = HaversineDistance.calculateMeters(userLat, userLon, latitude, longitude)
        return FirstMileEngine.evaluate(distM, isRealGps = true)
    }
}

/**
 * Directional timetable schedule for a route.
 */
data class TransitSchedule(
    val scheduleId: String,
    val groupLabel: String,
    val terminus: String,
    val totalTrips: Int,
    val departureTimes: List<String>,
    val sourceDocument: String? = null,
    val effectiveDate: String? = null
) {
    fun evaluateNextDeparture(currentTimeIst: String): ScheduledDepartureResult {
        return TimetableEngine.getNextScheduledDeparture(departureTimes, currentTimeIst)
    }
}

/**
 * Full detail of a route including ordered stops and directional schedules.
 */
data class TransitRouteDetail(
    val routeId: String,
    val routeNumber: String,
    val routeName: String,
    val region: TransitRegion,
    val operatorName: String = "CRUT",
    val networkType: String = "AMA Bus",
    val origin: String,
    val destination: String,
    val via: String? = null,
    val stops: List<TransitStop> = emptyList(),
    val schedules: List<TransitSchedule> = emptyList(),
    val isGeometryAvailable: Boolean = false,
    val geometryStatus: String? = null,
    val sourceDocument: String? = null,
    val effectiveDate: String? = null
) {
    val hasSchedules: Boolean
        get() = schedules.any { it.departureTimes.isNotEmpty() }

    val totalStopsCount: Int
        get() = stops.size
}

/**
 * Pure deterministic transit search ranking engine (Wave M12).
 * Implements 6-tier deterministic search ranking:
 * - Tier 1 (10000): Exact Route Number Match
 * - Tier 2 (8000): Prefix Route Number Match
 * - Tier 3 (6000): Exact Origin or Destination Match
 * - Tier 4 (4000): Prefix Origin or Destination Match
 * - Tier 5 (2000): Substring Match on Route Name / Via points
 * - Tier 6 (1000): Substring Match on Region / City
 * Secondary sort: Region ordinal -> Alphanumeric route number sort.
 */
object TransitSearchEngine {

    fun filterAndRank(
        routes: List<TransitRouteSummary>,
        query: String,
        selectedRegion: TransitRegion? = null
    ): List<TransitRouteSummary> {
        val regionFiltered = if (selectedRegion != null) {
            routes.filter { it.region == selectedRegion }
        } else {
            routes
        }

        val q = query.trim().lowercase()
        if (q.isEmpty()) {
            return regionFiltered.sortedWith(
                compareBy<TransitRouteSummary> { it.region.ordinal }
                    .thenBy { parseRouteNumberForSort(it.routeNumber) }
            )
        }

        return regionFiltered
            .mapNotNull { route ->
                val score = computeSearchScore(route, q)
                if (score > 0) Pair(route, score) else null
            }
            .sortedWith(
                compareByDescending<Pair<TransitRouteSummary, Int>> { it.second }
                    .thenBy { it.first.region.ordinal }
                    .thenBy { parseRouteNumberForSort(it.first.routeNumber) }
            )
            .map { it.first }
    }

    private fun computeSearchScore(route: TransitRouteSummary, q: String): Int {
        val rNum = route.routeNumber.trim().lowercase()
        val orig = route.origin.trim().lowercase()
        val dest = route.destination.trim().lowercase()
        val name = route.routeName.trim().lowercase()
        val via = route.via?.trim()?.lowercase() ?: ""
        val reg = route.region.displayName.lowercase()

        return when {
            // Tier 1: Exact route number match (10000)
            rNum == q -> 10000

            // Tier 2: Prefix route number match (8000)
            rNum.startsWith(q) -> 8000

            // Tier 3: Exact origin or destination match (6000)
            orig == q || dest == q -> 6000

            // Tier 4: Prefix origin or destination match (4000)
            orig.startsWith(q) || dest.startsWith(q) -> 4000

            // Tier 5: Substring match on route name or via (2000)
            name.contains(q) || (via.isNotEmpty() && via.contains(q)) -> 2000

            // Tier 6: Substring match on region (1000)
            reg.contains(q) -> 1000

            else -> 0
        }
    }

    fun parseRouteNumberForSort(routeNumber: String): String {
        val digits = routeNumber.filter { it.isDigit() }
        val prefix = routeNumber.filter { !it.isDigit() }
        val num = digits.toIntOrNull() ?: 9999
        return "%s%05d".format(prefix, num)
    }
}
