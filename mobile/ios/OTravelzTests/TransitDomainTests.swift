import Testing
import Foundation
@testable import OTravelz

@Suite("Transit Domain Models, Stop Truth & Timetable Tests")
struct TransitDomainTests {

    @Test("Transit regions map deterministically by route number range")
    func testTransitRegionMapping() {
        #expect(TransitRegion.fromRouteNumber("10") == .capitalRegion)
        #expect(TransitRegion.fromRouteNumber("23") == .capitalRegion)
        #expect(TransitRegion.fromRouteNumber("101") == .rourkela)
        #expect(TransitRegion.fromRouteNumber("115") == .rourkela)
        #expect(TransitRegion.fromRouteNumber("201") == .sambalpur)
        #expect(TransitRegion.fromRouteNumber("214") == .sambalpur)
        #expect(TransitRegion.fromRouteNumber("301") == .berhampur)
        #expect(TransitRegion.fromRouteNumber("310") == .berhampur)
        #expect(TransitRegion.fromRouteNumber("401") == .keonjhar)
        #expect(TransitRegion.fromRouteNumber("406") == .keonjhar)
        #expect(TransitRegion.fromRouteNumber("999") == .capitalRegion)
    }

    @Test("Stop confidence truth strictly gates external navigation and first-mile walking")
    func testStopConfidenceTruthAndGating() {
        let verifiedStop = TransitStop(
            stopId: "v_1",
            name: "Master Canteen Terminal",
            latitude: 20.2710,
            longitude: 85.8410,
            tier: .verifiedOfficial,
            sequenceOrder: 1,
            city: "Bhubaneswar"
        )
        #expect(verifiedStop.allowsExternalNavigation == true)
        #expect(verifiedStop.allowsFirstMileWalk == true)
        #expect(verifiedStop.isLocalityOnly == false)

        let localityStop = TransitStop(
            stopId: "loc_1",
            name: "Rural Village Chowk",
            latitude: nil,
            longitude: nil,
            tier: .localityOnly,
            sequenceOrder: 2,
            city: nil
        )
        #expect(localityStop.allowsExternalNavigation == false)
        #expect(localityStop.allowsFirstMileWalk == false)
        #expect(localityStop.isLocalityOnly == true)
    }

    @Test("First-mile distance guidance evaluates according to 4 standard bands")
    func testFirstMileDistanceBands() {
        let stop = TransitStop(
            stopId: "v_mc",
            name: "Master Canteen",
            latitude: 20.2710,
            longitude: 85.8410,
            tier: .verifiedOfficial,
            sequenceOrder: 1,
            city: "Bhubaneswar"
        )

        let closeLat = 20.2700
        let closeLon = 85.8410
        let g1 = stop.firstMileGuidance(userLat: closeLat, userLon: closeLon)
        #expect(g1 != nil)
        #expect(g1?.band == .easyWalk)

        let modLat = 20.2665
        let modLon = 85.8410
        let g2 = stop.firstMileGuidance(userLat: modLat, userLon: modLon)
        #expect(g2 != nil)
        #expect(g2?.band == .moderateWalk)

        let locStop = TransitStop(
            stopId: "loc_none",
            name: "Locality Only",
            latitude: nil,
            longitude: nil,
            tier: .localityOnly,
            sequenceOrder: 2,
            city: nil
        )
        #expect(locStop.firstMileGuidance(userLat: closeLat, userLon: closeLon) == nil)
    }

    @Test("Timetable evaluates next scheduled departures in IST without claiming live tracking")
    func testTimetableISTEvaluation() {
        let schedule = TransitSchedule(
            scheduleId: "sch_10_up",
            routeId: "10",
            direction: "UP",
            origin: "Bhubaneswar Railway Station",
            destination: "Biju Patnaik Airport",
            departures: ["06:00", "07:30", "12:00", "18:45", "21:00"]
        )

        #expect(schedule.departures.count == 5)
        #expect(schedule.hasDepartures == true)

        let nextFromMorning = schedule.nextDeparture(afterISTMinutes: 6 * 60 + 15)
        #expect(nextFromMorning == "07:30")

        let nextFromLate = schedule.nextDeparture(afterISTMinutes: 21 * 60 + 30)
        #expect(nextFromLate == nil)
    }

    @Test("Search ranking hierarchy prefers exact route number over prefix and stop names")
    func testSearchRankingHierarchy() {
        let r10 = TransitRouteSummary(
            routeId: "10",
            routeNumber: "10",
            providerName: "CRUT",
            region: .capitalRegion,
            origin: "Master Canteen",
            destination: "AIIMS",
            directionCount: 2,
            hasSchedules: true,
            totalDepartures: 40
        )

        let r101 = TransitRouteSummary(
            routeId: "101",
            routeNumber: "101",
            providerName: "CRUT",
            region: .rourkela,
            origin: "Rourkela Station",
            destination: "Vedvyas",
            directionCount: 2,
            hasSchedules: true,
            totalDepartures: 24
        )

        let r23 = TransitRouteSummary(
            routeId: "23",
            routeNumber: "23",
            providerName: "CRUT",
            region: .capitalRegion,
            origin: "Master Canteen",
            destination: "Baramunda",
            directionCount: 2,
            hasSchedules: true,
            totalDepartures: 30
        )

        let catalog = [r101, r23, r10]

        let ranked = TransitSearchEngine.filterAndRank(catalog: catalog, query: "10")
        #expect(ranked.first?.routeNumber == "10")

        let rankedMaster = TransitSearchEngine.filterAndRank(catalog: catalog, query: "Master")
        #expect(rankedMaster.count == 2)
        #expect(!rankedMaster.contains(where: { .routeNumber == "101" }))
    }

    @Test("Transit fares are strictly null or unavailable")
    func testFareTruthNullness() {
        let route = TransitRouteSummary(
            routeId: "10",
            routeNumber: "10",
            providerName: "CRUT",
            region: .capitalRegion,
            origin: "Master Canteen",
            destination: "AIIMS",
            directionCount: 2,
            hasSchedules: true,
            totalDepartures: 40
        )
        #expect(route.fareText == nil)
    }

    @Test("Bundled canonical fixtures decode exactly 154 routes across 5 regions")
    func testBundledCatalogCompleteness() async {
        let repo = TransitRepository()
        let routes = await repo.loadRoutes()
        #expect(routes.count == 154)

        let capital = routes.filter { .region == .capitalRegion }
        let rourkela = routes.filter { .region == .rourkela }
        let sambalpur = routes.filter { .region == .sambalpur }
        let berhampur = routes.filter { .region == .berhampur }
        let keonjhar = routes.filter { .region == .keonjhar }

        #expect(capital.count == 96)
        #expect(rourkela.count == 25)
        #expect(sambalpur.count == 17)
        #expect(berhampur.count == 10)
        #expect(keonjhar.count == 6)
    }
}
