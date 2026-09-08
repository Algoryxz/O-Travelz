import Foundation

public struct TransitRouteDTO: Codable, Sendable {
    public let id: String
    public let routeNumber: String?
    public let name: String?
    public let operatorName: String?
    public let origin: String?
    public let destination: String?
    public let via: [String]?
    public let stopsCount: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case routeNumber = "route_number"
        case name
        case operatorName = "operator"
        case origin
        case destination
        case via
        case stopsCount = "stops_count"
    }
}

public struct RouteListDTO: Codable, Sendable {
    public let total: Int
    public let limit: Int
    public let offset: Int
    public let routes: [TransitRouteDTO]
}

public struct RouteGeometryDTO: Codable, Sendable {
    public let routeId: String
    public let coordinates: [[Double]]

    enum CodingKeys: String, CodingKey {
        case routeId = "route_id"
        case coordinates
    }
}

public struct StopNearbyDTO: Codable, Sendable {
    public let stopId: String
    public let name: String
    public let publishedName: String?
    public let canonicalStopId: String?
    public let city: String?
    public let district: String?
    public let locality: String?
    public let latitude: Double?
    public let longitude: Double?
    public let coordinateStatus: String?
    public let distanceM: Double?
    public let walkingEstimateMins: Int?
    public let routesServingStop: [String]?

    enum CodingKeys: String, CodingKey {
        case stopId = "stop_id"
        case name
        case publishedName = "published_name"
        case canonicalStopId = "canonical_stop_id"
        case city
        case district
        case locality
        case latitude
        case longitude
        case coordinateStatus = "coordinate_status"
        case distanceM = "distance_m"
        case walkingEstimateMins = "walking_estimate_mins"
        case routesServingStop = "routes_serving_stop"
    }
}
