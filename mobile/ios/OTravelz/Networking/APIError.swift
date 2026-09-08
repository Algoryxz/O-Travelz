import Foundation

/// Normalized client error model for iOS networking.
public enum APIError: LocalizedError, Sendable, Equatable {
    case networkUnavailable
    case timeout
    case httpClientError(statusCode: Int, message: String)
    case httpServerError(statusCode: Int, message: String)
    case validationError(message: String)
    case decodingError(message: String)
    case incompatibleResponse(message: String)
    case cancelled

    public var errorDescription: String? {
        switch self {
        case .networkUnavailable:
            return "No network connection or host unreachable."
        case .timeout:
            return "Network request timed out."
        case .httpClientError(let code, let msg):
            return "Client error (\(code)): \(msg)"
        case .httpServerError(let code, let msg):
            return "Server error (\(code)): \(msg)"
        case .validationError(let msg):
            return "Validation error: \(msg)"
        case .decodingError(let msg):
            return "Decoding error: \(msg)"
        case .incompatibleResponse(let msg):
            return "Incompatible response: \(msg)"
        case .cancelled:
            return "Network operation was cancelled."
        }
    }
}
