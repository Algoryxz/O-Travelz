import Foundation

/// Primary typed networking client for O-TRAVELZ iOS V4.
public actor APIClient {
    public let configuration: APIConfiguration
    private let session: URLSession
    private let decoder: JSONDecoder

    public init(configuration: APIConfiguration = .default, session: URLSession = .shared) {
        self.configuration = configuration
        self.session = session
        self.decoder = JSONDecoder()
    }

    // MARK: - Core Request Dispatcher

    public func execute<T: Decodable>(_ request: URLRequest) async throws -> T {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let urlError as URLError {
            switch urlError.code {
            case .timedOut:
                throw APIError.timeout
            case .notConnectedToInternet, .cannotFindHost, .cannotConnectToHost:
                throw APIError.networkUnavailable
            case .cancelled:
                throw APIError.cancelled
            default:
                throw APIError.incompatibleResponse(urlError.localizedDescription)
            }
        } catch {
            throw APIError.incompatibleResponse(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.incompatibleResponse("Non-HTTP response received")
        }

        let statusCode = httpResponse.statusCode
        switch statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                let text = String(data: data, encoding: .utf8) ?? ""
                throw APIError.decodingError("Decoding failed for \(T.self): \(error.localizedDescription). Payload: \(text.prefix(200))")
            }
        case 422:
            let msg = String(data: data, encoding: .utf8) ?? "Validation failed"
            throw APIError.validationError(message: msg)
        case 400...499:
            let msg = String(data: data, encoding: .utf8) ?? "Client error"
            throw APIError.httpClientError(statusCode: statusCode, message: msg)
        case 500...599:
            let msg = String(data: data, encoding: .utf8) ?? "Server error"
            throw APIError.httpServerError(statusCode: statusCode, message: msg)
        default:
            throw APIError.incompatibleResponse("Unhandled HTTP \(statusCode)")
        }
    }

    // MARK: - Endpoint Implementations

    public func getHealth() async throws -> HealthResponseDTO {
        let url = configuration.baseURL.appendingPathComponent("health")
        var req = URLRequest(url: url)
        req.timeoutInterval = APIConfiguration.fastTimeout
        return try await execute(req)
    }

    public func getReady() async throws -> ReadyResponseDTO {
        let url = configuration.baseURL.appendingPathComponent("ready")
        var req = URLRequest(url: url)
        req.timeoutInterval = APIConfiguration.fastTimeout
        return try await execute(req)
    }

    public func getPlaces(limit: Int? = nil, district: String? = nil, category: String? = nil) async throws -> [PlaceDTO] {
        var components = URLComponents(url: configuration.baseURL.appendingPathComponent("places"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = []
        if let limit = limit { items.append(URLQueryItem(name: "limit", value: String(limit))) }
        if let district = district { items.append(URLQueryItem(name: "district", value: district)) }
        if let category = category { items.append(URLQueryItem(name: "category", value: category)) }
        if !items.isEmpty { components.queryItems = items }

        var req = URLRequest(url: components.url!)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getPlaceDetail(id: String) async throws -> PlaceDTO {
        let url = configuration.baseURL.appendingPathComponent("places").appendingPathComponent(id)
        var req = URLRequest(url: url)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getWeatherCurrent(lat: Double, lon: Double) async throws -> WeatherResponseDTO {
        var components = URLComponents(url: configuration.baseURL.appendingPathComponent("weather/current"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "lat", value: String(lat)),
            URLQueryItem(name: "lon", value: String(lon))
        ]
        var req = URLRequest(url: components.url!)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getTransportRoutes() async throws -> RouteListDTO {
        let url = configuration.baseURL.appendingPathComponent("api/transport/routes")
        var req = URLRequest(url: url)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getRouteGeometry(routeId: String) async throws -> RouteGeometryDTO {
        let url = configuration.baseURL.appendingPathComponent("api/transport/routes").appendingPathComponent(routeId).appendingPathComponent("geometry")
        var req = URLRequest(url: url)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getNearbyStops(lat: Double, lon: Double, radiusMeters: Int? = nil) async throws -> [StopNearbyDTO] {
        var components = URLComponents(url: configuration.baseURL.appendingPathComponent("transport/stops/nearby"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = [
            URLQueryItem(name: "lat", value: String(lat)),
            URLQueryItem(name: "lon", value: String(lon))
        ]
        if let r = radiusMeters { items.append(URLQueryItem(name: "radius_m", value: String(r))) }
        components.queryItems = items

        var req = URLRequest(url: components.url!)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func getNearbyServices(lat: Double, lon: Double, category: String? = nil, radiusKm: Double? = nil) async throws -> NearbyServicesResponseDTO {
        var components = URLComponents(url: configuration.baseURL.appendingPathComponent("api/v1/services/nearby"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = [
            URLQueryItem(name: "lat", value: String(lat)),
            URLQueryItem(name: "lon", value: String(lon))
        ]
        if let c = category { items.append(URLQueryItem(name: "category", value: c)) }
        if let r = radiusKm { items.append(URLQueryItem(name: "radius_km", value: String(r))) }
        components.queryItems = items

        var req = URLRequest(url: components.url!)
        req.timeoutInterval = configuration.readTimeout
        return try await execute(req)
    }

    public func converseWithAI(request: AIConverseRequestDTO) async throws -> AIConverseResponseDTO {
        let url = configuration.baseURL.appendingPathComponent("ai/converse")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(request)
        req.timeoutInterval = APIConfiguration.aiTimeout
        return try await execute(req)
    }

    public func planItinerary(request: ItineraryPlanRequestDTO) async throws -> ItineraryResponseDTO {
        let url = configuration.baseURL.appendingPathComponent("itinerary/plan")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(request)
        req.timeoutInterval = APIConfiguration.itineraryTimeout
        return try await execute(req)
    }
}
