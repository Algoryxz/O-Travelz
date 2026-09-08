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
}
