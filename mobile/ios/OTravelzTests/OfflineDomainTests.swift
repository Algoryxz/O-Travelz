import Testing
import Foundation
@testable import OTravelz

@Suite("Wave M18 Offline Mode & Truth Parity Tests")
struct OfflineDomainTests {

    @Test("WeatherCacheStore relative time formatting produces human disclosures without arbitrary TTL")
    func testWeatherCacheStoreRelativeTime() {
        let store = WeatherCacheStore()
        let now = Date(timeIntervalSince1970: 1757400000)

        #expect(store.formatRelativeTimeAgo(observedAt: now.addingTimeInterval(-20), now: now) == "just now")
        #expect(store.formatRelativeTimeAgo(observedAt: now.addingTimeInterval(-45 * 60), now: now) == "45m")
        #expect(store.formatRelativeTimeAgo(observedAt: now.addingTimeInterval(-3 * 3600), now: now) == "3h")
        #expect(store.formatRelativeTimeAgo(observedAt: now.addingTimeInterval(-48 * 3600), now: now) == "2d")
    }

    @Test("WeatherCacheStore saves observation and retrieves it as .cached")
    func testWeatherCacheStoreSaveAndRetrieve() {
        let store = WeatherCacheStore()
        let now = Date(timeIntervalSince1970: 1757400000)

        store.saveObservation(
            lat: 20.2961,
            lon: 85.8245,
            locationName: "Bhubaneswar",
            temperatureC: 28.5,
            condition: "Scattered Clouds",
            advice: "Pleasant evening",
            observedAt: now.addingTimeInterval(-2 * 3600)
        )

        let cached = store.getCachedObservation(lat: 20.2961, lon: 85.8245, now: now)
        #expect(cached != nil)

        if case .cached(let name, let temp, let cond, let adv, let relTime) = cached {
            #expect(name == "Bhubaneswar")
            #expect(temp == 28.5)
            #expect(cond == "Scattered Clouds")
            #expect(adv == "Pleasant evening")
            #expect(relTime == "2h")
        } else {
            Issue.record("Expected .cached state")
        }

        // Uncached coordinates return nil
        #expect(store.getCachedObservation(lat: 18.0, lon: 83.0, now: now) == nil)
    }

    @Test("NetworkMonitor supports test simulated state transitions")
    @MainActor
    func testNetworkMonitorSimulatedTransitions() {
        let monitor = NetworkMonitor(monitor: nil)
        monitor.setSimulatedState(.online)
        #expect(monitor.state == .online)

        monitor.setSimulatedState(.offline)
        #expect(monitor.state == .offline)

        monitor.setSimulatedState(.unknown)
        #expect(monitor.state == .unknown)
    }

    @Test("SavedPlace snapshot preserves identity while live fields remain nil")
    func testSavedPlaceSnapshotIntegrity() {
        let saved = SavedPlaceModel(
            canonicalPlaceId: "place_puri_001",
            savedAt: Date(),
            placeName: "Jagannath Temple",
            category: "temple",
            district: "Puri",
            imageUrl: "https://images.otravelz.com/puri_hero.webp",
            rating: 4.9
        )

        let photoList = saved.imageUrl.map {
            [PlacePhoto(id: "photo_\(saved.canonicalPlaceId)", url: $0, caption: saved.placeName, photographer: "Verified", license: "Verified", isPrimary: true)]
        } ?? []

        let detail = PlaceDetail(
            id: saved.canonicalPlaceId,
            researchId: nil,
            name: saved.placeName,
            category: saved.category,
            descriptionText: nil,
            lat: nil,
            lon: nil,
            district: saved.district,
            region: nil,
            avgVisitMinutes: nil,
            priceTier: nil,
            rating: saved.rating,
            ratingCount: nil,
            interests: [],
            source: "Local Offline Snapshot",
            sourceUrl: nil,
            verificationStatus: "Verified Offline Snapshot",
            contactPhone: nil,
            emergencyPhone: nil,
            address: nil,
            photos: photoList,
            localizedNames: LocalizedNames(en: saved.placeName, or: nil, hi: nil)
        )

        #expect(detail.id == "place_puri_001")
        #expect(detail.name == "Jagannath Temple")
        #expect(detail.district == "Puri")
        #expect(detail.photos.count == 1)
        #expect(detail.contactPhone == nil)
        #expect(detail.descriptionText == nil)
    }
}
