import Foundation
import CoreLocation

/// 5 Canonical Transit Operational Regions across Odisha.
public enum TransitRegion: String, CaseIterable, Identifiable, Sendable {
    case capitalRegion = "capital_region"
    case rourkela = "rourkela"
    case sambalpur = "sambalpur"
    case berhampur = "berhampur"
    case keonjhar = "keonjhar"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .capitalRegion: return "Capital Region"
        case .rourkela: return "Rourkela"
        case .sambalpur: return "Sambalpur"
        case .berhampur: return "Berhampur"
        case .keonjhar: return "Keonjhar"
        }
    }

    public var odiaName: String {
        switch self {
        case .capitalRegion: return "କ୍ୟାପିଟାଲ୍ ରିଜିଅନ୍"
        case .rourkela: return "ରାଉରକେଲା"
        case .sambalpur: return "ସମ୍ବଲପୁର"
        case .berhampur: return "ବ୍ରହ୍ମପୁର"
        case .keonjhar: return "କେନ୍ଦୁଝର"
        }
    }

    public static func fromString(_ raw: String?) -> TransitRegion? {
        guard let raw = raw?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(), !raw.isEmpty else {
            return nil
        }
        if raw.contains("capital") || raw.contains("bhubaneswar") || raw.contains("cuttack") || raw.contains("puri") || raw.contains("khordha") {
            return .capitalRegion
        } else if raw.contains("rourkela") || raw.contains("sundergarh") || raw.contains("sundargarh") {
            return .rourkela
        } else if raw.contains("sambalpur") || raw.contains("burla") {
            return .sambalpur
        } else if raw.contains("berhampur") || raw.contains("brahmapur") || raw.contains("ganjam") {
            return .berhampur
        } else if raw.contains("keonjhar") || raw.contains("kendujhar") {
            return .keonjhar
        }
        return nil
    }

    public static func inferFromRouteNumber(_ routeNumber: String) -> TransitRegion {
        let digits = routeNumber.filter { $0.isNumber }
        if let num = Int(digits) {
            switch num {
            case 100...199: return .rourkela
            case 200...299: return .sambalpur
            case 300...399: return .berhampur
            case 400...499: return .keonjhar
            default: return .capitalRegion
            }
        }
        return .capitalRegion
    }
}

/// Lightweight summary of a transit route for directory catalog browsing and search.
public struct TransitRouteSummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let routeId: String
    public let routeNumber: String
    public let routeName: String
    public let region: TransitRegion
    public let operatorName: String
    public let networkType: String
    public let origin: String
    public let destination: String
    public let via: String?
    public let hasSchedule: BooleanLiteralType
    public let totalStops: Int

    public init(
        routeId: String,
        routeNumber: String,
        routeName: String,
        region: TransitRegion,
        operatorName: String = "CRUT",
        networkType: String = "AMA Bus",
        origin: String,
        destination: String,
        via: String? = nil,
        hasSchedule: Bool = true,
        totalStops: Int = 0
    ) {
        self.id = routeId
        self.routeId = routeId
        self.routeNumber = routeNumber
        self.routeName = routeName
        self.region = region
        self.operatorName = operatorName
        self.networkType = networkType
        self.origin = origin
        self.destination = destination
        self.via = via
        self.hasSchedule = hasSchedule
        self.totalStops = totalStops
    }
}

/// Individual stop in a route sequence with truthful physical verification gating.
public struct TransitStop: Identifiable, Equatable, Sendable {
    public let id: String
    public let stopId: String
    public let name: String
    public let sequenceOrder: Int
    public let latitude: Double?
    public let longitude: Double?
    public let tier: StopVerificationTier
    public let locality: String?
    public let city: String?
    public let routesServing: [String]

    public init(
        stopId: String,
        name: String,
        sequenceOrder: Int = 0,
        latitude: Double? = nil,
        longitude: Double? = nil,
        tier: StopVerificationTier = .unresolved,
        locality: String? = nil,
        city: String? = nil,
        routesServing: [String] = []
    ) {
        self.id = stopId
        self.stopId = stopId
        self.name = name
        self.sequenceOrder = sequenceOrder
        self.latitude = latitude
        self.longitude = longitude
        self.tier = tier
        self.locality = locality
        self.city = city
        self.routesServing = routesServing
    }

    public var isVerifiedPhysicalPole: Bool {
        tier.isVerifiedPhysicalPole && latitude != nil && longitude != nil
    }

    public var isLocalityOnly: Bool {
        !isVerifiedPhysicalPole
    }

    public var coordinate: GeoCoordinate? {
        guard let lat = latitude, let lon = longitude else { return nil }
        return GeoCoordinate(latitude: lat, longitude: lon)
    }

    public var allowsExternalNavigation: Bool {
        isVerifiedPhysicalPole && coordinate != nil
    }

    public func evaluateFirstMile(userLat: Double?, userLon: Double?, isRealGps: Bool) -> FirstMileGuidance? {
        guard isRealGps, isVerifiedPhysicalPole,
              let sLat = latitude, let sLon = longitude,
              let uLat = userLat, let uLon = userLon,
              let sCoord = GeoCoordinate(latitude: sLat, longitude: sLon),
              let uCoord = GeoCoordinate(latitude: uLat, longitude: uLon) else {
            return nil
        }

        let distM = uCoord.distanceKm(to: sCoord) * 1000.0
        return FirstMileGuidance.evaluate(distanceMeters: distM, isRealGps: true)
    }
}

/// Directional timetable schedule for a route.
public struct TransitSchedule: Identifiable, Equatable, Sendable {
    public let id: String
    public let scheduleId: String
    public let groupLabel: String
    public let terminus: String
    public let totalTrips: Int
    public let departureTimes: [String]
    public let sourceDocument: String?
    public let effectiveDate: String?

    public init(
        scheduleId: String,
        groupLabel: String,
        terminus: String,
        totalTrips: Int,
        departureTimes: [String],
        sourceDocument: String? = nil,
        effectiveDate: String? = nil
    ) {
        self.id = scheduleId
        self.scheduleId = scheduleId
        self.groupLabel = groupLabel
        self.terminus = terminus
        self.totalTrips = totalTrips
        self.departureTimes = departureTimes
        self.sourceDocument = sourceDocument
        self.effectiveDate = effectiveDate
    }

    public func evaluateNextDeparture(currentTimeIst: String) -> ScheduledDepartureResult {
        guard !departureTimes.isEmpty else {
            return ScheduledDepartureResult(
                nextDepartureTime: nil,
                isServiceFinishedForDay: false,
                minutesUntilDeparture: nil,
                displayLabel: "Timetable unavailable"
            )
        }

        let normalizedCurrent = Self.normalizeTime(currentTimeIst)
        let upcoming = departureTimes.first { Self.normalizeTime($0) >= normalizedCurrent }

        if let next = upcoming {
            let waitMinutes = Self.calculateMinutesBetween(from: normalizedCurrent, to: Self.normalizeTime(next))
            return ScheduledDepartureResult(
                nextDepartureTime: next,
                isServiceFinishedForDay: false,
                minutesUntilDeparture: waitMinutes,
                displayLabel: "Next scheduled departure: \(next) IST"
            )
        } else {
            return ScheduledDepartureResult(
                nextDepartureTime: nil,
                isServiceFinishedForDay: true,
                minutesUntilDeparture: nil,
                displayLabel: "Service finished for today"
            )
        }
    }

    private static func normalizeTime(_ time: String) -> String {
        let parts = time.trimmingCharacters(in: .whitespaces).split(separator: ":")
        guard parts.count == 2, let h = Int(parts[0]), let m = Int(parts[1]) else { return time }
        return String(format: "%02d:%02d", h, m)
    }

    private static func calculateMinutesBetween(from: String, to: String) -> Int {
        let fromParts = from.split(separator: ":").compactMap { Int($0) }
        let toParts = to.split(separator: ":").compactMap { Int($0) }
        guard fromParts.count == 2 && toParts.count == 2 else { return 0 }
        let fromTotal = fromParts[0] * 60 + fromParts[1]
        let toTotal = toParts[0] * 60 + toParts[1]
        let diff = toTotal - fromTotal
        return diff >= 0 ? diff : (1440 + diff)
    }
}

public struct ScheduledDepartureResult: Equatable, Sendable {
    public let nextDepartureTime: String?
    public let isServiceFinishedForDay: Bool
    public let minutesUntilDeparture: Int?
    public let displayLabel: String
}

public enum FirstMileBand: String, Sendable {
    case walkReasonable = "WALK_REASONABLE"
    case walkOrShortAuto = "WALK_OR_SHORT_AUTO"
    case autoOrCabRecommended = "AUTO_OR_CAB_RECOMMENDED"
}

public struct FirstMileGuidance: Equatable, Sendable {
    public let band: FirstMileBand
    public let distanceMeters: Double

    public static func evaluate(distanceMeters: Double, isRealGps: Bool) -> FirstMileGuidance? {
        guard isRealGps, !distanceMeters.isNaN, distanceMeters >= 0 else { return nil }
        let band: FirstMileBand
        if distanceMeters <= 800.0 {
            band = .walkReasonable
        } else if distanceMeters <= 1500.0 {
            band = .walkOrShortAuto
        } else {
            band = .autoOrCabRecommended
        }
        return FirstMileGuidance(band: band, distanceMeters: distanceMeters)
    }
}

/// Full detail of a route including ordered stops and directional schedules.
public struct TransitRouteDetail: Identifiable, Equatable, Sendable {
    public let id: String
    public let routeId: String
    public let routeNumber: String
    public let routeName: String
    public let region: TransitRegion
    public let operatorName: String
    public let networkType: String
    public let origin: String
    public let destination: String
    public let via: String?
    public let stops: [TransitStop]
    public let schedules: [TransitSchedule]
    public let isGeometryAvailable: Bool
    public let geometryStatus: String?
    public let sourceDocument: String?
    public let effectiveDate: String?

    public init(
        routeId: String,
        routeNumber: String,
        routeName: String,
        region: TransitRegion,
        operatorName: String = "CRUT",
        networkType: String = "AMA Bus",
        origin: String,
        destination: String,
        via: String? = nil,
        stops: [TransitStop] = [],
        schedules: [TransitSchedule] = [],
        isGeometryAvailable: Bool = false,
        geometryStatus: String? = nil,
        sourceDocument: String? = nil,
        effectiveDate: String? = nil
    ) {
        self.id = routeId
        self.routeId = routeId
        self.routeNumber = routeNumber
        self.routeName = routeName
        self.region = region
        self.operatorName = operatorName
        self.networkType = networkType
        self.origin = origin
        self.destination = destination
        self.via = via
        self.stops = stops
        self.schedules = schedules
        self.isGeometryAvailable = isGeometryAvailable
        self.geometryStatus = geometryStatus
        self.sourceDocument = sourceDocument
        self.effectiveDate = effectiveDate
    }

    public var hasSchedules: Bool {
        schedules.contains { !$0.departureTimes.isEmpty }
    }

    public var totalStopsCount: Int {
        stops.count
    }
}

/// Pure deterministic transit search ranking engine (Wave M12) for iOS.
public struct TransitSearchEngine {

    public static func filterAndRank(
        routes: [TransitRouteSummary],
        query: String,
        selectedRegion: TransitRegion? = nil
    ) -> [TransitRouteSummary] {
        let regionFiltered: [TransitRouteSummary]
        if let reg = selectedRegion {
            regionFiltered = routes.filter { $0.region == reg }
        } else {
            regionFiltered = routes
        }

        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty {
            return regionFiltered.sorted { a, b in
                let aRegionIdx = TransitRegion.allCases.firstIndex(of: a.region) ?? 0
                let bRegionIdx = TransitRegion.allCases.firstIndex(of: b.region) ?? 0
                if aRegionIdx != bRegionIdx {
                    return aRegionIdx < bRegionIdx
                }
                return parseRouteNumberForSort(a.routeNumber) < parseRouteNumberForSort(b.routeNumber)
            }
        }

        let scored = regionFiltered.compactMap { route -> (TransitRouteSummary, Int)? in
            let score = computeSearchScore(route: route, q: q)
            return score > 0 ? (route, score) : nil
        }

        return scored.sorted { a, b in
            if a.1 != b.1 {
                return a.1 > b.1
            }
            let aRegionIdx = TransitRegion.allCases.firstIndex(of: a.0.region) ?? 0
            let bRegionIdx = TransitRegion.allCases.firstIndex(of: b.0.region) ?? 0
            if aRegionIdx != bRegionIdx {
                return aRegionIdx < bRegionIdx
            }
            return parseRouteNumberForSort(a.0.routeNumber) < parseRouteNumberForSort(b.0.routeNumber)
        }.map { $0.0 }
    }

    private static func computeSearchScore(route: TransitRouteSummary, q: String) -> Int {
        let rNum = route.routeNumber.trimmingCharacters(in: .whitespaces).lowercased()
        let orig = route.origin.trimmingCharacters(in: .whitespaces).lowercased()
        let dest = route.destination.trimmingCharacters(in: .whitespaces).lowercased()
        let name = route.routeName.trimmingCharacters(in: .whitespaces).lowercased()
        let via = route.via?.trimmingCharacters(in: .whitespaces).lowercased() ?? ""
        let reg = route.region.displayName.lowercased()

        if rNum == q {
            return 10000 // Tier 1: Exact route number match
        } else if rNum.hasPrefix(q) {
            return 8000  // Tier 2: Prefix route number match
        } else if orig == q || dest == q {
            return 6000  // Tier 3: Exact origin or destination
        } else if orig.hasPrefix(q) || dest.hasPrefix(q) {
            return 4000  // Tier 4: Prefix origin or destination
        } else if name.contains(q) || (!via.isEmpty && via.contains(q)) {
            return 2000  // Tier 5: Substring in name or via
        } else if reg.contains(q) {
            return 1000  // Tier 6: Substring in region
        }
        return 0
    }

    public static func parseRouteNumberForSort(_ routeNumber: String) -> String {
        let digits = routeNumber.filter { $0.isNumber }
        let prefix = routeNumber.filter { !$0.isNumber }
        let num = Int(digits) ?? 9999
        return String(format: "%@%05d", prefix, num)
    }
}
