import Foundation
import SwiftData

/// Cohesive repository coordinating SwiftData operations for iOS (Wave M14).
@MainActor
final class PersistenceRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    init(modelContainer: ModelContainer) {
        self.context = modelContainer.mainContext
    }

    // ==========================================
    // 1. SAVED PLACES
    // ==========================================

    func isPlaceSaved(placeId: String) -> Bool {
        let descriptor = FetchDescriptor<SavedPlaceModel>(
            predicate: #Predicate { $0.canonicalPlaceId == placeId }
        )
        return (try? context.fetchCount(descriptor)) ?? 0 > 0
    }

    func savePlace(
        placeId: String,
        name: String,
        category: String,
        district: String? = nil,
        imageUrl: String? = nil,
        rating: Double? = nil
    ) {
        if let existing = fetchPlace(placeId: placeId) {
            existing.savedAt = Date()
            existing.placeName = name
            existing.category = category
            existing.district = district
            existing.imageUrl = imageUrl
            existing.rating = rating
        } else {
            let newPlace = SavedPlaceModel(
                canonicalPlaceId: placeId,
                savedAt: Date(),
                placeName: name,
                category: category,
                district: district,
                imageUrl: imageUrl,
                rating: rating
            )
            context.insert(newPlace)
        }
        try? context.save()
    }

    func unsavePlace(placeId: String) {
        if let existing = fetchPlace(placeId: placeId) {
            context.delete(existing)
            try? context.save()
        }
    }

    func fetchAllSavedPlaces() -> [SavedPlaceModel] {
        let descriptor = FetchDescriptor<SavedPlaceModel>(
            sortBy: [SortDescriptor(\.savedAt, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    private func fetchPlace(placeId: String) -> SavedPlaceModel? {
        let descriptor = FetchDescriptor<SavedPlaceModel>(
            predicate: #Predicate { $0.canonicalPlaceId == placeId }
        )
        return try? context.fetch(descriptor).first
    }

    // ==========================================
    // 2. SAVED TRIPS
    // ==========================================

    func fetchAllTrips() -> [SavedTripModel] {
        let descriptor = FetchDescriptor<SavedTripModel>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    func fetchTrip(tripId: String) -> SavedTripModel? {
        let descriptor = FetchDescriptor<SavedTripModel>(
            predicate: #Predicate { $0.tripId == tripId }
        )
        return try? context.fetch(descriptor).first
    }

    func savePlanResult(plan: PlanResult, customTitle: String? = nil) -> String {
        let tripId = plan.itineraryId.isEmpty ? UUID().uuidString : plan.itineraryId
        let title = customTitle ?? "\(plan.constraints.days)-Day \(plan.constraints.startHub ?? "Odisha") Itinerary"

        let trip = SavedTripModel(
            tripId: tripId,
            title: title,
            daysCount: plan.constraints.days,
            startHub: plan.constraints.startHub,
            createdAt: Date(),
            updatedAt: Date(),
            constraintsJson: "{\"days\":\(plan.constraints.days),\"pace\":\"\(plan.constraints.pace)\"}",
            aiExplanation: plan.aiCompanionMessage,
            schemaVersion: 1
        )
        context.insert(trip)

        for day in plan.days {
            for (idx, stop) in day.stops.enumerated() {
                let hop = day.hops.indices.contains(idx) ? day.hops[idx] : nil
                let stopModel = SavedTripStopModel(
                    stopId: UUID().uuidString,
                    dayNumber: day.dayNumber,
                    stopSequence: stop.sequence,
                    canonicalPlaceId: stop.placeId,
                    placeName: stop.placeName,
                    category: stop.category,
                    plannedArrival: stop.plannedArrival,
                    plannedDeparture: stop.plannedDeparture,
                    hopMode: hop?.mode,
                    hopMinutes: hop?.estimatedMinutes,
                    hopDetail: hop?.legDetail,
                    hopFare: nil
                )
                stopModel.trip = trip
                context.insert(stopModel)
            }
        }

        try? context.save()
        return tripId
    }

    func deleteTrip(tripId: String) {
        if let trip = fetchTrip(tripId: tripId) {
            context.delete(trip)
            if let progress = fetchProgress(tripId: tripId) {
                context.delete(progress)
            }
            try? context.save()
        }
    }

    // ==========================================
    // 3. ACTIVE TRIP EXECUTION
    // ==========================================

    func fetchActiveProgress() -> TripProgressModel? {
        let descriptor = FetchDescriptor<TripProgressModel>(
            predicate: #Predicate { $0.isActive == true }
        )
        return try? context.fetch(descriptor).first
    }

    func fetchProgress(tripId: String) -> TripProgressModel? {
        let descriptor = FetchDescriptor<TripProgressModel>(
            predicate: #Predicate { $0.tripId == tripId }
        )
        return try? context.fetch(descriptor).first
    }

    func startTrip(tripId: String) {
        let allProgress = (try? context.fetch(FetchDescriptor<TripProgressModel>())) ?? []
        for p in allProgress {
            p.isActive = false
        }

        if let existing = fetchProgress(tripId: tripId) {
            existing.isActive = true
            existing.lastUpdatedAt = Date()
        } else {
            let newProgress = TripProgressModel(
                tripId: tripId,
                isActive: true,
                activeDay: 1,
                currentMilestoneIndex: 0,
                startedAt: Date(),
                lastUpdatedAt: Date(),
                completionState: "IN_PROGRESS"
            )
            context.insert(newProgress)
        }
        try? context.save()
    }

    func markStopVisited(tripId: String, placeId: String) {
        guard let progress = fetchProgress(tripId: tripId) else { return }
        var visited = parseJsonList(progress.completedStopIdsJson)
        var skipped = parseJsonList(progress.skippedStopIdsJson)
        if !visited.contains(placeId) {
            visited.append(placeId)
        }
        skipped.removeAll { $0 == placeId }
        progress.completedStopIdsJson = toJsonList(visited)
        progress.skippedStopIdsJson = toJsonList(skipped)
        progress.currentMilestoneIndex += 1
        progress.lastUpdatedAt = Date()
        try? context.save()
    }

    func skipStop(tripId: String, placeId: String) {
        guard let progress = fetchProgress(tripId: tripId) else { return }
        var visited = parseJsonList(progress.completedStopIdsJson)
        var skipped = parseJsonList(progress.skippedStopIdsJson)
        if !skipped.contains(placeId) {
            skipped.append(placeId)
        }
        visited.removeAll { $0 == placeId }
        progress.completedStopIdsJson = toJsonList(visited)
        progress.skippedStopIdsJson = toJsonList(skipped)
        progress.currentMilestoneIndex += 1
        progress.lastUpdatedAt = Date()
        try? context.save()
    }

    func setActiveDay(tripId: String, dayNumber: Int) {
        guard let progress = fetchProgress(tripId: tripId) else { return }
        progress.activeDay = dayNumber
        progress.currentMilestoneIndex = 0
        progress.lastUpdatedAt = Date()
        try? context.save()
    }

    func endActiveTrip(tripId: String) {
        if let progress = fetchProgress(tripId: tripId) {
            progress.isActive = false
            progress.completionState = "COMPLETED"
            progress.lastUpdatedAt = Date()
            try? context.save()
        }
    }

    func cancelActiveTrip(tripId: String) {
        if let progress = fetchProgress(tripId: tripId) {
            progress.isActive = false
            progress.completionState = "CANCELLED"
            progress.lastUpdatedAt = Date()
            try? context.save()
        }
    }

    // ==========================================
    // 4. JSON HELPERS
    // ==========================================

    private func parseJsonList(_ json: String) -> [String] {
        let trimmed = json.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count > 2 else { return [] }
        let inner = String(trimmed.dropFirst().dropLast())
        if inner.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return [] }
        return inner.split(separator: ",").map {
            $0.trimmingCharacters(in: .whitespacesAndNewlines).trimmingCharacters(in: CharacterSet(charactersIn: "\""))
        }.filter { !$0.isEmpty }
    }

    private func toJsonList(_ list: [String]) -> String {
        let joined = list.map { "\"\($0)\"" }.joined(separator: ",")
        return "[\(joined)]"
    }
}
