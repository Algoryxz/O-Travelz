import Foundation

public struct ChatMessageDTO: Codable, Sendable {
    public let role: String
    public let content: String

    public init(role: String, content: String) {
        self.role = role
        self.content = content
    }
}

public struct AIConverseRequestDTO: Codable, Sendable {
    public let messages: [ChatMessageDTO]
    public let constraints: ItineraryPlanRequestDTO?

    public init(messages: [ChatMessageDTO], constraints: ItineraryPlanRequestDTO? = nil) {
        self.messages = messages
        self.constraints = constraints
    }
}

public struct AIConverseResponseDTO: Codable, Sendable {
    public let message: String
    public let status: String?
    public let language: String?
    public let intent: String?
    public let isGrounded: Bool?
    public let constraints: ItineraryPlanRequestDTO?
    public let itinerary: ItineraryResponseDTO?
    public let warnings: [String]?

    enum CodingKeys: String, CodingKey {
        case message
        case status
        case language
        case intent
        case isGrounded = "is_grounded"
        case constraints
        case itinerary
        case warnings
    }
}
