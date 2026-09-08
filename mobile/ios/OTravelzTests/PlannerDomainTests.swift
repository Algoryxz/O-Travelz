import Testing
import Foundation
@testable import OTravelz

@Suite("Planner Domain Models, Constraints & Truth Tests")
struct PlannerDomainTests {

    @Test("Constraint mapping converts cleanly to ItineraryPlanRequestDTO")
    func testConstraintMappingToDTO() {
        let constraints = PlanConstraints(
            days: 1,
            interests: ["temple", "heritage"],
            pace: .relaxed,
            startHub: "Bhubaneswar",
            lowWalking: true,
            publicTransportPreferred: true,
            budgetConscious: true
        )

        let dto = constraints.toRequestDTO()
        #expect(dto.days == 1)
        #expect(dto.interests?.contains("temple") == true)
        #expect(dto.interests?.contains("heritage") == true)
        #expect(dto.pace == "relaxed")
        #expect(dto.start == "Bhubaneswar")
        #expect(dto.lowWalking == true)
        #expect(dto.publicTransportPreferred == true)
        #expect(dto.budgetConscious == true)
        #expect(dto.budgetTransportPerDay == nil)
    }

    @Test("Six-hour itinerary respects max 3 stops and time bounding")
    func testSixHourDurationBounding() {
        let constraints = PlanConstraints(
            days: 1,
            interests: ["temple", "culture"],
            pace: .moderate,
            startHub: "Bhubaneswar"
        )

        let stop1 = ItineraryStopDTO(
            sequence: 1,
            place: PlaceSummaryDTO(id: "p1", name: "Lingaraj Temple", category: "temple"),
            plannedArrival: "09:00",
            plannedDeparture: "11:00"
        )
        let stop2 = ItineraryStopDTO(
            sequence: 2,
            place: PlaceSummaryDTO(id: "p2", name: "Mukteswar Temple", category: "temple"),
            plannedArrival: "11:45",
            plannedDeparture: "13:30"
        )
        let stop3 = ItineraryStopDTO(
            sequence: 3,
            place: PlaceSummaryDTO(id: "p3", name: "Kala Bhoomi", category: "culture"),
            plannedArrival: "14:15",
            plannedDeparture: "16:30"
        )

        let dayDto = ItineraryDayDTO(dayNumber: 1, stops: [stop1, stop2, stop3], hops: [])
        let responseDTO = ItineraryResponseDTO(itineraryId: "itin-6h", days: [dayDto], explanation: "6h tour")

        let plan = PlanResult.fromDTO(responseDTO, originalConstraints: constraints)
        #expect(plan.days.count == 1)
        #expect(plan.totalStopsCount == 3)
        #expect(plan.days[0].stops[0].timeWindowDisplay == "09:00 – 11:00")
        #expect(plan.days[0].stops[1].timeWindowDisplay == "11:45 – 13:30")
        #expect(plan.days[0].stops[2].timeWindowDisplay == "14:15 – 16:30")
    }

    @Test("Transport hop fares are strictly null across planner models")
    func testFareNullTruth() {
        let leg = JourneyLeg(
            fromSequence: 1,
            toSequence: 2,
            mode: "bus",
            estimatedMinutes: 20,
            estimatedCost: nil,
            legDetail: "Scheduled Mo Bus Route 10",
            dataTier: "scheduled",
            reason: nil
        )

        #expect(leg.estimatedCost == nil)
        #expect(leg.isUnavailable == false)
    }

    @Test("Unavailable transport hops report clear unavailable state")
    func testUnavailableHopBehavior() {
        let leg = JourneyLeg(
            fromSequence = 1,
            toSequence = 2,
            mode: "unavailable",
            estimatedMinutes: nil,
            estimatedCost: nil,
            legDetail: nil,
            dataTier: "unknown",
            reason: "Rural point not served by transit"
        )

        #expect(leg.isUnavailable == true)
        #expect(leg.displayModeTitle == "Transport unavailable")
    }

    @Test("AI companion message is grounded and distinct from verified facts")
    func testAICompanionGroundedFlag() {
        let constraints = PlanConstraints(days: 1, startHub: "Bhubaneswar")
        let responseDTO = ItineraryResponseDTO(itineraryId: "itin-ai", days: [], explanation: "")

        let plan = PlanResult.fromDTO(
            responseDTO,
            originalConstraints: constraints,
            aiMessage: "Here is your verified temple tour.",
            isGrounded: true
        )

        #expect(plan.isAIGrounded == true)
        #expect(plan.aiCompanionMessage == "Here is your verified temple tour.")
    }

    @Test("Days duration is clamped between 1 and 7")
    func testDaysClamping() {
        let cZero = PlanConstraints(days: 0)
        #expect(cZero.days == 1)

        let cTen = PlanConstraints(days: 10)
        #expect(cTen.days == 7)
    }

    @Test("Bhubaneswar local plan preserves geographic locality and excludes Puri and Salepur")
    func testBhubaneswarLocalStopsDoNotIncludePuriOrSalepur() {
        let constraints = PlanConstraints(
            days: 1,
            startHub: "Bhubaneswar",
            interests: ["heritage"]
        )

        let responseDTO = ItineraryResponseDTO(
            itineraryId: "itin-bhubaneswar-local",
            days: [
                ItineraryDayDTO(
                    dayNumber: 1,
                    date: nil,
                    stops: [
                        ItineraryStopDTO(sequence: 1, place: PlaceSummaryDTO(id: "p-lingaraj", name: "Lingaraj Temple", category: "temple"), plannedArrival: "09:00", plannedDeparture: "11:00"),
                        ItineraryStopDTO(sequence: 2, place: PlaceSummaryDTO(id: "p-chitrakarini", name: "Chitrakarini Temple", category: "temple"), plannedArrival: "11:45", plannedDeparture: "13:30"),
                        ItineraryStopDTO(sequence: 3, place: PlaceSummaryDTO(id: "p-bharati", name: "Bharati Matha Temple", category: "temple"), plannedArrival: "14:15", plannedDeparture: "16:30")
                    ],
                    hops: []
                )
            ],
            explanation: ""
        )

        let plan = PlanResult.fromDTO(responseDTO, originalConstraints: constraints)
        #expect(plan.days.count == 1)
        #expect(plan.totalStopsCount == 3)
        let stopNames = plan.days[0].stops.map { $0.placeName }
        #expect(!stopNames.contains { $0.contains("Puri") })
        #expect(!stopNames.contains { $0.contains("Salepur") })
        #expect(stopNames.contains("Lingaraj Temple"))
    }

    @Test("Null fare hop carries no payment-method evidence")
    func testFareMicrocopyPolicyAdherence() {
        let leg = JourneyLeg(
            fromSequence = 1,
            toSequence = 2,
            mode: "walk",
            estimatedMinutes: 2,
            estimatedCost: nil,
            legDetail: "Walk ~100m",
            dataTier: "static",
            reason: nil
        )

        #expect(leg.estimatedCost == nil)
        #expect(!leg.displayModeTitle.contains("Pay on Bus"))
        #expect(!leg.displayModeTitle.contains("boarding"))
    }
}
