import Foundation

public struct HealthResponseDTO: Codable, Sendable {
    public let status: String
    public let version: String
    public let gitSha: String?
    public let alembicVersion: String?
    public let database: String?

    enum CodingKeys: String, CodingKey {
        case status
        case version
        case gitSha = "git_sha"
        case alembicVersion = "alembic_version"
        case database
    }
}

public struct ReadyResponseDTO: Codable, Sendable {
    public let status: String
    public let database: String?
}

public struct APIErrorDetailDTO: Codable, Sendable {
    public let code: String
    public let message: String
    public let field: String?
}

public struct APIErrorResponseDTO: Codable, Sendable {
    public let error: APIErrorDetailDTO
}
