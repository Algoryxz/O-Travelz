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
    public let lat: Double?
    public let lon: Double?
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

    public var hasCoordinates: Bool {
        lat != nil && lon != nil
    }

    public var normalizedDistrict: String? {
        guard let d = district?.trimmingCharacters(in: .whitespacesAndNewlines), !d.isEmpty else { return nil }
        if d.caseInsensitiveCompare("Kendujhar") == .orderedSame {
            return "Keonjhar"
        }
        return d
    }

    public func distanceKmFrom(userLat: Double, userLon: Double) -> Double? {
        guard let pLat = lat, let pLon = lon else { return nil }
        let r = 6371.0
        let dLat = (pLat - userLat) * .pi / 180.0
        let dLon = (pLon - userLon) * .pi / 180.0
        let fromLatRad = userLat * .pi / 180.0
        let toLatRad = pLat * .pi / 180.0
        let a = sin(dLat / 2.0) * sin(dLat / 2.0) +
                cos(fromLatRad) * cos(toLatRad) *
                sin(dLon / 2.0) * sin(dLon / 2.0)
        let c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))
        return r * c
    }

    public func formattedDistance(_ distanceKm: Double) -> String {
        if distanceKm < 1.0 {
            let meters = Int((distanceKm * 1000).rounded())
            return "\(meters) m away"
        } else {
            return String(format: "%.1f km away", distanceKm)
        }
    }

    public init(
        id: String,
        name: String,
        category: String,
        district: String? = nil,
        region: String? = nil,
        lat: Double? = nil,
        lon: Double? = nil,
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
        self.lat = lat
        self.lon = lon
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

    public var hasCoordinates: Bool {
        lat != nil && lon != nil
    }

    public var distinctPhotoCount: Int {
        photos.count
    }

    public var hasMultiplePhotos: Bool {
        photos.count > 1
    }

    /// Strict capability gating: backend places API does not expose video streams.
    public var hasVideo: Bool {
        false
    }

    /// Strict capability gating: backend places API does not expose 3D runtime models.
    public var has3d: Bool {
        false
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

    /// Canonical 5-tier source-photo identity priority:
    /// 1. media_asset_id
    /// 2. content_sha256
    /// 3. asset_hash
    /// 4. canonical image record id
    /// 5. normalized source URL fallback
    public static func extractSourceIdentity(dto: PlaceImageDTO) -> String {
        if let aid = dto.mediaAssetId, !aid.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return "media_asset:\(aid)"
        }
        if let sha = dto.contentSha256, !sha.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return "sha256:\(sha)"
        }
        if let hash = dto.assetHash, !hash.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return "hash:\(hash)"
        }
        if let recId = dto.id, !recId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return "record_id:\(recId)"
        }
        return extractSourceIdentity(url: dto.url)
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
        if components.count >= 3 {
            return components[components.count - 3...components.count - 2].joined(separator: "/")
        }
        return normalized
    }

    public static func toDomainPhotos(_ imageDtos: [PlaceImageDTO]?) -> [PlacePhoto] {
        guard let list = imageDtos, !list.isEmpty else { return [] }
        var seenIdentities = Set<String>()
        var photos: [PlacePhoto] = []

        for img in list {
            let isVerified = (img.status?.lowercased() == "verified") || (img.isPrimary == true)
            guard isVerified else { continue }
            let identity = extractSourceIdentity(dto: img)
            if !seenIdentities.contains(identity) {
                seenIdentities.insert(identity)
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
                        isVerified: true,
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
            lat: dto.lat,
            lon: dto.lon,
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

/// Pure deterministic search, ranking and spatial filtering engine for iOS Discover catalog.
/// Implements the tiered ranking contract matching Android DiscoverSearchEngine:
/// - Tier 1: Exact name match (1000 pts)
/// - Tier 2: Prefix match on name (800 pts)
/// - Tier 3: Odia script match (600 pts)
/// - Tier 4: District or Category match (400 pts)
/// - Tier 5: Substring / token match on name (200 pts)
/// - Tier 6: Substring match on description / tags (100 pts)
public enum DiscoverSearchEngine {

    public static func calculateRelevance(
        place: DiscoverPlace,
        queryTokens: [String],
        rawQuery: String
    ) -> Int {
        if queryTokens.isEmpty { return 0 }

        let normName = place.name.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        let normQuery = rawQuery.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)

        // Tier 1: Exact name match
        if normName == normQuery {
            return 1000
        }

        // Tier 2: Prefix name match
        if normName.hasPrefix(normQuery) {
            return 800
        }

        // Tier 3: Odia script match
        if let odia = place.odiaName, !odia.isEmpty {
            if odia.contains(rawQuery.trimmingCharacters(in: .whitespacesAndNewlines)) {
                return 600
            }
        }

        // Tier 4: District or category match
        let normDistrict = place.normalizedDistrict?.lowercased() ?? ""
        let normCategory = place.category.lowercased()
        if (!normDistrict.isEmpty && normDistrict.contains(normQuery)) ||
           (!normCategory.isEmpty && normCategory.contains(normQuery)) {
            return 400
        }

        // Tier 5: Token or substring match in name
        var allTokensMatch = true
        for token in queryTokens {
            if !normName.contains(token) {
                allTokensMatch = false
                break
            }
        }
        if allTokensMatch {
            return 200
        }

        // Partial match
        for token in queryTokens {
            if normName.contains(token) || normDistrict.contains(token) || normCategory.contains(token) {
                return 100
            }
        }

        return 0
    }

    public static func filterAndRank(
        catalog: [DiscoverPlace],
        query: String? = nil,
        selectedCategory: String? = nil,
        selectedDistrict: String? = nil,
        userLat: Double? = nil,
        userLon: Double? = nil,
        sortByDistance: Bool = false
    ) -> [DiscoverPlace] {
        let trimmedQuery = query?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let hasQuery = !trimmedQuery.isEmpty
        let queryTokens = hasQuery ? trimmedQuery.lowercased().components(separatedBy: .whitespacesAndNewlines).filter { !$0.isEmpty } : []

        let filtered = catalog.filter { place in
            guard place.isEligibleLeisure else { return false }

            // Category filter
            if let cat = selectedCategory, !cat.isEmpty && cat != "all" {
                let placeCat = place.category.lowercased()
                let targetCat = cat.lowercased()
                if !placeCat.contains(targetCat) && !targetCat.contains(placeCat) {
                    return false
                }
            }

            // District filter
            if let dist = selectedDistrict, !dist.isEmpty && dist != "all" {
                let pDist = place.normalizedDistrict?.lowercased() ?? ""
                let tDist = dist.lowercased()
                if pDist != tDist {
                    return false
                }
            }

            // Search query filter
            if hasQuery {
                let score = calculateRelevance(place: place, queryTokens: queryTokens, rawQuery: trimmedQuery)
                if score <= 0 {
                    return false
                }
            }

            return true
        }

        if sortByDistance, let uLat = userLat, let uLon = userLon {
            return filtered.sorted { p1, p2 in
                let d1 = p1.distanceKmFrom(userLat: uLat, userLon: uLon)
                let d2 = p2.distanceKmFrom(userLat: uLat, userLon: uLon)

                switch (d1, d2) {
                case let (dist1?, dist2?):
                    if dist1 != dist2 {
                        return dist1 < dist2
                    }
                    return p1.name.localizedCompare(p2.name) == .orderedAscending
                case (_?, nil):
                    return true
                case (nil, _?):
                    return false
                case (nil, nil):
                    return p1.name.localizedCompare(p2.name) == .orderedAscending
                }
            }
        } else if hasQuery {
            return filtered.sorted { p1, p2 in
                let s1 = calculateRelevance(place: p1, queryTokens: queryTokens, rawQuery: trimmedQuery)
                let s2 = calculateRelevance(place: p2, queryTokens: queryTokens, rawQuery: trimmedQuery)
                if s1 != s2 {
                    return s1 > s2
                }
                if p1.verifiedPhotosCount != p2.verifiedPhotosCount {
                    return p1.verifiedPhotosCount > p2.verifiedPhotosCount
                }
                return p1.name.localizedCompare(p2.name) == .orderedAscending
            }
        } else {
            // Default browse: verified photos first, then name
            return filtered.sorted { p1, p2 in
                if p1.hasVerifiedImage != p2.hasVerifiedImage {
                    return p1.hasVerifiedImage && !p2.hasVerifiedImage
                }
                return p1.name.localizedCompare(p2.name) == .orderedAscending
            }
        }
    }
}
