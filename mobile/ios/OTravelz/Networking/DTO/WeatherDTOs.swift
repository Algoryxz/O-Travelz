import Foundation

public struct CurrentWeatherDTO: Codable, Sendable {
    public let locationName: String?
    public let lat: Double?
    public let lon: Double?
    public let observedAt: String?
    public let temperatureC: Double?
    public let apparentTemperatureC: Double?
    public let condition: String?
    public let conditionCode: Int?
    public let isDay: Int?
    public let humidityPct: Int?
    public let windSpeedKmh: Double?
    public let advice: String?
    public let provider: String?
    public let status: String?

    enum CodingKeys: String, CodingKey {
        case locationName = "location_name"
        case lat
        case lon
        case observedAt = "observed_at"
        case temperatureC = "temperature_c"
        case apparentTemperatureC = "apparent_temperature_c"
        case condition
        case conditionCode = "condition_code"
        case isDay = "is_day"
        case humidityPct = "humidity_pct"
        case windSpeedKmh = "wind_speed_kmh"
        case advice
        case provider
        case status
    }
}

public struct DailyForecastDTO: Codable, Sendable {
    public let date: String
    public let temperatureMaxC: Double?
    public let temperatureMinC: Double?
    public let condition: String?
    public let conditionCode: Int?
    public let precipitationProbabilityPct: Int?

    enum CodingKeys: String, CodingKey {
        case date
        case temperatureMaxC = "temperature_max_c"
        case temperatureMinC = "temperature_min_c"
        case condition
        case conditionCode = "condition_code"
        case precipitationProbabilityPct = "precipitation_probability_pct"
    }
}

public struct WeatherResponseDTO: Codable, Sendable {
    public let locationName: String?
    public let current: CurrentWeatherDTO?
    public let forecastDaily: [DailyForecastDTO]?

    enum CodingKeys: String, CodingKey {
        case locationName = "location_name"
        case current
        case forecastDaily = "forecast_daily"
    }
}
