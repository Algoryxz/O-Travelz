import Foundation
import SwiftUI

/// Observable ViewModel managing constraint-aware itinerary generation and grounded AI companion interactions.
@MainActor
public final class PlannerViewModel: ObservableObject {
    @Published public var constraints: PlanConstraints = PlanConstraints()
    @Published public var naturalLanguagePrompt: String = ""
    @Published public var isLoading: Bool = false
    @Published public var isAIExtracting: Bool = false
    @Published public var planResult: PlanResult? = nil
    @Published public var errorMessage: String? = nil
    @Published public var aiCompanionMessage: String? = nil
    @Published public var isAIGrounded: Bool = false
    @Published public var showConstraintsForm: Bool = true

    private let repository: PlannerRepository

    public init(repository: PlannerRepository = PlannerRepository()) {
        self.repository = repository
    }

    public func setDays(_ days: Int) {
        constraints.days = min(max(days, 1), 7)
    }

    public func toggleInterest(_ key: String) {
        if constraints.interests.contains(key) {
            if constraints.interests.count > 1 {
                constraints.interests.remove(key)
            }
        } else {
            constraints.interests.insert(key)
        }
    }

    public func setPace(_ pace: PlanPace) {
        constraints.pace = pace
    }

    public func setStartHub(_ hub: String) {
        constraints.startHub = hub
    }

    public func toggleLowWalking(_ enabled: Bool) {
        constraints.lowWalking = enabled
    }

    public func togglePublicTransport(_ enabled: Bool) {
        constraints.publicTransportPreferred = enabled
    }

    public func extractConstraintsWithAI() {
        let prompt = naturalLanguagePrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !prompt.isEmpty else { return }

        isAIExtracting = true
        errorMessage = nil

        Task {
            do {
                let (extracted, aiResponse) = try await repository.extractConstraintsWithAI(
                    userNote: prompt,
                    currentConstraints: constraints
                )
                self.constraints = extracted
                self.aiCompanionMessage = aiResponse.message
                self.isAIGrounded = aiResponse.isGrounded ?? false
                self.isAIExtracting = false
            } catch {
                self.errorMessage = NSLocalizedString("offline_ai_notice", comment: "")
                self.isAIExtracting = false
            }
        }
    }

    public func generatePlan() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let result = try await repository.planItinerary(constraints: constraints)
                self.planResult = PlanResult(
                    itineraryId: result.itineraryId,
                    constraints: result.constraints,
                    days: result.days,
                    explanation: result.explanation,
                    aiCompanionMessage: self.aiCompanionMessage ?? result.aiCompanionMessage,
                    isAIGrounded: self.isAIGrounded,
                    warnings: result.warnings
                )
                self.isLoading = false
                self.showConstraintsForm = false
            } catch {
                self.errorMessage = NSLocalizedString("offline_ai_notice", comment: "")
                self.isLoading = false
            }
        }
    }

    public enum SaveTripState {
        case unsaved
        case saving
        case saved
        case saveFailed
    }

    @Published public var saveTripState: SaveTripState = .unsaved

    public func modifyPlan() {
        showConstraintsForm = true
    }

    public func clearPlan() {
        constraints = PlanConstraints()
        planResult = nil
        naturalLanguagePrompt = ""
        aiCompanionMessage = nil
        errorMessage = nil
        showConstraintsForm = true
        saveTripState = .unsaved
    }

    public func saveCurrentPlan(persistenceRepo: PersistenceRepository) {
        guard let plan = planResult else { return }
        saveTripState = .saving
        _ = persistenceRepo.savePlanResult(plan: plan)
        saveTripState = .saved
    }

    public func startCurrentPlan(persistenceRepo: PersistenceRepository, onStarted: () -> Void) {
        guard let plan = planResult else { return }
        let tripId = persistenceRepo.savePlanResult(plan: plan)
        persistenceRepo.startTrip(tripId: tripId)
        saveTripState = .saved
        onStarted()
    }
}
