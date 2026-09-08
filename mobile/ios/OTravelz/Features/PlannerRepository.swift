import Foundation

/// Repository coordinating deterministic plan generation and grounded conversational extraction.
public actor PlannerRepository {
    private let apiClient: APIClient

    public init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
    }

    /// Executes deterministic facts-only itinerary generation.
    public func planItinerary(constraints: PlanConstraints) async throws -> PlanResult {
        let requestDTO = constraints.toRequestDTO()
        let responseDTO = try await apiClient.planItinerary(request: requestDTO)
        return PlanResult.fromDTO(responseDTO, originalConstraints: constraints)
    }

    /// Interprets natural language traveler notes and extracts structured planning constraints.
    public func extractConstraintsWithAI(
        userNote: String,
        currentConstraints: PlanConstraints
    ) async throws -> (PlanConstraints, AIConverseResponseDTO) {
        let requestDTO = AIConverseRequestDTO(
            messages: [ChatMessageDTO(role: "user", content: userNote)],
            constraints: currentConstraints.toRequestDTO()
        )

        let responseDTO = try await apiClient.converseWithAI(request: requestDTO)
        let extracted: PlanConstraints = {
            if let c = responseDTO.constraints {
                return PlanConstraints.fromRequestDTO(c)
            }
            return currentConstraints
        }()

        return (extracted, responseDTO)
    }
}
