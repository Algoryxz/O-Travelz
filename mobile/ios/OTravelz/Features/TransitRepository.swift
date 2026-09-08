import Foundation

public protocol TransitRepositoryProtocol: Sendable {
    func getRoutes() async -> [TransitRouteSummary]
    func getRouteDetail(routeId: String) async -> TransitRouteDetail?
    func getStop(stopId: String) async -> TransitStop?
}

public actor TransitRepository: TransitRepositoryProtocol {
    public static let shared = TransitRepository()

    private var cachedRoutes: [TransitRouteSummary]?
    private var cachedRawRoutes: [String: CanonicalRouteRawDTO]?
    private var cachedSchedules: [String: [CanonicalScheduleRawDTO]]?
    private var cachedSequences: [String: [CanonicalRouteSequenceDTO]]?

    public init() {}

    public func getRoutes() async -> [TransitRouteSummary] {
        if let existing = cachedRoutes { return existing }
        ensureLoaded()
        return cachedRoutes ?? []
    }

    public func getRouteDetail(routeId: String) async -> TransitRouteDetail? {
        ensureLoaded()
        guard let rawRoute = cachedRawRoutes?[routeId] else { return nil }

        let region = TransitRegion.fromString(rawRoute.serviceArea)
            ?? TransitRegion.inferFromRouteNumber(rawRoute.routeNumber)

        let sequences = cachedSequences?[routeId] ?? []
        let forwardSeq = sequences.first { $0.direction == "forward" } ?? sequences.first
        let stopItems: [TransitStop] = forwardSeq?.stops.map { s in
            let tier = StopVerificationTier(rawValue: s.coordinateStatus ?? "UNRESOLVED") ?? .unresolved
            return TransitStop(
                stopId: s.stopId,
                name: s.normalizedStopName ?? s.rawStopName ?? s.stopId,
                sequenceOrder: s.sequence,
                latitude: s.latitude,
                longitude: s.longitude,
                tier: tier,
                routesServing: [rawRoute.routeNumber]
            )
        } ?? []

        let rawScheds = cachedSchedules?[routeId] ?? []
        let scheduleList: [TransitSchedule] = rawScheds.map { sc in
            TransitSchedule(
                scheduleId: sc.scheduleId,
                groupLabel: sc.direction ?? sc.terminus ?? "Outbound",
                terminus: sc.terminus ?? sc.destination ?? rawRoute.destination ?? "",
                totalTrips: sc.departureTimes.count,
                departureTimes: sc.departureTimes,
                sourceDocument: sc.sourceDocument ?? rawRoute.sourceDocument,
                effectiveDate: sc.effectiveDate ?? rawRoute.effectiveDate
            )
        }

        return TransitRouteDetail(
            routeId: rawRoute.routeId,
            routeNumber: rawRoute.routeNumber,
            routeName: rawRoute.routeName,
            region: region,
            operatorName: rawRoute.operatorName,
            networkType: rawRoute.networkType,
            origin: rawRoute.origin,
            destination: rawRoute.destination ?? "",
            via: rawRoute.via,
            stops: stopItems,
            schedules: scheduleList,
            isGeometryAvailable: false,
            geometryStatus: "NONE",
            sourceDocument: rawRoute.sourceDocument,
            effectiveDate: rawRoute.effectiveDate
        )
    }

    public func getStop(stopId: String) async -> TransitStop? {
        ensureLoaded()
        var servingRoutes: [String] = []
        var foundStop: TransitStop? = nil

        cachedSequences?.values.forEach { seqList in
            seqList.forEach { seq in
                seq.stops.forEach { s in
                    if s.stopId == stopId {
                        if let rNum = seq.routeNumber, !servingRoutes.contains(rNum) {
                            servingRoutes.append(rNum)
                        }
                        if foundStop == nil {
                            let tier = StopVerificationTier(rawValue: s.coordinateStatus ?? "UNRESOLVED") ?? .unresolved
                            foundStop = TransitStop(
                                stopId: s.stopId,
                                name: s.normalizedStopName ?? s.rawStopName ?? s.stopId,
                                sequenceOrder: s.sequence,
                                latitude: s.latitude,
                                longitude: s.longitude,
                                tier: tier
                            )
                        }
                    }
                }
            }
        }

        guard let st = foundStop else { return nil }
        return TransitStop(
            stopId: st.stopId,
            name: st.name,
            sequenceOrder: st.sequenceOrder,
            latitude: st.latitude,
            longitude: st.longitude,
            tier: st.tier,
            locality: st.locality,
            city: st.city,
            routesServing: servingRoutes.sorted()
        )
    }

    private func ensureLoaded() {
        if cachedRoutes != nil && cachedSchedules != nil && cachedSequences != nil { return }

        let decoder = JSONDecoder()

        // 1. routes.json
        if let url = Bundle.main.url(forResource: "routes", withExtension: "json", subdirectory: "Transit")
            ?? Bundle.moduleOrMain.url(forResource: "routes", withExtension: "json") {
            if let data = try? Data(contentsOf: url),
               let raw = try? decoder.decode([CanonicalRouteRawDTO].self, from: data) {
                var map: [String: CanonicalRouteRawDTO] = [:]
                var list: [TransitRouteSummary] = []
                for r in raw {
                    map[r.routeId] = r
                    let region = TransitRegion.fromString(r.serviceArea)
                        ?? TransitRegion.inferFromRouteNumber(r.routeNumber)
                    list.append(TransitRouteSummary(
                        routeId: r.routeId,
                        routeNumber: r.routeNumber,
                        routeName: r.routeName,
                        region: region,
                        operatorName: r.operatorName,
                        networkType: r.networkType,
                        origin: r.origin,
                        destination: r.destination ?? "",
                        via: r.via,
                        hasSchedule: r.hasSchedule,
                        totalStops: r.totalStops
                    ))
                }
                cachedRawRoutes = map
                cachedRoutes = list
            }
        }

        // 2. schedules.json
        if let url = Bundle.main.url(forResource: "schedules", withExtension: "json", subdirectory: "Transit")
            ?? Bundle.moduleOrMain.url(forResource: "schedules", withExtension: "json") {
            if let data = try? Data(contentsOf: url),
               let raw = try? decoder.decode([CanonicalScheduleRawDTO].self, from: data) {
                var schedMap: [String: [CanonicalScheduleRawDTO]] = [:]
                for sc in raw {
                    schedMap[sc.routeId, default: []].append(sc)
                }
                cachedSchedules = schedMap
            }
        }

        // 3. route_stops.json
        if let url = Bundle.main.url(forResource: "route_stops", withExtension: "json", subdirectory: "Transit")
            ?? Bundle.moduleOrMain.url(forResource: "route_stops", withExtension: "json") {
            if let data = try? Data(contentsOf: url),
               let raw = try? decoder.decode([CanonicalRouteSequenceDTO].self, from: data) {
                var seqMap: [String: [CanonicalRouteSequenceDTO]] = [:]
                for seq in raw {
                    seqMap[seq.routeId, default: []].append(seq)
                }
                cachedSequences = seqMap
            }
        }
    }
}

// Canonical JSON DTOs
struct CanonicalRouteRawDTO: Codable, Sendable {
    let routeId: String
    let routeNumber: String
    let routeName: String
    let operatorName: String
    let networkType: String
    let origin: String
    let destination: String?
    let via: String?
    let serviceArea: String?
    let totalStops: Int
    let hasSchedule: Bool
    let sourceDocument: String?
    let effectiveDate: String?

    enum CodingKeys: String, CodingKey {
        case routeId = "route_id"
        case routeNumber = "route_number"
        case routeName = "route_name"
        case operatorName = "operator"
        case networkType = "network_type"
        case origin
        case destination
        case via
        case serviceArea = "service_area"
        case totalStops = "total_stops"
        case hasSchedule = "has_schedule"
        case sourceDocument = "source_document"
        case effectiveDate = "effective_date"
    }
}

struct CanonicalScheduleRawDTO: Codable, Sendable {
    let scheduleId: String
    let routeId: String
    let routeNumber: String?
    let routeName: String?
    let direction: String?
    let terminus: String?
    let origin: String?
    let destination: String?
    let departureTimes: [String]
    let sourceDocument: String?
    let effectiveDate: String?

    enum CodingKeys: String, CodingKey {
        case scheduleId = "schedule_id"
        case routeId = "route_id"
        case routeNumber = "route_number"
        case routeName = "route_name"
        case direction
        case terminus
        case origin
        case destination
        case departureTimes = "departure_times"
        case sourceDocument = "source_document"
        case effectiveDate = "effective_date"
    }
}

struct CanonicalStopRefDTO: Codable, Sendable {
    let sequence: Int
    let rawStopName: String?
    let normalizedStopName: String?
    let stopId: String
    let resolutionStatus: String?
    let coordinateStatus: String?
    let latitude: Double?
    let longitude: Double?

    enum CodingKeys: String, CodingKey {
        case sequence
        case rawStopName = "raw_stop_name"
        case normalizedStopName = "normalized_stop_name"
        case stopId = "stop_id"
        case resolutionStatus = "resolution_status"
        case coordinateStatus = "coordinate_status"
        case latitude
        case longitude
    }
}

struct CanonicalRouteSequenceDTO: Codable, Sendable {
    let sequenceId: String
    let routeId: String
    let routeNumber: String?
    let direction: String?
    let totalStops: Int
    let stops: [CanonicalStopRefDTO]

    enum CodingKeys: String, CodingKey {
        case sequenceId = "sequence_id"
        case routeId = "route_id"
        case routeNumber = "route_number"
        case direction
        case totalStops = "total_stops"
        case stops
    }
}

extension Bundle {
    static var moduleOrMain: Bundle {
        Bundle.main
    }
}
