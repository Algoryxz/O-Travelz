import Foundation
import CoreLocation

/// Validated geographic coordinate strictly checked against Odisha bounds.
public struct GeoCoordinate: Equatable, Hashable, Sendable {
    public let latitude: Double
    public let longitude: Double

    public static let odishaLatMin = 17.78
    public static let odishaLatMax = 22.57
    public static let odishaLonMin = 81.39
    public static let odishaLonMax = 87.53

    public static let odishaCenter = GeoCoordinate(latitude: 20.27, longitude: 84.85)

    public init?(latitude: Double, longitude: Double) {
        guard Self.isValid(latitude: latitude, longitude: longitude) else { return nil }
        self.latitude = latitude
        self.longitude = longitude
    }

    public static func isValid(latitude: Double?, longitude: Double?) -> BooleanLiteralType {
        guard let lat = latitude, let lon = longitude else { return false }
        guard !lat.isNaN && !lon.isNaN && !lat.isInfinite && !lon.isInfinite else { return false }
        guard abs(lat) > 1e-5 || abs(lon) > 1e-5 else { return false }
        return lat >= odishaLatMin && lat <= odishaLatMax && lon >= odishaLonMin && lon <= odishaLonMax
    }

    public var clCoordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    public func distanceKm(to other: GeoCoordinate) -> Double {
        let r = 6371.0
        let dLat = (other.latitude - latitude) * .pi / 180.0
        let dLon = (other.longitude - longitude) * .pi / 180.0
        let lat1 = latitude * .pi / 180.0
        let lat2 = other.latitude * .pi / 180.0
        let a = sin(dLat / 2) * sin(dLat / 2) + cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
        let c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }
}

/// Transit stop verification tiers.
public enum StopVerificationTier: String, Sendable, CaseIterable {
    case verifiedOfficial = "VERIFIED_OFFICIAL"
    case verifiedGeospatial = "VERIFIED_GEOSPATIAL"
    case candidateHigh = "CANDIDATE_HIGH"
    case candidateMedium = "CANDIDATE_MEDIUM"
    case localityOnly = "LOCALITY_ONLY"
    case unresolved = "UNRESOLVED"

    public var isVerifiedPhysicalPole: Bool {
        self == .verifiedOfficial || self == .verifiedGeospatial
    }

    public var isCandidate: Bool {
        self == .candidateHigh || self == .candidateMedium
    }

    public var allowsFirstMileWalk: Bool {
        isVerifiedPhysicalPole
    }

    public var allowsExternalNavigation: Bool {
        isVerifiedPhysicalPole
    }
}

/// Transit stop marker model.
public struct TransitStopMarker: Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let publishedName: String?
    public let coordinate: GeoCoordinate?
    public let tier: StopVerificationTier
    public let city: String?
    public let district: String?
    public let routesServing: [String]

    public var canRenderMarker: Bool {
        coordinate != null && tier.isVerifiedPhysicalPole
    }

    public var canRenderCandidateMarker: Bool {
        coordinate != null && tier.isCandidate
    }
}

/// Route geometry confidence tiers.
public enum RouteGeometryConfidence: String, Sendable {
    case verifiedRouteGeometry = "VERIFIED_ROUTE_GEOMETRY"
    case highConfidenceRouteGeometry = "HIGH_CONFIDENCE_ROUTE_GEOMETRY"
    case mediumConfidenceRouteGeometry = "MEDIUM_CONFIDENCE_ROUTE_GEOMETRY"
    case geometryUnavailable = "GEOMETRY_UNAVAILABLE"

    public var isRenderable: Bool {
        self != .geometryUnavailable
    }
}

/// Transit route geometry model.
public struct TransitRouteGeometry: Identifiable, Equatable, Sendable {
    public let id: String
    public let routeNumber: String
    public let routeName: String
    public let confidence: RouteGeometryConfidence
    public let coordinates: [GeoCoordinate]

    public var isRenderable: Bool {
        confidence.isRenderable && coordinates.count >= 2
    }
}

/// Civic essentials categories.
public enum CivicServiceCategory: String, Sendable, CaseIterable {
    case healthcare
    case police
    case fuel
    case atm
    case hotel
    case restaurant
    case transitHub = "transit"
    case other

    public static func from(raw: String?) -> CivicServiceCategory {
        guard let r = raw?.lowercased().trimmingCharacters(in: .whitespaces) else { return .other }
        switch r {
        case "healthcare", "hospital": return .healthcare
        case "police": return .police
        case "fuel", "petrol": return .fuel
        case "atm", "bank": return .atm
        case "hotel", "accommodation": return .hotel
        case "restaurant", "dining": return .restaurant
        case "transit", "transit_hub": return .transitHub
        default: return .other
        }
    }
}

/// Civic service marker model.
public struct CivicServiceMarker: Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let category: CivicServiceCategory
    public let coordinate: GeoCoordinate
    public let address: String?
    public let phone: String?
    public let distanceKm: Double?
}

/// Map layer states.
public struct MapLayersState: Equatable, Sendable {
    public var showDestinations: Bool = true
    public var showTransitRoutes: Bool = false
    public var showVerifiedStops: Bool = false
    public var showCandidateStops: Bool = false
    public var showEssentials: Bool = false
    public var showUserLocation: Bool = false

    public mutating func toggleEssentials() {
        showEssentials.toggle()
        if showEssentials {
            showDestinations = false // mutual exclusivity
        }
    }

    public mutating func toggleDestinations() {
        showDestinations.toggle()
        if showDestinations {
            showEssentials = false
        }
    }
}

/// Selected entity on map.
public enum SelectedMapEntity: Equatable, Sendable {
    case none
    case destination(PlaceCardModel)
    case transitStop(TransitStopMarker)
    case civicService(CivicServiceMarker)
}

/// Map product states.
public enum MapProductState: Equatable, Sendable {
    case loading
    case ready
    case dataUnavailable(String)
}

/// Location status.
public enum LocationStatus: Equatable, Sendable {
    case unknown
    case permissionRequired
    case permissionDenied
    case locationUnavailable
    case live(latitude: Double, longitude: Double, accuracyMeters: Double?)
}
