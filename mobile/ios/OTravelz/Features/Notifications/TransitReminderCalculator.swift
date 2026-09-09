import Foundation

/// Pure deterministic calculator for transit reminder trigger timestamps on iOS.
/// Enforces Indian Standard Time (Asia/Kolkata, UTC+05:30) timezone arithmetic.
public enum TransitReminderCalculator {

    public static let istTimeZone: TimeZone = TimeZone(identifier: "Asia/Kolkata") ?? TimeZone(secondsFromGMT: 19800)!

    /// Calculates the trigger epoch millisecond timestamp for a reminder.
    /// Returns nil if the departure has already passed or if time string is malformed.
    public static func calculateTriggerEpochMs(
        departureTime: String,
        offsetMinutes: Int,
        referenceDate: Date = Date(),
        timeZone: TimeZone = istTimeZone
    ) -> Int64? {
        guard offsetMinutes >= 0 else { return nil }

        let parts = departureTime.trimmingCharacters(in: .whitespaces).split(separator: ":")
        guard parts.count == 2,
              let hour = Int(parts[0]),
              let minute = Int(parts[1]),
              hour >= 0 && hour <= 23,
              minute >= 0 && minute <= 59 else {
            return nil
        }

        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone

        var components = calendar.dateComponents([.year, .month, .day], from: referenceDate)
        components.hour = hour
        components.minute = minute
        components.second = 0

        guard let departureDate = calendar.date(from: components) else {
            return nil
        }

        let departureEpochMs = Int64(departureDate.timeIntervalSince1970 * 1000)
        let triggerEpochMs = departureEpochMs - Int64(offsetMinutes * 60 * 1000)
        let nowEpochMs = Int64(referenceDate.timeIntervalSince1970 * 1000)

        // Past departure rejection
        if triggerEpochMs <= nowEpochMs {
            return nil
        }

        return triggerEpochMs
    }

    /// Checks if a departure has already passed relative to reference date.
    public static func isDeparturePassed(
        departureTime: String,
        referenceDate: Date = Date(),
        timeZone: TimeZone = istTimeZone
    ) -> Bool {
        return calculateTriggerEpochMs(
            departureTime: departureTime,
            offsetMinutes: 0,
            referenceDate: referenceDate,
            timeZone: timeZone
        ) == nil
    }
}
