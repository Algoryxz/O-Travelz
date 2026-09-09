import Foundation

/// Domain representation of live weather conditions.
public enum WeatherState: Equatable, Sendable {
    case available(locationName: String, temperatureC: Double, condition: String, advice: String?)
    case cached(locationName: String, temperatureC: Double, condition: String, advice: String?, relativeTimeAgo: String)
    case unavailable(reason: String)
}

public extension WeatherResponseDTO {
    func toDomain() -> WeatherState {
        guard let current = current,
              let temp = current.temperatureC,
              let cond = current.condition else {
            return .unavailable(reason: "Sensor readings currently unavailable")
        }
        return .available(
            locationName: current.locationName ?? locationName ?? "Odisha",
            temperatureC: temp,
            condition: cond,
            advice: current.advice
        )
    }
}

/// Truth boundary representation of a transit stop location.
public enum TransitStopTruth: Equatable, Sendable {
    case exact(stopId: String, name: String, latitude: Double, longitude: Double, distanceM: Double?)
    case localityOnly(stopId: String, name: String, locality: String, city: String)
}

public extension StopNearbyDTO {
    func toDomain() -> TransitStopTruth {
        let isCandidate = coordinateStatus?.lowercased() == "candidate"
        if !isCandidate, let lat = latitude, let lon = longitude {
            return .exact(
                stopId: stopId,
                name: name,
                latitude: lat,
                longitude: lon,
                distanceM: distanceM
            )
        } else {
            return .localityOnly(
                stopId: stopId,
                name: name,
                locality: locality ?? "Unknown",
                city: city ?? "Odisha"
            )
        }
    }
}
