import Foundation

public struct PlaceImageDTO: Codable, Sendable {
    public let url: String
    public let thumbnailUrl: String?
    public let cardUrl: String?
    public let altText: String?
    public let title: String?
    public let sourceName: String?
    public let license: String?
    public let attribution: String?
    public let status: String?
    public let isPrimary: Bool?

    enum CodingKeys: String, CodingKey {
        case url
        case thumbnailUrl = "thumbnail_url"
        case cardUrl = "card_url"
        case altText = "alt_text"
        case title
        case sourceName = "source_name"
        case license
        case attribution
        case status
        case isPrimary = "is_primary"
    }
}

public struct LocalizedNamesDTO: Codable, Sendable {
    public let en: String?
    public let `or`: String?
    public let hi: String?
}

public struct PlaceDTO: Codable, Sendable {
    public let id: String
    public let researchId: String?
    public let name: String
    public let category: String
    public let description: String?
    public let lat: Double?
    public let lon: Double?
    public let district: String?
    public let region: String?
    public let avgVisitMinutes: Int?
    public let priceTier: String?
    public let rating: Double?
    public let ratingCount: Int?
    public let interests: [String]?
    public let source: String?
    public let sourceUrl: String?
    public let verificationStatus: String?
    public let contactPhone: String?
    public let emergencyPhone: String?
    public let address: String?
    public let images: [PlaceImageDTO]?
    public let localizedNames: LocalizedNamesDTO?

    enum CodingKeys: String, CodingKey {
        case id
        case researchId = "research_id"
        case name
        case category
        case description
        case lat
        case lon
        case district
        case region
        case avgVisitMinutes = "avg_visit_minutes"
        case priceTier = "price_tier"
        case rating
        case ratingCount = "rating_count"
        case interests
        case source
        case sourceUrl = "source_url"
        case verificationStatus = "verification_status"
        case contactPhone = "contact_phone"
        case emergencyPhone = "emergency_phone"
        case address
        case images
        case localizedNames = "localized_names"
    }
}
