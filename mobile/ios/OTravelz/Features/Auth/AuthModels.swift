import Foundation

/// Authenticated traveler profile model for iOS.
/// Maps exclusively to verified backend user identity attributes.
/// Zero fabricated fields.
public struct UserProfile: Identifiable, Codable, Sendable, Equatable {
    public let id: String
    public let email: String
    public let name: String
    public let displayName: String
    public let avatarUrl: String?
    public let provider: String

    public init(
        id: String,
        email: String,
        name: String,
        displayName: String,
        avatarUrl: String? = nil,
        provider: String = "google"
    ) {
        self.id = id
        self.email = email
        self.name = name
        self.displayName = displayName
        self.avatarUrl = avatarUrl
        self.provider = provider
    }
}

/// Explicit finite state model for iOS authentication.
/// Guarantees that local functionality remains fully accessible when signed out.
public enum AuthState: Equatable, Sendable {
    case signedOut
    case authenticating
    case signedIn(UserProfile)
    case error(String)
    case expired
}

// =============================================================================
// Wire DTOs for Auth Network Contracts
// =============================================================================

public struct UserProfileDTO: Codable, Sendable {
    public let id: String
    public let email: String
    public let name: String
    public let displayName: String?
    public let avatarUrl: String?
    public let provider: String

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case name
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case provider
    }

    public func toDomain() -> UserProfile {
        UserProfile(
            id: id,
            email: email,
            name: name,
            displayName: displayName ?? name,
            avatarUrl: avatarUrl,
            provider: provider
        )
    }
}

public struct AuthTicketExchangeRequestDTO: Codable, Sendable {
    public let ticket: String

    public init(ticket: String) {
        self.ticket = ticket
    }
}

public struct AuthExchangeResponseDTO: Codable, Sendable {
    public let authenticated: Bool
    public let user: UserProfileDTO?
    public let sessionToken: String?
    public let exchangeTicket: String?

    enum CodingKeys: String, CodingKey {
        case authenticated
        case user
        case sessionToken = "session_token"
        case exchangeTicket = "exchange_ticket"
    }
}

public struct AuthMeResponseDTO: Codable, Sendable {
    public let authenticated: Bool
    public let user: UserProfileDTO?
}

public struct AuthLogoutResponseDTO: Codable, Sendable {
    public let authenticated: Bool
    public let message: String?
}
