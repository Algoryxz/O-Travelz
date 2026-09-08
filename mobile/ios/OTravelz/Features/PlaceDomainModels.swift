import Foundation

public struct PlacePhoto: Identifiable, Hashable, Sendable {
    public var id: String { sourceIdentity }
    public let url: String
    public let thumbnailUrl: String?
    public let cardUrl: String?
    public let altText: String?
    public let title: String?
    public let sourceName: String?
    public let license: String?
    public let attribution: String?
    public let isVerified: Bool
    public let sourceIdentity: String

    public init(
        url: String,
        thumbnailUrl: String? = nil,
        cardUrl: String? = nil,
        altText: String? = nil,
        title: String? = nil,
        sourceName: String? = nil,
        license: String? = nil,
        attribution: String? = nil,
        isVerified: Bool = false,
        sourceIdentity: String = ""
    ) {
        self.url = url
        self.thumbnailUrl = thumbnailUrl
        self.cardUrl = cardUrl
        self.altText = altText
        self.title = title
        self.sourceName = sourceName
        self.license = license
        self.attribution = attribution
        self.isVerified = isVerified
        self.sourceIdentity = sourceIdentity.isEmpty ? url : sourceIdentity
    }
}

public struct DiscoverPlace: Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let category: String
    public let district: String?
    public let region: String?
    public let rating: Double?
    public let ratingCount: Int?
    public let isEligibleLeisure: Bool
    public let odiaName: String?
    public let hindiName: String?
    public let primaryPhoto: PlacePhoto?
    public let verifiedPhotosCount: Int

    public var hasVerifiedImage: Bool {
        primaryPhoto != nil
    }

    public init(
        id: String,
        name: String,
        category: String,
        district: String? = nil,
        region: String? = nil,
        rating: Double? = nil,
        ratingCount: Int? = nil,
        isEligibleLeisure: Bool = true,
        odiaName: String? = nil,
        hindiName: String? = nil,
        primaryPhoto: PlacePhoto? = nil,
        verifiedPhotosCount: Int = 0
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.district = district
        self.region = region
        self.rating = rating
        self.ratingCount = ratingCount
        self.isEligibleLeisure = isEligibleLeisure
        self.odiaName = odiaName
        self.hindiName = hindiName
        self.primaryPhoto = primaryPhoto
        self.verifiedPhotosCount = verifiedPhotosCount
    }
}

public struct PlaceDetail: Identifiable, Hashable, Sendable {
    public let id: String
    public let researchId: String?
    public let name: String
    public let category: String
    public let descriptionText: String?
    public let lat: Double?
    public let lon: Double?
    public let district: String?
    public let region: String?
    public let avgVisitMinutes: Int?
    public let priceTier: String?
    public let rating: Double?
    public let ratingCount: Int?
    public let interests: [String]
    public let source: String?
    public let sourceUrl: String?
    public let verificationStatus: String?
    public let contactPhone: String?
    public let emergencyPhone: String?
    public let address: String?
    public let photos: [PlacePhoto]
    public let primaryPhoto: PlacePhoto?
    public let odiaName: String?
    public let hindiName: String?

    public var hasVerifiedImage: Bool {
        primaryPhoto != nil
    }

    public init(
        id: String,
        researchId: String? = nil,
        name: String,
        category: String,
        descriptionText: String? = nil,
        lat: Double? = nil,
        lon: Double? = nil,
        district: String? = nil,
        region: String? = nil,
        avgVisitMinutes: Int? = nil,
        priceTier: String? = nil,
        rating: Double? = nil,
        ratingCount: Int? = nil,
        interests: [String] = [],
        source: String? = nil,
        sourceUrl: String? = nil,
        verificationStatus: String? = nil,
        contactPhone: String? = nil,
        emergencyPhone: String? = nil,
        address: String? = nil,
        photos: [PlacePhoto] = [],
        primaryPhoto: PlacePhoto? = nil,
        odiaName: String? = nil,
        hindiName: String? = nil
    ) {
        self.id = id
        self.researchId = researchId
        self.name = name
        self.category = category
        self.descriptionText = descriptionText
        self.lat = lat
        self.lon = lon
        self.district = district
        self.region = region
        self.avgVisitMinutes = avgVisitMinutes
        self.priceTier = priceTier
        self.rating = rating
        self.ratingCount = ratingCount
        self.interests = interests
        self.source = source
        self.sourceUrl = sourceUrl
        self.verificationStatus = verificationStatus
        self.contactPhone = contactPhone
        self.emergencyPhone = emergencyPhone
        self.address = address
        self.photos = photos
        self.primaryPhoto = primaryPhoto
        self.odiaName = odiaName
        self.hindiName = hindiName
    }
}

public enum PlaceDomainMapper {
    private static let excludedCategories: Set<String> = [
        "hospital", "medical", "clinic", "transit", "transit_hub",
        "bus_stop", "train_station", "railway_station"
    ]

    public static func isLeisureEligible(category: String) -> Bool {
        !excludedCategories.contains(category.lowercased().trimmingCharacters(in: .whitespacesAndNewlines))
    }

    public static func extractSourceIdentity(url: String) -> String {
        let normalized = url.replacingOccurrences(of: "\\", with: "/")
        let components = normalized.split(separator: "/")
        if components.count >= 2 {
            let last = components.last!
            if last.hasSuffix(".webp") || last.hasSuffix(".jpg") || last.hasSuffix(".png") {
                let parent = String(components[components.count - 2])
                if parent.count >= 8 {
                    return parent
                }
            }
        }
        return normalized
    }

    public static func toDomainPhotos(_ imageDtos: [PlaceImageDTO]?) -> [PlacePhoto] {
        guard let list = imageDtos, !list.isEmpty else { return [] }
        var seenIdentities = Set<String>()
        var photos: [PlacePhoto] = []

        for img in list {
            let identity = extractSourceIdentity(url: img.url)
            if !seenIdentities.contains(identity) {
                seenIdentities.insert(identity)
                let isVerified = (img.status?.lowercased() == "verified") || (img.isPrimary == true)
                photos.append(
                    PlacePhoto(
                        url: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        cardUrl: img.cardUrl,
                        altText: img.altText,
                        title: img.title,
                        sourceName: img.sourceName,
                        license: img.license,
                        attribution: img.attribution,
                        isVerified: isVerified,
                        sourceIdentity: identity
                    )
                )
            }
        }
        return photos
    }

    public static func toDiscoverPlace(_ dto: PlaceDTO) -> DiscoverPlace {
        let domainPhotos = toDomainPhotos(dto.images)
        let primary = domainPhotos.first(where: { $0.isVerified }) ?? domainPhotos.first
        let isEligible = isLeisureEligible(category: dto.category)

        return DiscoverPlace(
            id: dto.id,
            name: dto.name,
            category: dto.category,
            district: dto.district,
            region: dto.region,
            rating: dto.rating,
            ratingCount: dto.ratingCount,
            isEligibleLeisure: isEligible,
            odiaName: dto.localizedNames?.or,
            hindiName: dto.localizedNames?.hi,
            primaryPhoto: primary,
            verifiedPhotosCount: domainPhotos.filter { $0.isVerified }.count
        )
    }

    public static func toPlaceDetail(_ dto: PlaceDTO) -> PlaceDetail {
        let domainPhotos = toDomainPhotos(dto.images)
        let primary = domainPhotos.first(where: { $0.isVerified }) ?? domainPhotos.first

        return PlaceDetail(
            id: dto.id,
            researchId: dto.researchId,
            name: dto.name,
            category: dto.category,
            descriptionText: dto.description,
            lat: dto.lat,
            lon: dto.lon,
            district: dto.district,
            region: dto.region,
            avgVisitMinutes: dto.avgVisitMinutes,
            priceTier: dto.priceTier,
            rating: dto.rating,
            ratingCount: dto.ratingCount,
            interests: dto.interests ?? [],
            source: dto.source,
            sourceUrl: dto.sourceUrl,
            verificationStatus: dto.verificationStatus,
            contactPhone: dto.contactPhone,
            emergencyPhone: dto.emergencyPhone,
            address: dto.address,
            photos: domainPhotos,
            primaryPhoto: primary,
            odiaName: dto.localizedNames?.or,
            hindiName: dto.localizedNames?.hi
        )
    }
}
