import Foundation

/// Minimal last-known observation cache store for iOS.
/// Formats relative time elapsed without arbitrary hard TTLs.
/// Cached observations are NEVER labeled as live.
public final class WeatherCacheStore: @unchecked Sendable {
    public static let shared = WeatherCacheStore()

    private let defaults: UserDefaults
    private let lock = NSLock()
    private var memoryCache: [String: CachedObservation] = [:]

    public struct CachedObservation: Codable, Sendable {
        public let locationName: String
        public let temperatureC: Double
        public let condition: String
        public let advice: String?
        public let observedAt: Date
    }

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    private func makeKey(lat: Double, lon: Double) -> String {
        let latRound = String(format: "%.2f", lat)
        let lonRound = String(format: "%.2f", lon)
        return "weather_\(latRound)_\(lonRound)"
    }

    public func saveObservation(
        lat: Double,
        lon: Double,
        locationName: String,
        temperatureC: Double,
        condition: String,
        advice: String?,
        observedAt: Date = Date()
    ) {
        let key = makeKey(lat: lat, lon: lon)
        let observation = CachedObservation(
            locationName: locationName,
            temperatureC: temperatureC,
            condition: condition,
            advice: advice,
            observedAt: observedAt
        )

        lock.lock()
        memoryCache[key] = observation
        lock.unlock()

        if let data = try? JSONEncoder().encode(observation) {
            defaults.set(data, forKey: key)
        }
    }

    public func getCachedObservation(
        lat: Double,
        lon: Double,
        now: Date = Date()
    ) -> WeatherState? {
        let key = makeKey(lat: lat, lon: lon)

        lock.lock()
        let mem = memoryCache[key]
        lock.unlock()

        if let mem = mem {
            let relative = formatRelativeTimeAgo(observedAt: mem.observedAt, now: now)
            return .cached(
                locationName: mem.locationName,
                temperatureC: mem.temperatureC,
                condition: mem.condition,
                advice: mem.advice,
                relativeTimeAgo: relative
            )
        }

        guard let data = defaults.data(forKey: key),
              let obs = try? JSONDecoder().decode(CachedObservation.self, from: data) else {
            return nil
        }

        lock.lock()
        memoryCache[key] = obs
        lock.unlock()

        let relative = formatRelativeTimeAgo(observedAt: obs.observedAt, now: now)
        return .cached(
            locationName: obs.locationName,
            temperatureC: obs.temperatureC,
            condition: obs.condition,
            advice: obs.advice,
            relativeTimeAgo: relative
        )
    }

    public func formatRelativeTimeAgo(observedAt: Date, now: Date) -> String {
        let diffSeconds = max(0, now.timeIntervalSince(observedAt))
        let diffMinutes = Int(diffSeconds / 60)
        let diffHours = diffMinutes / 60
        let diffDays = diffHours / 24

        if diffMinutes < 1 {
            return "just now"
        } else if diffMinutes < 60 {
            return "\(diffMinutes)m"
        } else if diffHours < 24 {
            return "\(diffHours)h"
        } else {
            return "\(diffDays)d"
        }
    }
}
