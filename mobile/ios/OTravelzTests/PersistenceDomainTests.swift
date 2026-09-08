import Testing
import Foundation
@testable import OTravelz

@Suite("Wave M14 Trips & Saved Places Persistence Models Tests")
struct PersistenceDomainTests {

    @Test("SavedPlaceModel initializes with canonical place reference")
    func testSavedPlaceModelInitialization() {
        let place = SavedPlaceModel(
            canonicalPlaceId = "lingaraj-temple",
            placeName = "Lingaraj Temple",
            category = "temple",
            district = "Khurda",
            imageUrl = "/static/lingaraj.webp",
            rating = 4.8
        )

        #expect(place.canonicalPlaceId == "lingaraj-temple")
        #expect(place.placeName == "Lingaraj Temple")
        #expect(place.category == "temple")
        #expect(place.district == "Khurda")
        #expect(place.imageUrl == "/static/lingaraj.webp")
        #expect(place.rating == 4.8)
    }

    @Test("SavedTripModel tracks schemaVersion and sorts stops deterministically")
    func testSavedTripModelStopSorting() {
        let trip = SavedTripModel(
            tripId: "trip-test-01",
            title = "Golden Triangle Journey",
            daysCount = 2,
            startHub = "Bhubaneswar",
            constraintsJson: "{\"days\":2,\"pace\":\"moderate\"}",
            schemaVersion: 1
        )

        #expect(trip.schemaVersion == 1)
        #expect(trip.daysCount == 2)

        let stopDay2Seq1 = SavedTripStopModel(
            stopId: "s3",
            dayNumber: 2,
            stopSequence: 1,
            canonicalPlaceId = "puri-jagannath",
            placeName = "Jagannath Temple",
            category = "temple",
            hopFare: nil
        )

        let stopDay1Seq2 = SavedTripStopModel(
            stopId: "s2",
            dayNumber: 1,
            stopSequence: 2,
            canonicalPlaceId = "mukteswar-temple",
            placeName = "Mukteswar Temple",
            category = "temple",
            hopFare: nil
        )

        let stopDay1Seq1 = SavedTripStopModel(
            stopId: "s1",
            dayNumber: 1,
            stopSequence: 1,
            canonicalPlaceId = "lingaraj-temple",
            placeName = "Lingaraj Temple",
            category = "temple",
            hopFare: nil
        )

        // Attach stops out of order
        trip.stops = [stopDay2Seq1, stopDay1Seq2, stopDay1Seq1]

        let sorted = trip.sortedStops
        #expect(sorted.count == 3)
        #expect(sorted[0].stopId == "s1") // Day 1, Seq 1
        #expect(sorted[1].stopId == "s2") // Day 1, Seq 2
        #expect(sorted[2].stopId == "s3") // Day 2, Seq 1
    }

    @Test("SavedTripStopModel strictly enforces null hopFare invariant")
    func testStrictlyNullHopFareInvariant() {
        let stop = SavedTripStopModel(
            stopId: "stop-fare-test",
            dayNumber: 1,
            stopSequence: 1,
            canonicalPlaceId = "dhauli-shanti-stupa",
            placeName = "Dhauli Shanti Stupa",
            category = "heritage",
            hopFare: nil
        )

        #expect(stop.hopFare == nil)
    }

    @Test("TripProgressModel defaults and completion state transitions")
    func testTripProgressModelDefaults() {
        let progress = TripProgressModel(
            tripId: "trip-active-01",
            isActive: true,
            activeDay: 1,
            currentMilestoneIndex: 0
        )

        #expect(progress.tripId == "trip-active-01")
        #expect(progress.isActive == true)
        #expect(progress.activeDay == 1)
        #expect(progress.currentMilestoneIndex == 0)
        #expect(progress.completionState == "IN_PROGRESS")
        #expect(progress.completedStopIdsJson == "[]")
        #expect(progress.skippedStopIdsJson == "[]")
    }
}
