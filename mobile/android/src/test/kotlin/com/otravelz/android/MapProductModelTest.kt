package com.otravelz.android

import com.otravelz.android.data.network.dto.RouteGeometryDto
import com.otravelz.android.data.network.dto.ServiceItemDto
import com.otravelz.android.data.network.dto.StopNearbyDto
import com.otravelz.android.domain.model.*
import com.otravelz.android.ui.screens.MapUiState
import org.junit.Assert.*
import org.junit.Test

class MapProductModelTest {

    @Test
    fun testGeoCoordinateValidation_strictlyWithinOdishaBounds() {
        // Valid coordinates inside Odisha (e.g. Lingaraj Temple, Bhubaneswar)
        val valid = GeoCoordinate.fromOrNull(20.2382, 85.8335)
        assertNotNull(valid)
        assertEquals(20.2382, valid!!.lat, 0.0001)
        assertEquals(85.8335, valid.lon, 0.0001)

        // Invalid: (0, 0)
        assertNull(GeoCoordinate.fromOrNull(0.0, 0.0))

        // Invalid: Delhi / Out of Odisha bounds
        assertNull(GeoCoordinate.fromOrNull(28.6139, 77.2090))

        // Invalid: Null or NaN
        assertNull(GeoCoordinate.fromOrNull(null, 85.0))
        assertNull(GeoCoordinate.fromOrNull(Double.NaN, 85.0))
    }

    @Test
    fun testDestinationMarker_preservesCanonicalIdentityAndFiltersNonLeisure() {
        val temple = DiscoverPlace(
            id = "place_lingaraj_temple_bbsr",
            name = "Lingaraj Temple",
            odiaName = "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
            category = "TEMPLE",
            district = "Khordha",
            lat = 20.2382,
            lon = 85.8335
        )
        assertTrue(temple.isEligibleLeisure)
        assertTrue(temple.hasCoordinates)
        assertEquals("place_lingaraj_temple_bbsr", temple.id)

        // Excluded infrastructure entity
        val transitHub = DiscoverPlace(
            id = "infra_bbsr_transit",
            name = "Baramunda ISBT",
            category = "transit_hub",
            district = "Khordha",
            lat = 20.2790,
            lon = 85.7990
        )
        assertFalse(transitHub.isEligibleLeisure)
    }

    @Test
    fun testVerifiedStopGating_exactPinOnlyForOfficialAndGeospatial() {
        val officialStop = StopNearbyDto(
            stopId = "stop_master_canteen",
            name = "Master Canteen",
            latitude = 20.2710,
            longitude = 85.8410,
            coordinateStatus = "VERIFIED_OFFICIAL"
        )
        val markerOfficial = TransitStopMarker.fromDto(officialStop)
        assertTrue(markerOfficial.canRenderMarker)
        assertTrue(markerOfficial.tier.allowsFirstMileWalk)
        assertTrue(markerOfficial.tier.allowsExternalNavigation)

        val geospatialStop = StopNearbyDto(
            stopId = "stop_baramunda",
            name = "Baramunda ISBT",
            latitude = 20.2790,
            longitude = 85.7990,
            coordinateStatus = "VERIFIED_GEOSPATIAL"
        )
        val markerGeo = TransitStopMarker.fromDto(geospatialStop)
        assertTrue(markerGeo.canRenderMarker)
        assertTrue(markerGeo.tier.allowsFirstMileWalk)
        assertTrue(markerGeo.tier.allowsExternalNavigation)
    }

    @Test
    fun testCandidateStopGating_hiddenByDefaultAndStrictlyDisablesFirstMile() {
        val candidateDto = StopNearbyDto(
            stopId = "stop_candidate_test",
            name = "Candidate Shelter",
            latitude = 20.2500,
            longitude = 85.8200,
            coordinateStatus = "CANDIDATE_HIGH"
        )
        val marker = TransitStopMarker.fromDto(candidateDto)

        // Can NOT render as normal verified marker
        assertFalse(marker.canRenderMarker)
        // Can render ONLY when candidate layer enabled
        assertTrue(marker.canRenderCandidateMarker)
        // First-mile walking and navigation are strictly prohibited
        assertFalse(marker.tier.allowsFirstMileWalk)
        assertFalse(marker.tier.allowsExternalNavigation)
    }

    @Test
    fun testLocalityOnlyStop_neverProducesExactPin() {
        val localityDto = StopNearbyDto(
            stopId = "stop_rural_locality",
            name = "Rural Service Point",
            latitude = null,
            longitude = null,
            coordinateStatus = "UNRESOLVED"
        )
        val marker = TransitStopMarker.fromDto(localityDto)
        assertFalse(marker.canRenderMarker)
        assertFalse(marker.canRenderCandidateMarker)
        assertNull(marker.coordinate)
    }

    @Test
    fun testRouteGeometryTruth_suppressesPolylinesWhenUnavailable() {
        // Route with empty coordinates -> GEOMETRY_UNAVAILABLE
        val emptyDto = RouteGeometryDto(
            routeId = "rt_crut_unmapped",
            coordinates = emptyList()
        )
        val routeGeom = TransitRouteGeometry.fromDto(emptyDto, routeNumber = "99")
        assertEquals(RouteGeometryConfidence.GEOMETRY_UNAVAILABLE, routeGeom.confidence)
        assertFalse(routeGeom.isRenderable)
    }

    @Test
    fun testRouteGeometry_zeroStraightLineBridging() {
        // Route with only 1 point cannot form a polyline
        val singlePointDto = RouteGeometryDto(
            routeId = "rt_single_point",
            coordinates = listOf(listOf(20.25, 85.80))
        )
        val routeGeom = TransitRouteGeometry.fromDto(singlePointDto, routeNumber = "10")
        assertFalse(routeGeom.isRenderable)

        // Route with 3 surveyed points forms a valid surveyed road polyline
        val validRoadDto = RouteGeometryDto(
            routeId = "rt_surveyed_road",
            coordinates = listOf(
                listOf(20.25, 85.80),
                listOf(20.26, 85.81),
                listOf(20.27, 85.82)
            )
        )
        val validRoute = TransitRouteGeometry.fromDto(validRoadDto, routeNumber = "11")
        assertTrue(validRoute.isRenderable)
        assertEquals(3, validRoute.coordinates.size)
    }

    @Test
    fun testCivicServiceIsolation_strictlyPreservesCategories() {
        val hospitalDto = ServiceItemDto(
            id = "svc_aiims_bbsr",
            name = "AIIMS Bhubaneswar",
            category = "healthcare",
            lat = 20.2310,
            lon = 85.7760,
            phone = "+91-674-2476789"
        )
        val service = CivicServiceMarker.fromDto(hospitalDto)
        assertNotNull(service)
        assertEquals(CivicServiceCategory.HEALTHCARE, service!!.category)
        assertEquals("+91-674-2476789", service.phone)

        val atmDto = ServiceItemDto(
            id = "svc_sbi_atm",
            name = "SBI ATM Old Town",
            category = "atm",
            lat = 20.2400,
            lon = 85.8300
        )
        val atm = CivicServiceMarker.fromDto(atmDto)
        assertNotNull(atm)
        assertEquals(CivicServiceCategory.ATM, atm!!.category)
    }

    @Test
    fun testLayerMutualExclusivity_togglingEssentialsDimsDestinations() {
        val initial = MapLayersState(showDestinations = true, showEssentials = false)
        val withEssentials = initial.toggleEssentials()
        assertTrue(withEssentials.showEssentials)
        assertFalse(withEssentials.showDestinations) // Leisure dimmed to prevent pin pollution

        val toggledBack = withEssentials.toggleDestinations()
        assertTrue(toggledBack.showDestinations)
        assertFalse(toggledBack.showEssentials)
    }

    @Test
    fun testLocationDenied_retainsStatewideOdishaOverviewWithoutFakeGps() {
        val state = MapUiState(
            locationStatus = LocationStatus.PermissionDenied,
            cameraTarget = GeoCoordinate.ODISHA_CENTER
        )
        assertEquals(LocationStatus.PermissionDenied, state.locationStatus)
        assertEquals(GeoCoordinate.ODISHA_CENTER, state.cameraTarget)
        assertFalse(state.layers.showUserLocation)
    }

    @Test
    fun testMapSearchParity_searchesEnglishOdiaAndDistrict() {
        val places = listOf(
            DiscoverPlace(
                id = "p1",
                name = "Lingaraj Temple",
                odiaName = "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
                category = "TEMPLE",
                district = "Khordha",
                lat = 20.2382,
                lon = 85.8335
            ),
            DiscoverPlace(
                id = "p2",
                name = "Sun Temple",
                odiaName = "ସୂର୍ଯ୍ୟ ମନ୍ଦିର",
                category = "HERITAGE",
                district = "Puri",
                lat = 19.8876,
                lon = 86.0945
            )
        )
        val state = MapUiState(destinations = places, searchQuery = "ଲିଙ୍ଗରାଜ")
        val results = state.visibleDestinations
        assertEquals(1, results.size)
        assertEquals("Lingaraj Temple", results.first().name)

        val districtSearch = MapUiState(destinations = places, searchQuery = "puri")
        assertEquals(1, districtSearch.visibleDestinations.size)
        assertEquals("Sun Temple", districtSearch.visibleDestinations.first().name)
    }
}
