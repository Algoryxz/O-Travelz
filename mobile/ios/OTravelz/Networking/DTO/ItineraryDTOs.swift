import Foundation

public struct ItineraryPlanRequestDTO: Codable, Sendable {
    public let days: Int
    public let interests: [String]?
    public let pace: String?
    public let start: String?

    public init(days: Int, interests: [String]? = nil, pace: String? = nil, start: String? = nil) {
        self.days = days
        self.interests = interests
        self.pace = pace
        self.start = start
    }
}

public struct PlaceSummaryDTO: Codable, Sendable {
    public let id: String
    public let name: String
    public let category: String
}

public struct TransportHopDTO: Codable, Sendable {
    public let fromStopId: String?
    public let toStopId: String?
    public let mode: String?
    public let routeNumber: String?
    public let durationMinutes: Int?

    enum CodingKeys: String, CodingKey {
        case fromStopId = "from_stop_id"
        case toStopId = "to_stop_id"
        case mode
        case routeNumber = "route_number"
        case durationMinutes = "duration_minutes"
    }
}

public struct ItineraryStopDTO: Codable, Sendable {
    public let sequence: Int
    public let place: PlaceSummaryDTO
    public let plannedArrival: String?
    public let plannedDeparture: String?

    enum CodingKeys: String, CodingKey {
        case sequence
        case place
        case plannedArrival = "planned_arrival"
        case plannedDeparture = "planned_departure"
    }
}

public struct ItineraryDayDTO: Codable, Sendable {
    public let dayNumber: Int
    public let stops: [ItineraryStopDTO]
    public let hops: [TransportHopDTO]

    enum CodingKeys: String, CodingKey {
        case dayNumber = "day_number"
        case stops
        case hops
    }
}

public struct ItineraryResponseDTO: Codable, Sendable {
    public let itineraryId: String
    public let days: [ItineraryDayDTO]
    public let explanation: String

    enum CodingKeys: String, CodingKey {
        case itineraryId = "itinerary_id"
        case days
        case explanation
    }
}
