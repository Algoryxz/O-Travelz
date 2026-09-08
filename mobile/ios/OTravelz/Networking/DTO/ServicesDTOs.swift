import Foundation

public struct ServiceItemDTO: Codable, Sendable {
    public let id: String
    public let name: String
    public let category: String
    public let lat: Double?
    public let lon: Double?
    public let distanceKm: Double?
    public let address: String?
    public let phone: String?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case category
        case lat
        case lon
        case distanceKm = "distance_km"
        case address
        case phone
    }
}

public struct NearbyServicesResponseDTO: Codable, Sendable {
    public let queryLat: Double
    public let queryLon: Double
    public let category: String?
    public let requestedRadiusKm: Double
    public let activeRadiusKm: Double
    public let isExpanded: Bool?
    public let count: Int
    public let distanceSemantics: String?
    public let services: [ServiceItemDTO]

    enum CodingKeys: String, CodingKey {
        case queryLat = "query_lat"
        case queryLon = "query_lon"
        case category
        case requestedRadiusKm = "requested_radius_km"
        case activeRadiusKm = "active_radius_km"
        case isExpanded = "is_expanded"
        case count
        case distanceSemantics = "distance_semantics"
        case services
    }
}
