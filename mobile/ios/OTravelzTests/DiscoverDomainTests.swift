import XCTest
@testable import OTravelz

final class DiscoverDomainTests: XCTestCase {

    func testPhotoDeduplicationCollapsesResponsiveVariants() {
        let images = [
            PlaceImageDTO(
                url: "https://example.com/places/place_bbsr_001/06a456469886/hero.webp",
                thumbnailUrl: "https://example.com/places/place_bbsr_001/06a456469886/thumbnail.webp",
                cardUrl: "https://example.com/places/place_bbsr_001/06a456469886/card.webp",
                altText: "Hero variant",
                title: "Hero",
                sourceName: "Odisha Tourism",
                license: "CC-BY",
                attribution: "Odisha Tourism",
                status: "verified",
                isPrimary: true
            ),
            PlaceImageDTO(
                url: "https://example.com/places/place_bbsr_001/06a456469886/card.webp",
                thumbnailUrl: nil,
                cardUrl: nil,
                altText: "Card variant",
                title: "Card",
                sourceName: "Odisha Tourism",
                license: "CC-BY",
                attribution: "Odisha Tourism",
                status: "verified",
                isPrimary: false
            ),
            PlaceImageDTO(
                url: "https://example.com/places/place_bbsr_001/06a456469886/thumbnail.webp",
                thumbnailUrl: nil,
                cardUrl: nil,
                altText: "Thumbnail variant",
                title: "Thumbnail",
                sourceName: "Odisha Tourism",
                license: "CC-BY",
                attribution: "Odisha Tourism",
                status: "verified",
                isPrimary: false
            )
        ]

        let domainPhotos = PlaceDomainMapper.toDomainPhotos(images)
        XCTAssertEqual(domainPhotos.count, 1, "Expected 3 responsive variants with same source folder hash to collapse into 1 domain photo")
        XCTAssertEqual(domainPhotos.first?.sourceIdentity, "06a456469886")
    }

    func testDistinctPhotosArePreserved() {
        let images = [
            PlaceImageDTO(
                url: "https://example.com/places/place_bbsr_001/06a456469886/hero.webp",
                thumbnailUrl: nil,
                cardUrl: nil,
                altText: "Photo 1",
                title: "Photo 1",
                sourceName: nil,
                license: nil,
                attribution: nil,
                status: "verified",
                isPrimary: true
            ),
            PlaceImageDTO(
                url: "https://example.com/places/place_bbsr_001/1f9b8c7d6e5a/hero.webp",
                thumbnailUrl: nil,
                cardUrl: nil,
                altText: "Photo 2",
                title: "Photo 2",
                sourceName: nil,
                license: nil,
                attribution: nil,
                status: "verified",
                isPrimary: false
            )
        ]

        let domainPhotos = PlaceDomainMapper.toDomainPhotos(images)
        XCTAssertEqual(domainPhotos.count, 2, "Expected 2 distinct photo hashes to remain 2 distinct domain photos")
    }

    func testNonLeisureExclusion() {
        XCTAssertFalse(PlaceDomainMapper.isLeisureEligible(category: "hospital"))
        XCTAssertFalse(PlaceDomainMapper.isLeisureEligible(category: "transit_hub"))
        XCTAssertFalse(PlaceDomainMapper.isLeisureEligible(category: "bus_stop"))
        XCTAssertFalse(PlaceDomainMapper.isLeisureEligible(category: "train_station"))
        XCTAssertTrue(PlaceDomainMapper.isLeisureEligible(category: "temple"))
        XCTAssertTrue(PlaceDomainMapper.isLeisureEligible(category: "heritage"))
        XCTAssertTrue(PlaceDomainMapper.isLeisureEligible(category: "beach"))
        XCTAssertTrue(PlaceDomainMapper.isLeisureEligible(category: "nature"))
    }

    func testPlaceMappingPreservesOdiaNameAndTruth() {
        let dto = PlaceDTO(
            id: "place_bbsr_001",
            researchId: "OD-BBS-01",
            name: "Lingaraj Temple",
            category: "temple",
            description: "Ancient 11th century temple dedicated to Harihara.",
            lat: 20.2382,
            lon: 85.8336,
            district: "khordha",
            region: "Coastal Odisha",
            avgVisitMinutes: 90,
            priceTier: "free",
            rating: 4.8,
            ratingCount: 1420,
            interests: ["heritage", "architecture", "spirituality"],
            source: "Odisha Tourism",
            sourceUrl: "https://odishatourism.gov.in",
            verificationStatus: "verified",
            contactPhone: nil,
            emergencyPhone: "112",
            address: "Old Town, Bhubaneswar",
            images: [
                PlaceImageDTO(
                    url: "https://example.com/places/place_bbsr_001/06a456469886/hero.webp",
                    thumbnailUrl: nil,
                    cardUrl: nil,
                    altText: "Lingaraj Temple Sanctum",
                    title: "Sanctum",
                    sourceName: "Odisha Tourism",
                    license: "CC-BY-4.0",
                    attribution: "Govt of Odisha",
                    status: "verified",
                    isPrimary: true
                )
            ],
            localizedNames: LocalizedNamesDTO(
                en: "Lingaraj Temple",
                or: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର",
                hi: "लिंगराज मंदिर"
            )
        )

        let discoverPlace = PlaceDomainMapper.toDiscoverPlace(dto)
        XCTAssertEqual(discoverPlace.id, "place_bbsr_001")
        XCTAssertEqual(discoverPlace.name, "Lingaraj Temple")
        XCTAssertEqual(discoverPlace.odiaName, "ଲିଙ୍ଗରାଜ ମନ୍ଦିର")
        XCTAssertTrue(discoverPlace.isEligibleLeisure)
        XCTAssertTrue(discoverPlace.hasVerifiedImage)
        XCTAssertEqual(discoverPlace.verifiedPhotosCount, 1)

        let placeDetail = PlaceDomainMapper.toPlaceDetail(dto)
        XCTAssertEqual(placeDetail.id, "place_bbsr_001")
        XCTAssertEqual(placeDetail.avgVisitMinutes, 90)
        XCTAssertEqual(placeDetail.photos.count, 1)
        XCTAssertNil(placeDetail.contactPhone, "Unspecified phone must remain nil")
    }

    func testKendujharNormalization() {
        let place = DiscoverPlace(
            id: "test_kj",
            name: "Khandadhar Waterfall",
            category: "waterfall",
            district: "Kendujhar"
        )
        XCTAssertEqual(place.normalizedDistrict, "Keonjhar")
    }

    func testHaversineDistanceCalculationAndFormatting() {
        // Lingaraj Temple in Bhubaneswar: 20.2382, 85.8335
        // Master Canteen (Bhubaneswar Railway Station): 20.2667, 85.8436
        // Approximate distance: ~3.3 km
        let place = DiscoverPlace(
            id: "lingaraj",
            name: "Lingaraj Temple",
            category: "temple",
            district: "Khordha",
            lat: 20.2382,
            lon: 85.8335
        )

        let dist = place.distanceKmFrom(userLat: 20.2667, userLon: 85.8436)
        XCTAssertNotNil(dist)
        if let d = dist {
            XCTAssertTrue(d >= 3.0 && d <= 3.6, "Distance should be ~3.3 km")
            let formattedKm = place.formattedDistance(d)
            XCTAssertTrue(formattedKm.hasSuffix("km away"))
        }

        let closeFormatted = place.formattedDistance(0.45)
        XCTAssertEqual(closeFormatted, "450 m away")
    }

    func testSearchEngineTieredRanking() {
        let p1 = DiscoverPlace(id: "p1", name: "Puri", category: "beach", district: "Puri")
        let p2 = DiscoverPlace(id: "p2", name: "Puriswara Temple", category: "temple", district: "Ganjam")
        let p3 = DiscoverPlace(id: "p3", name: "Jagannath Temple", category: "temple", district: "Puri")
        let p4 = DiscoverPlace(id: "p4", name: "Gopalpur-on-Sea", category: "beach", district: "Ganjam")

        let catalog = [p3, p4, p2, p1]
        let results = DiscoverSearchEngine.filterAndRank(catalog: catalog, query: "Puri")

        // Exact match (p1) must be first (1000 pts)
        XCTAssertEqual(results[0].id, "p1")
        // Prefix match (p2) must be second (800 pts)
        XCTAssertEqual(results[1].id, "p2")
        // District match (p3) must be third (400 pts)
        XCTAssertEqual(results[2].id, "p3")
        // p4 does not match "Puri"
        XCTAssertEqual(results.count, 3)
    }

    func testOdiaScriptSearch() {
        let p1 = DiscoverPlace(
            id: "konark",
            name: "Konark Sun Temple",
            category: "heritage",
            district: "Puri",
            odiaName: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର"
        )
        let p2 = DiscoverPlace(
            id: "lingaraj",
            name: "Lingaraj Temple",
            category: "temple",
            district: "Khordha",
            odiaName: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର"
        )

        let catalog = [p1, p2]
        let results = DiscoverSearchEngine.filterAndRank(catalog: catalog, query: "କୋଣାର୍କ")

        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results.first?.id, "konark")
    }

    func testMultiFilterCombination() {
        let p1 = DiscoverPlace(id: "p1", name: "Dhauli Shanti Stupa", category: "heritage", district: "Khordha")
        let p2 = DiscoverPlace(id: "p2", name: "Lingaraj Temple", category: "temple", district: "Khordha")
        let p3 = DiscoverPlace(id: "p3", name: "Konark Sun Temple", category: "heritage", district: "Puri")

        let catalog = [p1, p2, p3]
        let results = DiscoverSearchEngine.filterAndRank(
            catalog: catalog,
            selectedCategory: "heritage",
            selectedDistrict: "Khordha"
        )

        XCTAssertEqual(results.count, 1)
        XCTAssertEqual(results.first?.id, "p1")
    }

    func testProximitySortingWhenNearMeActive() {
        // User at Bhubaneswar Railway Station (20.2667, 85.8436)
        let p1 = DiscoverPlace(id: "lingaraj", name: "Lingaraj Temple", category: "temple", district: "Khordha", lat: 20.2382, lon: 85.8335)
        let p2 = DiscoverPlace(id: "dhauli", name: "Dhauli Shanti Stupa", category: "heritage", district: "Khordha", lat: 20.1923, lon: 85.8394)
        let p3 = DiscoverPlace(id: "konark", name: "Konark Sun Temple", category: "heritage", district: "Puri", lat: 19.8876, lon: 86.0945)

        let catalog = [p3, p2, p1]
        let results = DiscoverSearchEngine.filterAndRank(
            catalog: catalog,
            userLat: 20.2667,
            userLon: 85.8436,
            sortByDistance: true
        )

        XCTAssertEqual(results[0].id, "lingaraj", "Closest place must be first")
        XCTAssertEqual(results[1].id, "dhauli", "Second closest must be second")
        XCTAssertEqual(results[2].id, "konark", "Furthest must be last")
    }
}
