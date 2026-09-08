import Foundation

/// Central networking configuration for O-TRAVELZ iOS V4.
public struct APIConfiguration: Sendable {
    public let baseURL: URL
    public let connectTimeout: TimeInterval
    public let readTimeout: TimeInterval

    public static let `default` = APIConfiguration(
        baseURL: URL(string: "https://otravelz-backend.onrender.com")!,
        connectTimeout: 10.0,
        readTimeout: 15.0
    )

    public static let aiTimeout: TimeInterval = 30.0
    public static let itineraryTimeout: TimeInterval = 25.0
    public static let fastTimeout: TimeInterval = 5.0
}
