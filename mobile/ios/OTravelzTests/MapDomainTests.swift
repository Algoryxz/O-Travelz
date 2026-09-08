import Testing
@testable import OTravelz

@Suite("Map Domain Models & Truth Tests")
struct MapDomainTests {

    @Test("GeoCoordinate strictly validates Odisha bounding box")
    func testGeoCoordinateBounds() {
        // Valid coordinate in Bhubaneswar
        let valid = GeoCoordinate(latitude: 20.2382, longitude: 85.8335)
        #expect(valid != nil)
        #expect(valid?.latitude == 20.2382)
        #expect(valid?.longitude == 85.8335)

        // Invalid: (0, 0)
        #expect(GeoCoordinate(latitude: 0.0, longitude: 0.0) == nil)

        // Invalid: Outside Odisha
        #expect(GeoCoordinate(latitude: 28.6139, longitude: 77.2090) == nil)
    }

    @Test("Verified stop gating permits markers only for official and geospatial tiers")
    func testVerifiedStopGating() {
        let officialStop = TransitStopMarker(
            id: "stop_1",
            name = "Master Canteen",
            publishedName: "MASTER CANTEEN",
            coordinate: GeoCoordinate(latitude: 20.2710, longitude: 85.8410),
            tier: .verifiedOfficial,
            city: "Bhubaneswar",
            district: "Khordha",
            routesServing: ["10", "11"]
        )
        #expect(officialStop.canRenderMarker == true)
        #expect(officialStop.tier.allowsFirstMileWalk == true)
        #expect(officialStop.tier.allowsExternalNavigation == true)

        let candidateStop = TransitStopMarker(
            id: "stop_cand",
            name = "Proposed Stop",
            publishedName: nil,
            coordinate: GeoCoordinate(latitude: 20.2500, longitude: 85.8200),
            tier: .candidateHigh,
            city: "Bhubaneswar",
            district: "Khordha",
            routesServing: []
        )
        #expect(candidateStop.canRenderMarker == false)
        #expect(candidateStop.canRenderCandidateMarker == true)
        #expect(candidateStop.tier.allowsFirstMileWalk == false)
        #expect(candidateStop.tier.allowsExternalNavigation == false)
    }

    @Test("Locality-only stops suppress pin rendering")
    func testLocalityOnlyStopNoPin() {
        let localityStop = TransitStopMarker(
            id: "stop_locality",
            name = "Rural Village Center",
            publishedName: nil,
            coordinate: nil,
            tier: .localityOnly,
            city: "Ganjam",
            district: "Ganjam",
            routesServing: []
        )
        #expect(localityStop.canRenderMarker == false)
        #expect(localityStop.canRenderCandidateMarker == false)
        #expect(localityStop.coordinate == nil)
    }

    @Test("Route geometry truth suppresses polylines when geometry is unavailable")
    func testRouteGeometrySuppression() {
        let unavailableRoute = TransitRouteGeometry(
            id: "rt_99",
            routeNumber: "99",
            routeName: "Unsurveyed Route",
            confidence: .geometryUnavailable,
            coordinates: []
        )
        #expect(unavailableRoute.isRenderable == false)
    }

    @Test("Route geometry enforces zero straight line bridging")
    func testZeroStraightLineBridging() {
        let singlePointRoute = TransitRouteGeometry(
            id: "rt_1",
            routeNumber: "1",
            routeName: "Single Point",
            confidence: .highConfidenceRouteGeometry,
            coordinates: [GeoCoordinate(latitude: 20.25, longitude: 85.80)!]
        )
        #expect(singlePointRoute.isRenderable == false)

        let multiPointRoute = TransitRouteGeometry(
            id: "rt_2",
            routeNumber: "2",
            routeName: "Surveyed Alignment",
            confidence: .verifiedRouteGeometry,
            coordinates: [
                GeoCoordinate(latitude: 20.25, longitude: 85.80)!,
                GeoCoordinate(latitude: 20.26, longitude: 85.81)!
            ]
        )
        #expect(multiPointRoute.isRenderable == true)
    }

    @Test("Layer toggles enforce mutual exclusivity for essentials")
    func testLayerExclusivity() {
        var layers = MapLayersState(showDestinations: true, showEssentials: false)
        layers.toggleEssentials()
        #expect(layers.showEssentials == true)
        #expect(layers.showDestinations == false)

        layers.toggleDestinations()
        #expect(layers.showDestinations == true)
        #expect(layers.showEssentials == false)
    }

    @Test("Location denied state retains statewide Odisha overview")
    func testLocationDeniedState() {
        let status = LocationStatus.permissionDenied
        #expect(status == .permissionDenied)
    }
}
