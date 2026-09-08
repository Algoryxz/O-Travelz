import Foundation
import SwiftData

/// Authoritative SwiftData entity models for user persistence (Wave M14).
/// Strictly references canonical catalog entities without duplicating or forking them.

@Model
final class SavedPlaceModel {
    @Attribute(.unique) var canonicalPlaceId: String
    var savedAt: Date
    var placeName: String
    var category: String
    var district: String?
    var imageUrl: String?
    var rating: Double?

    init(
        canonicalPlaceId: String,
        savedAt: Date = Date(),
        placeName: String,
        category: String,
        district: String? = nil,
        imageUrl: String? = nil,
        rating: Double? = nil
    ) {
        self.canonicalPlaceId = canonicalPlaceId
        self.savedAt = savedAt
        self.placeName = placeName
        self.category = category
        self.district = district
        self.imageUrl = imageUrl
        self.rating = rating
    }
}

@Model
final class SavedTripModel {
    @Attribute(.unique) var tripId: String
    var title: String
    var daysCount: Int
    var startHub: String?
    var createdAt: Date
    var updatedAt: Date
    var constraintsJson: String
    var aiExplanation: String?
    var schemaVersion: Int

    @Relationship(deleteRule: .cascade, inverse: \SavedTripStopModel.trip)
    var stops: [SavedTripStopModel] = []

    init(
        tripId: String = UUID().uuidString,
        title: String,
        daysCount: Int = 1,
        startHub: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        constraintsJson: String,
        aiExplanation: String? = nil,
        schemaVersion: Int = 1
    ) {
        self.tripId = tripId
        self.title = title
        self.daysCount = daysCount
        self.startHub = startHub
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.constraintsJson = constraintsJson
        self.aiExplanation = aiExplanation
        self.schemaVersion = schemaVersion
    }

    var sortedStops: [SavedTripStopModel] {
        stops.sorted {
            if $0.dayNumber != $1.dayNumber {
                return $0.dayNumber < $1.dayNumber
            }
            return $0.stopSequence < $1.stopSequence
        }
    }
}

@Model
final class SavedTripStopModel {
    @Attribute(.unique) var stopId: String
    var dayNumber: Int
    var stopSequence: Int
    var canonicalPlaceId: String
    var placeName: String
    var category: String
    var plannedArrival: String?
    var plannedDeparture: String?
    var hopMode: String?
    var hopMinutes: Int?
    var hopDetail: String?
    var hopFare: Double?

    var trip: SavedTripModel?

    init(
        stopId: String = UUID().uuidString,
        dayNumber: Int,
        stopSequence: Int,
        canonicalPlaceId: String,
        placeName: String,
        category: String,
        plannedArrival: String? = nil,
        plannedDeparture: String? = nil,
        hopMode: String? = nil,
        hopMinutes: Int? = nil,
        hopDetail: String? = nil,
        hopFare: Double? = nil
    ) {
        self.stopId = stopId
        self.dayNumber = dayNumber
        self.stopSequence = stopSequence
        self.canonicalPlaceId = canonicalPlaceId
        self.placeName = placeName
        self.category = category
        self.plannedArrival = plannedArrival
        self.plannedDeparture = plannedDeparture
        self.hopMode = hopMode
        self.hopMinutes = hopMinutes
        self.hopDetail = hopDetail
        self.hopFare = hopFare
    }
}

@Model
final class TripProgressModel {
    @Attribute(.unique) var tripId: String
    var isActive: Bool
    var activeDay: Int
    var currentMilestoneIndex: Int
    var completedStopIdsJson: String
    var skippedStopIdsJson: String
    var startedAt: Date?
    var lastUpdatedAt: Date
    var completionState: String

    init(
        tripId: String,
        isActive: Bool = false,
        activeDay: Int = 1,
        currentMilestoneIndex: Int = 0,
        completedStopIdsJson: String = "[]",
        skippedStopIdsJson: String = "[]",
        startedAt: Date? = nil,
        lastUpdatedAt: Date = Date(),
        completionState: String = "IN_PROGRESS"
    ) {
        self.tripId = tripId
        self.isActive = isActive
        self.activeDay = activeDay
        self.currentMilestoneIndex = currentMilestoneIndex
        self.completedStopIdsJson = completedStopIdsJson
        self.skippedStopIdsJson = skippedStopIdsJson
        self.startedAt = startedAt
        self.lastUpdatedAt = lastUpdatedAt
        self.completionState = completionState
    }
}
