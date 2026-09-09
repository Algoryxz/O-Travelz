import Testing
import Foundation
@testable import OTravelz

@Suite("Wave M15 Emergency Essentials, Civic Contacts & Artisan Clusters Tests")
struct EssentialsDomainTests {

    @Test("Verified 8 State and National Emergency Helplines")
    func testEmergencyHelplinesIntegrity() {
        let helplines = EssentialsRepository.shared.getEmergencyHelplines()
        #expect(helplines.count == 8)

        let numbers = helplines.map { $0.number }
        #expect(numbers.contains("112"))
        #expect(numbers.contains("108"))
        #expect(numbers.contains("1363"))
        #expect(numbers.contains("0674-2396996"))
        #expect(numbers.contains("181"))
        #expect(numbers.contains("101"))
        #expect(numbers.contains("1033"))
        #expect(numbers.contains("1098"))

        // Security check: phone numbers must sanitize safely for tel: URI
        for helpline in helplines {
            let sanitized = helpline.number.filter { $0.isNumber || $0 == "+" }
            #expect(!sanitized.isEmpty)
            #expect(!helpline.label.isEmpty)
            #expect(!helpline.description.isEmpty)
        }
    }

    @Test("Verified 6 Canonical Living Heritage Artisan Clusters")
    func testArtisanClustersIntegrity() {
        let clusters = EssentialsRepository.shared.getArtisanClusters()
        #expect(clusters.count == 6)

        let ids = clusters.map { $0.id }
        #expect(ids.contains("cluster-raghurajpur"))
        #expect(ids.contains("cluster-pipili"))
        #expect(ids.contains("cluster-cuttack-tarakasi"))
        #expect(ids.contains("cluster-ekamra-haat"))
        #expect(ids.contains("cluster-sambalpur-ikat"))
        #expect(ids.contains("cluster-kantilo"))

        // Check GI tag truth
        let raghurajpur = clusters.first { $0.id == "cluster-raghurajpur" }!
        #expect(raghurajpur.giTagged == true)
        #expect(raghurajpur.district == "Puri")
        #expect(raghurajpur.canonicalPlaceId == "raghurajpur-heritage-craft-village")

        let pipili = clusters.first { $0.id == "cluster-pipili" }!
        #expect(pipili.giTagged == true)
        #expect(pipili.district == "Puri")

        let tarakasi = clusters.first { $0.id == "cluster-cuttack-tarakasi" }!
        #expect(tarakasi.giTagged == true)
        #expect(tarakasi.district == "Cuttack")

        let ikat = clusters.first { $0.id == "cluster-sambalpur-ikat" }!
        #expect(ikat.giTagged == true)
        #expect(ikat.district == "Sambalpur")

        // Narrative truth
        for cluster in clusters {
            #expect(!cluster.odiaName.isEmpty)
            #expect(!cluster.craftName.isEmpty)
            #expect(cluster.description.count > 20)
        }
    }

    @Test("Civic Category API Mapping and System Icons")
    func testCivicCategoryMapping() {
        #expect(CivicCategory.fromApiKey("healthcare") == .healthcare)
        #expect(CivicCategory.fromApiKey("HEALTHCARE") == .healthcare)
        #expect(CivicCategory.fromApiKey("police") == .police)
        #expect(CivicCategory.fromApiKey("fuel") == .fuel)
        #expect(CivicCategory.fromApiKey("atm") == .atm)
        #expect(CivicCategory.fromApiKey("transit") == .transit)
        #expect(CivicCategory.fromApiKey("all") == .all)
        #expect(CivicCategory.fromApiKey("unknown_xyz") == .all)

        #expect(CivicCategory.healthcare.systemIcon == "cross.case.fill")
        #expect(CivicCategory.police.systemIcon == "shield.fill")
        #expect(CivicCategory.fuel.systemIcon == "fuelpump.fill")
        #expect(CivicCategory.atm.systemIcon == "banknote.fill")
        #expect(CivicCategory.transit.systemIcon == "bus.fill")
    }

    @Test("Civic Service Item Phone Sanitization & Formatting")
    func testCivicServiceItemFormatting() {
        let item = CivicServiceItem(
            id = "svc-01",
            name = "SCB Medical College & Hospital",
            category = .healthcare,
            district = "Cuttack",
            address = "Mangalabag, Cuttack",
            phone = "0671-2414080",
            lat = 20.4625,
            lon = 85.8828,
            distanceKm = 2.4,
            distanceFormatted = "2.4 km away",
            is24x7 = true
        )

        let sanitized = item.phone?.filter { $0.isNumber || $0 == "+" }
        #expect(sanitized == "06712414080")
        #expect(item.distanceFormatted == "2.4 km away")
        #expect(item.is24x7 == true)
    }

    @Test("Offline Resilience Invariants")
    func testOfflineResilienceInvariants() {
        let helplines = EssentialsRepository.shared.getEmergencyHelplines()
        let clusters = EssentialsRepository.shared.getArtisanClusters()

        #expect(!helplines.isEmpty)
        #expect(!clusters.isEmpty)
    }
}
