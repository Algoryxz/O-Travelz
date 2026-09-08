import Foundation

/// Standard travel themes recognized by catalog ranking and planner.
public enum PlanInterest: String, CaseIterable, Identifiable, Sendable {
    case heritage
    case temple
    case nature
    case beach
    case culture
    case crafts
    case food

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .heritage: return "Heritage"
        case .temple: return "Temples"
        case .nature: return "Nature"
        case .beach: return "Beaches"
        case .culture: return "Culture"
        case .crafts: return "Handicrafts"
        case .food: return "Culinary"
        }
    }
}

/// Pace of daily itinerary stops.
public enum PlanPace: String, CaseIterable, Identifiable, Sendable {
    case relaxed
    case moderate
    case fast

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .relaxed: return "Relaxed"
        case .moderate: return "Moderate"
        case .fast: return "Fast"
        }
    }
}

/// Verified hubs available for origin resolution.
public enum PlannerHubs {
    public static let popularHubs = [
        "Bhubaneswar",
        "Puri",
        "Cuttack",
        "Rourkela",
        "Sambalpur",
        "Berhampur",
        "Konark"
    ]
}

/// Typed, constraint-aware user planning configuration.
public struct PlanConstraints: Sendable, Equatable {
    public var days: Int
    public var interests: Set<String>
    public var pace: PlanPace
    public var startHub: String?
    public var lowWalking: Bool
    public var publicTransportPreferred: Bool
    public var budgetTransportPerDay: Double?
    public var budgetConscious: Bool

    public init(
        days: Int = 1,
        interests: Set<String> = ["heritage", "temple"],
        pace: PlanPace = .moderate,
        startHub: String? = "Bhubaneswar",
        lowWalking: Bool = false,
        publicTransportPreferred: Bool = false,
        budgetTransportPerDay: Double? = nil,
        budgetConscious: Bool = false
    ) {
        self.days = min(max(days, 1), 7)
        self.interests = interests
        self.pace = pace
        self.startHub = startHub
        self.lowWalking = lowWalking
        self.publicTransportPreferred = publicTransportPreferred
        self.budgetTransportPerDay = budgetTransportPerDay
        self.budgetConscious = budgetConscious
    }

    public func toRequestDTO() -> ItineraryPlanRequestDTO {
        ItineraryPlanRequestDTO(
            days: min(max(days, 1), 7),
            interests: Array(interests),
            pace: pace.rawValue,
            start: startHub?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false ? startHub : nil,
            budgetTransportPerDay: budgetTransportPerDay,
            lowWalking: lowWalking ? true : nil,
            vegetarian: nil,
            avoidCrowds: nil,
            publicTransportPreferred: publicTransportPreferred ? true : nil,
            budgetConscious: budgetConscious ? true : nil
        )
    }

    public static func fromRequestDTO(_ dto: ItineraryPlanRequestDTO) -> PlanConstraints {
        let p: PlanPace = {
            switch dto.pace?.lowercased() {
            case "relaxed": return .relaxed
            case "fast": return .fast
            default: return .moderate
            }
        }()

        return PlanConstraints(
            days: min(max(dto.days, 1), 7),
            interests: Set(dto.interests ?? ["heritage", "temple"]),
            pace: p,
            startHub: dto.start,
            lowWalking: dto.lowWalking == true,
            publicTransportPreferred: dto.publicTransportPreferred == true,
            budgetTransportPerDay: dto.budgetTransportPerDay,
            budgetConscious: dto.budgetConscious == true
        )
    }
}

/// Confirmed itinerary destination visit with planned arrival/departure times.
public struct PlanStop: Identifiable, Sendable {
    public var id: String { "\(sequence)_\(placeId)" }
    public let sequence: Int
    public let placeId: String
    public let placeName: String
    public let category: String
    public let plannedArrival: String?
    public let plannedDeparture: String?

    public var timeWindowDisplay: String? {
        if let arr = plannedArrival, let dep = plannedDeparture {
            return "\(arr) – \(dep)"
        }
        return plannedArrival ?? plannedDeparture
    }
}

/// Grounded journey leg connecting stops.
public struct JourneyLeg: Identifiable, Sendable {
    public var id: String { "\(fromSequence)_\(toSequence)_\(mode)" }
    public let fromSequence: Int
    public let toSequence: Int
    public let mode: String
    public let estimatedMinutes: Int?
    public let estimatedCost: Double?
    public let legDetail: String?
    public let dataTier: String?
    public let reason: String?

    public var isUnavailable: Bool {
        mode.caseInsensitiveCompare("unavailable") == .orderedSame || reason != nil
    }

    public var displayModeTitle: String {
        if isUnavailable { return "Transport unavailable" }
        let mins = estimatedMinutes.map { "\($0) min " } ?? ""
        switch mode.lowercased() {
        case "walk":
            return "\(mins)walk".trimmingCharacters(in: .whitespaces)
        case "bus", "transit":
            return "Scheduled Transit \(mins.isEmpty ? "" : "(\(mins.trimmingCharacters(in: .whitespaces)))")"
        default:
            return "\(mode.capitalized) \(mins)".trimmingCharacters(in: .whitespaces)
        }
    }
}

/// Itinerary partition grouping stops and hops for one calendar day.
public struct PlanDay: Identifiable, Sendable {
    public var id: Int { dayNumber }
    public let dayNumber: Int
    public let date: String?
    public let stops: [PlanStop]
    public let hops: [JourneyLeg]
}

/// Validated, immutable plan result.
public struct PlanResult: Sendable {
    public let itineraryId: String
    public let constraints: PlanConstraints
    public let days: [PlanDay]
    public let explanation: String
    public let aiCompanionMessage: String?
    public let isAIGrounded: Bool
    public let warnings: [String]

    public var totalStopsCount: Int {
        days.reduce(0) { $0 + $1.stops.count }
    }

    public static func fromDTO(
        _ dto: ItineraryResponseDTO,
        originalConstraints: PlanConstraints,
        aiMessage: String? = nil,
        isGrounded: Bool = true,
        warnings: [String] = []
    ) -> PlanResult {
        let mappedDays = dto.days.map { dayDto -> PlanDay in
            let stops = dayDto.stops.map { stopDto in
                PlanStop(
                    sequence: stopDto.sequence,
                    placeId: stopDto.place.id,
                    placeName: stopDto.place.name,
                    category: stopDto.place.category,
                    plannedArrival: stopDto.plannedArrival,
                    plannedDeparture: stopDto.plannedDeparture
                )
            }

            let hops = dayDto.hops.map { hopDto in
                let detail = hopDto.legs?.first?.detail
                    ?? hopDto.legs?.first?.mode
                    ?? hopDto.routeNumber.map { "Route \($0)" }

                return JourneyLeg(
                    fromSequence: hopDto.fromSequence ?? 0,
                    toSequence: hopDto.toSequence ?? 1,
                    mode: hopDto.mode ?? "walk",
                    estimatedMinutes: hopDto.estimatedMinutes ?? hopDto.durationMinutes,
                    estimatedCost: nil, // Fares strictly null
                    legDetail: detail,
                    dataTier: hopDto.dataTier ?? "scheduled",
                    reason: hopDto.reason
                )
            }

            return PlanDay(
                dayNumber: dayDto.dayNumber,
                date: nil,
                stops: stops,
                hops: hops
            )
        }

        return PlanResult(
            itineraryId: dto.itineraryId,
            constraints: originalConstraints,
            days: mappedDays,
            explanation: dto.explanation,
            aiCompanionMessage: aiMessage,
            isAIGrounded: isGrounded,
            warnings: warnings
        )
    }
}
