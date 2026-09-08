import Foundation

public struct ItineraryPlanRequestDTO: Codable, Sendable {
    public let days: Int
    public let interests: [String]?
    public let pace: String?
    public let start: String?
    public let budgetTransportPerDay: Double?
    public let lowWalking: Bool?
    public let vegetarian: Bool?
    public let avoidCrowds: Bool?
    public let publicTransportPreferred: Bool?
    public let budgetConscious: Bool?

    enum CodingKeys: String, CodingKey {
        case days
        case interests
        case pace
        case start
        case budgetTransportPerDay = "budget_transport_per_day"
        case lowWalking = "low_walking"
        case vegetarian
        case avoidCrowds = "avoid_crowds"
        case publicTransportPreferred = "public_transport_preferred"
        case budgetConscious = "budget_conscious"
    }

    public init(
        days: Int,
        interests: [String]? = nil,
        pace: String? = nil,
        start: String? = nil,
        budgetTransportPerDay: Double? = nil,
        lowWalking: Bool? = nil,
        vegetarian: Bool? = nil,
        avoidCrowds: Bool? = nil,
        publicTransportPreferred: Bool? = nil,
        budgetConscious: Bool? = nil
    ) {
        self.days = days
        self.interests = interests
        self.pace = pace
        self.start = start
        self.budgetTransportPerDay = budgetTransportPerDay
        self.lowWalking = lowWalking
        self.vegetarian = vegetarian
        self.avoidCrowds = avoidCrowds
        self.publicTransportPreferred = publicTransportPreferred
        self.budgetConscious = budgetConscious
    }
}

public struct PlaceSummaryDTO: Codable, Sendable {
    public let id: String
    public let name: String
    public let category: String
}

public struct TransportLegDTO: Codable, Sendable {
    public let mode: String?
    public let detail: String?
    public let provider: String?
    public let route: String?
}

public struct TransportHopDTO: Codable, Sendable {
    public let fromSequence: Int?
    public let toSequence: Int?
    public let mode: String?
    public let estimatedMinutes: Int?
    public let estimatedCost: Double?
    public let legs: [TransportLegDTO]?
    public let dataTier: String?
    public let reason: String?
    // Legacy / fallback
    public let fromStopId: String?
    public let toStopId: String?
    public let routeNumber: String?
    public let durationMinutes: Int?

    enum CodingKeys: String, CodingKey {
        case fromSequence = "from_sequence"
        case toSequence = "to_sequence"
        case mode
        case estimatedMinutes = "estimated_minutes"
        case estimatedCost = "estimated_cost"
        case legs
        case dataTier = "data_tier"
        case reason
        case fromStopId = "from_stop_id"
        case toStopId = "to_stop_id"
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
