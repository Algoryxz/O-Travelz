import Foundation
import XCTest
@testable import OTravelz

final class NetworkDTOTests: XCTestCase {

    func testDecodeHealthResponse() throws {
        let json = """
        {
            "status": "ok",
            "version": "4.0.0",
            "git_sha": "4affea9fba7ac49acbad6eacd0d017c68818385d",
            "alembic_version": "0020_transit_ride_observations",
            "database": "connected"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(HealthResponseDTO.self, from: json)
        XCTAssertEqual(dto.status, "ok")
        XCTAssertEqual(dto.version, "4.0.0")
        XCTAssertEqual(dto.database, "connected")
        XCTAssertEqual(dto.gitSha, "4affea9fba7ac49acbad6eacd0d017c68818385d")
    }

    func testWeatherTruthAdapterPreservesAbsence() throws {
        let json = """
        {
            "location_name": "Bhubaneswar",
            "current": {
                "location_name": "Bhubaneswar",
                "temperature_c": null,
                "condition": null
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(WeatherResponseDTO.self, from: json)
        XCTAssertNil(dto.current?.temperatureC)

        let domain = dto.toDomain()
        switch domain {
        case .unavailable:
            // Success: null temperature must never evaluate to 0.0°C
            break
        case .available:
            XCTFail("Missing temperature must not evaluate to available")
        }
    }

    func testWeatherTruthAdapterAvailable() throws {
        let json = """
        {
            "location_name": "Bhubaneswar",
            "current": {
                "location_name": "Bhubaneswar",
                "temperature_c": 31.4,
                "condition": "Mainly clear",
                "advice": "Pleasant"
            }
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(WeatherResponseDTO.self, from: json)
        let domain = dto.toDomain()
        switch domain {
        case .available(let location, let temp, let cond, _):
            XCTAssertEqual(location, "Bhubaneswar")
            XCTAssertEqual(temp, 31.4, accuracy: 0.01)
            XCTAssertEqual(cond, "Mainly clear")
        case .unavailable:
            XCTFail("Valid weather readings must evaluate to available")
        }
    }

    func testTransitCandidateStopMapsToLocalityOnly() throws {
        let json = """
        {
            "stop_id": "cand-001",
            "name": "Candidate Stop Y",
            "locality": "Saheed Nagar",
            "city": "Bhubaneswar",
            "latitude": 20.29,
            "longitude": 85.84,
            "coordinate_status": "candidate"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(StopNearbyDTO.self, from: json)
        let domain = dto.toDomain()

        switch domain {
        case .localityOnly(let stopId, _, let locality, _):
            XCTAssertEqual(stopId, "cand-001")
            XCTAssertEqual(locality, "Saheed Nagar")
        case .exact:
            XCTFail("Candidate stop must never map to exact coordinates")
        }
    }

    func testPlacesListDecoding() throws {
        let json = """
        [
            {
                "id": "konark-sun-temple",
                "name": "Konark Sun Temple",
                "category": "heritage",
                "lat": 19.8876,
                "lon": 86.0945,
                "district": "Puri"
            }
        ]
        """.data(using: .utf8)!

        let list = try JSONDecoder().decode([PlaceDTO].self, from: json)
        XCTAssertEqual(list.count, 1)
        XCTAssertEqual(list[0].id, "konark-sun-temple")
        XCTAssertEqual(list[0].lat!, 19.8876, accuracy: 0.001)
    }
}
