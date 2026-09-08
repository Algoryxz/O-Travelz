package com.otravelz.android

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.dto.CanonicalRouteRawDto
import com.otravelz.android.data.network.dto.CanonicalScheduleRawDto
import com.otravelz.android.domain.model.*
import com.otravelz.shared.engine.FirstMileBand
import com.otravelz.shared.engine.FirstMileEngine
import com.otravelz.shared.engine.TimetableEngine
import com.otravelz.shared.provenance.DataTier
import org.junit.Assert.*
import org.junit.Test
import java.io.File

/**
 * Wave M12: Comprehensive Transit Product, Directory, Stop Truth, and Timetable Unit Tests.
 */
class TransitProductModelTest {

    private fun loadCanonicalRoutes(): List<TransitRouteSummary> {
        val routesFile = File("../../data/transport/canonical/routes.json")
        val altFile = File("src/main/assets/transit/routes.json")
        val file = if (routesFile.exists()) routesFile else altFile
        val json = file.readText()
        val raw = ApiClient.json.decodeFromString<List<CanonicalRouteRawDto>>(json)
        return raw.map { r ->
            val region = TransitRegion.fromString(r.serviceArea)
                ?: TransitRegion.inferFromRouteNumber(r.routeNumber)
            TransitRouteSummary(
                routeId = r.routeId,
                routeNumber = r.routeNumber,
                routeName = r.routeName,
                region = region,
                operatorName = r.operator,
                networkType = r.networkType,
                origin = r.origin,
                destination = r.destination ?: "",
                via = r.via,
                hasSchedule = r.hasSchedule,
                totalStops = r.totalStops
            )
        }
    }

    private fun loadCanonicalSchedules(): List<CanonicalScheduleRawDto> {
        val schedFile = File("../../data/transport/canonical/schedules.json")
        val altFile = File("src/main/assets/transit/schedules.json")
        val file = if (schedFile.exists()) schedFile else altFile
        val json = file.readText()
        return ApiClient.json.decodeFromString<List<CanonicalScheduleRawDto>>(json)
    }

    @Test
    fun testAll154RoutesCategorizedInto5Regions() {
        val routes = loadCanonicalRoutes()
        assertEquals("Canonical transport dataset must contain exactly 154 routes", 154, routes.size)

        val byRegion = routes.groupBy { it.region }

        val capitalCount = byRegion[TransitRegion.CAPITAL_REGION]?.size ?: 0
        val rourkelaCount = byRegion[TransitRegion.ROURKELA]?.size ?: 0
        val sambalpurCount = byRegion[TransitRegion.SAMBALPUR]?.size ?: 0
        val berhampurCount = byRegion[TransitRegion.BERHAMPUR]?.size ?: 0
        val keonjharCount = byRegion[TransitRegion.KEONJHAR]?.size ?: 0

        assertEquals("Capital Region must have 96 routes", 96, capitalCount)
        assertEquals("Rourkela must have 25 routes", 25, rourkelaCount)
        assertEquals("Sambalpur must have 17 routes", 17, sambalpurCount)
        assertEquals("Berhampur must have 10 routes", 10, berhampurCount)
        assertEquals("Keonjhar must have 6 routes", 6, keonjharCount)

        val sum = capitalCount + rourkelaCount + sambalpurCount + berhampurCount + keonjharCount
        assertEquals("Total regional sum must equal exactly 154", 154, sum)
    }

    @Test
    fun testScheduleCountAndDepartureIntegrity() {
        val schedules = loadCanonicalSchedules()
        assertEquals("Canonical schedules must contain exactly 302 rows", 302, schedules.size)

        val totalDepartures = schedules.sumOf { it.departureTimes.size }
        assertEquals("Canonical departures must contain exactly 5,549 departures", 5549, totalDepartures)

        // All departure times must match HH:mm pattern
        val timeRegex = Regex("^([01]\\d|2[0-3]):[0-5]\\d$")
        schedules.forEach { sc ->
            sc.departureTimes.forEach { dep ->
                assertTrue("Departure time '$dep' must be strict HH:mm", timeRegex.matches(dep))
            }
        }
    }

    @Test
    fun testDeterministicSearchRankingTier1ExactNumber() {
        val routes = loadCanonicalRoutes()

        // Searching "10" should rank route "10" at top (Tier 1 exact match score 10000)
        val results = TransitSearchEngine.filterAndRank(routes, "10")
        assertFalse("Search results for '10' must not be empty", results.isEmpty())
        assertEquals("Tier 1 exact match must rank first", "10", results.first().routeNumber)
    }

    @Test
    fun testDeterministicSearchRankingTier2PrefixNumber() {
        val routes = loadCanonicalRoutes()

        val results = TransitSearchEngine.filterAndRank(routes, "F1")
        assertFalse(results.isEmpty())
        assertTrue("Prefix search 'F1' must include F1, F10, F11, F12", results.any { it.routeNumber == "F1" })
        assertEquals("Exact F1 must rank before F10/F11/F12", "F1", results.first().routeNumber)
    }

    @Test
    fun testDeterministicSearchRankingOriginAndDestination() {
        val routes = loadCanonicalRoutes()

        val results = TransitSearchEngine.filterAndRank(routes, "Nandankanan")
        assertFalse(results.isEmpty())
        results.forEach { r ->
            val match = r.origin.contains("Nandankanan", ignoreCase = true) ||
                    r.destination.contains("Nandankanan", ignoreCase = true) ||
                    r.routeName.contains("Nandankanan", ignoreCase = true)
            assertTrue("Every result must match query", match)
        }
    }

    @Test
    fun testRegionalFilterExclusivity() {
        val routes = loadCanonicalRoutes()

        val rourkelaRoutes = TransitSearchEngine.filterAndRank(routes, "", TransitRegion.ROURKELA)
        assertEquals(25, rourkelaRoutes.size)
        rourkelaRoutes.forEach { r ->
            assertEquals(TransitRegion.ROURKELA, r.region)
        }

        val keonjharRoutes = TransitSearchEngine.filterAndRank(routes, "", TransitRegion.KEONJHAR)
        assertEquals(6, keonjharRoutes.size)
        keonjharRoutes.forEach { r ->
            assertEquals(TransitRegion.KEONJHAR, r.region)
        }
    }

    @Test
    fun testStopVerificationTiersTruth() {
        // Physical stop with coordinates
        val verifiedStop = TransitStop(
            stopId = "stop_01",
            name = "Baramunda ISBT",
            latitude = 20.2798,
            longitude = 85.7892,
            tier = StopVerificationTier.VERIFIED_OFFICIAL
        )
        assertTrue("Verified official stop must be physical pole", verifiedStop.isVerifiedPhysicalPole)
        assertFalse("Verified official stop must NOT be locality only", verifiedStop.isLocalityOnly)
        assertTrue("Verified official stop allows external navigation", verifiedStop.allowsExternalNavigation)
        assertNotNull("Verified official stop has coordinate", verifiedStop.coordinate)

        // Locality stop with null coordinates
        val localityStop = TransitStop(
            stopId = "stop_02",
            name = "Patia Square",
            latitude = null,
            longitude = null,
            tier = StopVerificationTier.LOCALITY_ONLY
        )
        assertFalse("Locality-only stop must NOT be verified physical pole", localityStop.isVerifiedPhysicalPole)
        assertTrue("Locality-only stop must be locality only", localityStop.isLocalityOnly)
        assertFalse("Locality-only stop MUST NOT allow external navigation", localityStop.allowsExternalNavigation)
        assertNull("Locality-only stop has null coordinate", localityStop.coordinate)
    }

    @Test
    fun testFirstMileGuidanceGating() {
        val verifiedStop = TransitStop(
            stopId = "stop_01",
            name = "Master Canteen",
            latitude = 20.2667,
            longitude = 85.8436,
            tier = StopVerificationTier.VERIFIED_OFFICIAL
        )

        // 1. Gating: isRealGps = false -> strictly null
        val fakeGpsResult = verifiedStop.evaluateFirstMile(
            userLat = 20.2670,
            userLon = 85.8440,
            isRealGps = false
        )
        assertNull("Fake or fallback GPS must strictly return null first-mile guidance", fakeGpsResult)

        // 2. Gating: locality stop -> strictly null even if isRealGps = true
        val localityStop = TransitStop(
            stopId = "stop_02",
            name = "Locality Stop",
            latitude = null,
            longitude = null,
            tier = StopVerificationTier.LOCALITY_ONLY
        )
        val localityResult = localityStop.evaluateFirstMile(
            userLat = 20.2670,
            userLon = 85.8440,
            isRealGps = true
        )
        assertNull("Locality stop must strictly return null first-mile guidance", localityResult)

        // 3. Real GPS within 800m -> WALK_REASONABLE
        // ~200m away
        val walkResult = verifiedStop.evaluateFirstMile(
            userLat = 20.2680,
            userLon = 85.8436,
            isRealGps = true
        )
        assertNotNull(walkResult)
        assertEquals(FirstMileBand.WALK_REASONABLE, walkResult!!.band)

        // 4. Real GPS between 800m and 1500m -> WALK_OR_SHORT_AUTO
        // ~1100m away
        val autoResult = verifiedStop.evaluateFirstMile(
            userLat = 20.2766,
            userLon = 85.8436,
            isRealGps = true
        )
        assertNotNull(autoResult)
        assertEquals(FirstMileBand.WALK_OR_SHORT_AUTO, autoResult!!.band)

        // 5. Real GPS > 1500m -> AUTO_OR_CAB_RECOMMENDED
        // ~3000m away
        val cabResult = verifiedStop.evaluateFirstMile(
            userLat = 20.2937,
            userLon = 85.8436,
            isRealGps = true
        )
        assertNotNull(cabResult)
        assertEquals(FirstMileBand.AUTO_OR_CAB_RECOMMENDED, cabResult!!.band)
    }

    @Test
    fun testTimetableDeterministicIstEvaluation() {
        val departures = listOf("06:30", "07:00", "07:30", "08:00", "18:00", "19:00", "20:00")

        // 1. Morning evaluation at 06:45 -> Next is 07:00 (15 min wait)
        val morningRes = TimetableEngine.getNextScheduledDeparture(departures, "06:45")
        assertEquals("07:00", morningRes.nextDepartureTime)
        assertEquals(15, morningRes.minutesUntilDeparture)
        assertEquals(DataTier.SCHEDULED, morningRes.dataTier)
        assertFalse(morningRes.isServiceFinishedForDay)

        // 2. Exact match at 07:30 -> Next is 07:30 (0 min wait)
        val exactRes = TimetableEngine.getNextScheduledDeparture(departures, "07:30")
        assertEquals("07:30", exactRes.nextDepartureTime)
        assertEquals(0, exactRes.minutesUntilDeparture)

        // 3. Evening evaluation after last departure at 21:00 -> Service finished
        val lateRes = TimetableEngine.getNextScheduledDeparture(departures, "21:00")
        assertNull(lateRes.nextDepartureTime)
        assertTrue(lateRes.isServiceFinishedForDay)
        assertEquals("Service finished for today", lateRes.displayLabel)

        // 4. Empty departures -> Unavailable
        val emptyRes = TimetableEngine.getNextScheduledDeparture(emptyList(), "12:00")
        assertNull(emptyRes.nextDepartureTime)
        assertEquals(DataTier.UNAVAILABLE, emptyRes.dataTier)
    }

    @Test
    fun testNoLiveTrackingOrFabricatedFaresClaims() {
        // Verification of Wave M12 Truth Boundaries
        val sampleSchedule = TransitSchedule(
            scheduleId = "sc_01",
            groupLabel = "From Baramunda",
            terminus = "Puri",
            totalTrips = 10,
            departureTimes = listOf("06:00", "07:00")
        )
        val eval = sampleSchedule.evaluateNextDeparture("06:30")
        assertEquals("DataTier must strictly be SCHEDULED, never LIVE", DataTier.SCHEDULED, eval.dataTier)
        assertTrue("Display label must state scheduled departure, not live arrival", eval.displayLabel.contains("scheduled departure"))
    }
}
