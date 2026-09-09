import Foundation

/// Request model for scheduling a local transit departure reminder.
public struct TransitReminderRequest: Sendable, Equatable {
    public let routeId: String
    public let routeNumber: String
    public let origin: String
    public let departureTime: String // HH:mm in IST
    public let offsetMinutes: Int

    public init(
        routeId: String,
        routeNumber: String,
        origin: String,
        departureTime: String,
        offsetMinutes: Int = 15
    ) {
        self.routeId = routeId
        self.routeNumber = routeNumber
        self.origin = origin
        self.departureTime = departureTime
        self.offsetMinutes = offsetMinutes
    }

    public var notificationId: String {
        let cleanTime = departureTime.replacingOccurrences(of: ":", with: "")
        return "rem_tr_\(routeId)_\(cleanTime)_\(offsetMinutes)m"
    }

    public var title: String {
        return "Route \(routeNumber) — Scheduled departure in \(offsetMinutes) min"
    }

    public var body: String {
        return "\(departureTime) IST from \(origin). Scheduled timetable only; check operator before travel."
    }

    public var deepLinkUri: String {
        return "otravelz://route/\(routeId)"
    }
}

/// Result of a reminder scheduling attempt.
public enum ReminderScheduleResult: Sendable, Equatable {
    case success(notificationId: String, scheduledEpochMs: Int64, message: String)
    case passedDeparture
    case permissionDenied
    case error(String)
}

/// Active reminder metadata for in-memory / UI tracking.
public struct ActiveReminderInfo: Sendable, Codable, Equatable {
    public let id: String
    public let routeId: String
    public let departureTime: String
    public let offsetMinutes: Int
    public let scheduledAtEpochMs: Int64

    public init(
        id: String,
        routeId: String,
        departureTime: String,
        offsetMinutes: Int,
        scheduledAtEpochMs: Int64
    ) {
        self.id = id
        self.routeId = routeId
        self.departureTime = departureTime
        self.offsetMinutes = offsetMinutes
        self.scheduledAtEpochMs = scheduledAtEpochMs
    }
}
