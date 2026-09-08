import XCTest
@testable import OTravelz

final class PlaceDetailDomainTests: XCTestCase {

    func testFiveTierSourcePhotoIdentityDeduplication() {
        // 1. Same mediaAssetId deduplicates regardless of differing URLs
        let dto1 = PlaceImageDTO(
            id: nil,
            mediaAssetId: "asset-uuid-1",
            contentSha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            assetHash: nil,
            url: "/static/images/hero.webp",
            thumbnailUrl: nil,
            cardUrl: nil,
            altText: nil,
            title: nil,
            sourceName: nil,
            license: nil,
            attribution: nil,
            status: "verified",
            isPrimary: true
        )
        let dto2 = PlaceImageDTO(
            id: nil,
            mediaAssetId: "asset-uuid-1",
            contentSha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            assetHash: nil,
            url: "/different/path/card.webp",
            thumbnailUrl: nil,
            cardUrl: nil,
            altText: nil,
            title: nil,
            sourceName: nil,
            license: nil,
            attribution: nil,
            status: "verified",
            isPrimary: false
        )
        let list1 = PlaceDomainMapper.toDomainPhotos([dto1, dto2])
        XCTAssertEqual(list1.count, 1, "Same mediaAssetId must deduplicate to 1 photo")
        XCTAssertEqual(PlaceDomainMapper.extractSourceIdentity(dto: dto1), "media_asset:asset-uuid-1")

        // 2. Same contentSha256 deduplicates when mediaAssetId is absent
        let dto3 = PlaceImageDTO(
            id: nil,
            mediaAssetId: nil,
            contentSha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            assetHash: "hash-1",
            url: "/static/path1/hero.webp",
            thumbnailUrl: nil,
            cardUrl: nil,
            altText: nil,
            title: nil,
            sourceName: nil,
            license: nil,
            attribution: nil,
            status: "verified",
            isPrimary: false
        )
        let dto4 = PlaceImageDTO(
            id: nil,
            mediaAssetId: nil,
            contentSha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            assetHash: "hash-2",
            url: "/static/path2/card.webp",
            thumbnailUrl: nil,
            cardUrl: nil,
            altText: nil,
            title: nil,
            sourceName: nil,
            license: nil,
            attribution: nil,
            status: "verified",
            isPrimary: false
        )
        let list2 = PlaceDomainMapper.toDomainPhotos([dto3, dto4])
        XCTAssertEqual(list2.count, 1, "Same contentSha256 must deduplicate to 1 photo")
        XCTAssertEqual(PlaceDomainMapper.extractSourceIdentity(dto: dto3), "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

        // 3. Same assetHash deduplicates when higher tiers absent
        let dto5 = PlaceImageDTO(id: nil, mediaAssetId: nil, contentSha256: nil, assetHash: "hash-xyz", url: "/a/b/c/hero.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false)
        let dto6 = PlaceImageDTO(id: nil, mediaAssetId: nil, contentSha256: nil, assetHash: "hash-xyz", url: "/x/y/z/card.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false)
        let list3 = PlaceDomainMapper.toDomainPhotos([dto5, dto6])
        XCTAssertEqual(list3.count, 1, "Same assetHash must deduplicate to 1 photo")
        XCTAssertEqual(PlaceDomainMapper.extractSourceIdentity(dto: dto5), "hash:hash-xyz")

        // 4. Same canonical image record id deduplicates when hashes absent
        let dto7 = PlaceImageDTO(id: "record-123", mediaAssetId: nil, contentSha256: nil, assetHash: nil, url: "/a/b/c/hero.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false)
        let dto8 = PlaceImageDTO(id: "record-123", mediaAssetId: nil, contentSha256: nil, assetHash: nil, url: "/x/y/z/card.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false)
        let list4 = PlaceDomainMapper.toDomainPhotos([dto7, dto8])
        XCTAssertEqual(list4.count, 1, "Same record id must deduplicate to 1 photo")
        XCTAssertEqual(PlaceDomainMapper.extractSourceIdentity(dto: dto7), "record_id:record-123")
    }

    func testThreeDistinctSourcePhotosPreserved() {
        let photos = [
            PlaceImageDTO(id: "1", mediaAssetId: "photo-1", contentSha256: nil, assetHash: nil, url: "/img1/hero.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: true),
            PlaceImageDTO(id: "2", mediaAssetId: "photo-2", contentSha256: nil, assetHash: nil, url: "/img2/hero.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false),
            PlaceImageDTO(id: "3", mediaAssetId: "photo-3", contentSha256: nil, assetHash: nil, url: "/img3/hero.webp", thumbnailUrl: nil, cardUrl: nil, altText: nil, title: nil, sourceName: nil, license: nil, attribution: nil, status: "verified", isPrimary: false)
        ]
        let domainPhotos = PlaceDomainMapper.toDomainPhotos(photos)
        XCTAssertEqual(domainPhotos.count, 3, "Three distinct source photos must evaluate to 3 domain photos")
    }

    func testMissingMediaCulturalFallback() {
        let placeDTO = PlaceDTO(
            id: "place_no_photo",
            researchId: nil,
            name: "Barabati Fort",
            category: "fort",
            description: nil,
            lat: 20.4853,
            lon: 85.8654,
            district: "Cuttack",
            region: "Central",
            avgVisitMinutes: nil,
            priceTier: nil,
            rating: nil,
            ratingCount: nil,
            interests: nil,
            source: nil,
            sourceUrl: nil,
            verificationStatus: "verified",
            contactPhone: nil,
            emergencyPhone: nil,
            address: nil,
            images: [],
            localizedNames: LocalizedNamesDTO(en: "Barabati Fort", or: "ବାରବାଟୀ ଦୁର୍ଗ", hi: nil)
        )
        let detail = PlaceDomainMapper.toPlaceDetail(placeDTO)

        XCTAssertEqual(detail.photos.count, 0)
        XCTAssertEqual(detail.distinctPhotoCount, 0)
        XCTAssertFalse(detail.hasMultiplePhotos)
        XCTAssertNil(detail.primaryPhoto)
        XCTAssertEqual(detail.odiaName, "ବାରବାଟୀ ଦୁର୍ଗ")
    }

    func testVideoAnd3DCapabilityGatingFalse() {
        let placeDTO = PlaceDTO(
            id: "place_konark",
            researchId: nil,
            name: "Konark Sun Temple",
            category: "heritage",
            description: nil,
            lat: 19.8876,
            lon: 86.0945,
            district: "Puri",
            region: "Coastal",
            avgVisitMinutes: 120,
            priceTier: "moderate",
            rating: 4.9,
            ratingCount: 3200,
            interests: ["unesco", "heritage"],
            source: "ASI",
            sourceUrl: nil,
            verificationStatus: "verified",
            contactPhone: nil,
            emergencyPhone: nil,
            address: nil,
            images: nil,
            localizedNames: nil
        )
        let detail = PlaceDomainMapper.toPlaceDetail(placeDTO)

        XCTAssertFalse(detail.hasVideo, "Video capability must evaluate strictly to false")
        XCTAssertFalse(detail.has3d, "3D capability must evaluate strictly to false")
    }

    func testPracticalTruthNullOmission() {
        let sparseDTO = PlaceDTO(
            id: "place_sparse",
            researchId: nil,
            name: "Debrigarh Sanctuary",
            category: "wildlife",
            description: nil,
            lat: nil,
            lon: nil,
            district: "Sambalpur",
            region: "Western",
            avgVisitMinutes: nil,
            priceTier: nil,
            rating: nil,
            ratingCount: nil,
            interests: nil,
            source: nil,
            sourceUrl: nil,
            verificationStatus: nil,
            contactPhone: nil,
            emergencyPhone: nil,
            address: nil,
            images: nil,
            localizedNames: nil
        )
        let detail = PlaceDomainMapper.toPlaceDetail(sparseDTO)

        XCTAssertNil(detail.priceTier, "Null price tier must remain null (not free)")
        XCTAssertNil(detail.address, "Null address must remain null")
        XCTAssertNil(detail.contactPhone, "Null contact phone must remain null")
        XCTAssertNil(detail.emergencyPhone, "Null emergency phone must remain null")
        XCTAssertNil(detail.avgVisitMinutes, "Null avg visit minutes must remain null")
        XCTAssertFalse(detail.hasCoordinates)
    }

    func testCanonicalPlaceIdPreserved() {
        let dto = PlaceDTO(
            id: "place_similipal_99",
            researchId: nil,
            name: "Similipal National Park",
            category: "nature",
            description: nil,
            lat: 21.8550,
            lon: 86.3400,
            district: "Mayurbhanj",
            region: "Northern",
            avgVisitMinutes: 240,
            priceTier: "moderate",
            rating: nil,
            ratingCount: nil,
            interests: nil,
            source: nil,
            sourceUrl: nil,
            verificationStatus: nil,
            contactPhone: nil,
            emergencyPhone: nil,
            address: nil,
            images: nil,
            localizedNames: nil
        )
        let detail = PlaceDomainMapper.toPlaceDetail(dto)

        XCTAssertEqual(detail.id, "place_similipal_99")
        XCTAssertTrue(detail.hasCoordinates)
    }
}
