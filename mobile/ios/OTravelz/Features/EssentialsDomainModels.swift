import Foundation

// MARK: - Domain Models for Wave M15 Emergency Essentials & Artisan Clusters

public struct EmergencyHelpline: Identifiable, Sendable, Hashable {
    public let id: String
    public let label: String
    public let number: String
    public let description: String
    public let is24x7: Bool
    public let serviceType: String

    public init(
        id: String,
        label: String,
        number: String,
        description: String,
        is24x7: Bool = true,
        serviceType: String
    ) {
        self.id = id
        self.label = label
        self.number = number
        self.description = description
        self.is24x7 = is24x7
        self.serviceType = serviceType
    }
}

public enum CivicCategory: String, Sendable, CaseIterable, Identifiable {
    case all = "all"
    case healthcare = "healthcare"
    case police = "police"
    case fuel = "fuel"
    case atm = "atm"
    case transit = "transit"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .all: return "All"
        case .healthcare: return "Hospitals"
        case .police: return "Police"
        case .fuel: return "Fuel"
        case .atm: return "ATMs"
        case .transit: return "Transit"
        }
    }

    public var systemIcon: String {
        switch self {
        case .all, .healthcare: return "cross.case.fill"
        case .police: return "shield.fill"
        case .fuel: return "fuelpump.fill"
        case .atm: return "banknote.fill"
        case .transit: return "bus.fill"
        }
    }

    public static func fromApiKey(_ key: String) -> CivicCategory {
        CivicCategory(rawValue: key.lowercased()) ?? .all
    }
}

public struct CivicServiceItem: Identifiable, Sendable, Hashable {
    public let id: String
    public let name: String
    public let category: CivicCategory
    public let district: String
    public let address: String
    public let phone: String?
    public let lat: Double?
    public let lon: Double?
    public let distanceKm: Double?
    public let distanceFormatted: String
    public let is24x7: Bool

    public init(
        id: String,
        name: String,
        category: CivicCategory,
        district: String = "",
        address: String = "",
        phone: String? = nil,
        lat: Double? = nil,
        lon: Double? = nil,
        distanceKm: Double? = nil,
        distanceFormatted: String = "",
        is24x7: Bool = false
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.district = district
        self.address = address
        self.phone = phone
        self.lat = lat
        self.lon = lon
        self.distanceKm = distanceKm
        self.distanceFormatted = distanceFormatted
        self.is24x7 = is24x7
    }
}

public struct ArtisanCluster: Identifiable, Sendable, Hashable {
    public let id: String
    public let name: String
    public let odiaName: String
    public let district: String
    public let craftName: String
    public let description: String
    public let canonicalPlaceId: String?
    public let heroImageUrl: String?
    public let giTagged: Bool

    public init(
        id: String,
        name: String,
        odiaName: String,
        district: String,
        craftName: String,
        description: String,
        canonicalPlaceId: String? = nil,
        heroImageUrl: String? = nil,
        giTagged: Bool = false
    ) {
        self.id = id
        self.name = name
        self.odiaName = odiaName
        self.district = district
        self.craftName = craftName
        self.description = description
        self.canonicalPlaceId = canonicalPlaceId
        self.heroImageUrl = heroImageUrl
        self.giTagged = giTagged
    }
}

// MARK: - Essentials Repository

public final class EssentialsRepository: Sendable {
    public static let shared = EssentialsRepository()

    private let helplines: [EmergencyHelpline] = [
        EmergencyHelpline(
            id: "hl-112",
            label: "National Emergency Service",
            number: "112",
            description: "Unified national emergency helpline for police, fire, medical, and SDRF across Odisha.",
            is24x7: true,
            serviceType: "ALL_INDIA"
        ),
        EmergencyHelpline(
            id: "hl-108",
            label: "Emergency Medical Ambulance",
            number: "108",
            description: "Odisha free emergency medical transport & life support service.",
            is24x7: true,
            serviceType: "MEDICAL"
        ),
        EmergencyHelpline(
            id: "hl-1363",
            label: "National Tourist Helpline",
            number: "1363",
            description: "Ministry of Tourism multi-lingual 24x7 guidance and emergency assistance for travelers.",
            is24x7: true,
            serviceType: "TOURIST"
        ),
        EmergencyHelpline(
            id: "hl-odisha-tourist",
            label: "Odisha Tourist Police / Helpline",
            number: "0674-2396996",
            description: "Odisha Tourism Department state traveler assistance and tourist police desk.",
            is24x7: true,
            serviceType: "TOURIST_POLICE"
        ),
        EmergencyHelpline(
            id: "hl-181",
            label: "Women Helpline (Odisha)",
            number: "181",
            description: "Toll-free 24-hour emergency support, counseling, and crisis response for women.",
            is24x7: true,
            serviceType: "WOMEN"
        ),
        EmergencyHelpline(
            id: "hl-101",
            label: "Fire & Rescue Service",
            number: "101",
            description: "Odisha Fire and Disaster Response Services for fire breakouts and aquatic rescue.",
            is24x7: true,
            serviceType: "FIRE"
        ),
        EmergencyHelpline(
            id: "hl-1033",
            label: "National Highway Emergency (NHAI)",
            number: "1033",
            description: "Emergency road assistance, route patrol, and medical dispatch along national corridors in Odisha.",
            is24x7: true,
            serviceType: "HIGHWAY"
        ),
        EmergencyHelpline(
            id: "hl-1098",
            label: "Childline Emergency Support",
            number: "1098",
            description: "24-hour free emergency service for children in need of assistance and protection.",
            is24x7: true,
            serviceType: "CHILDREN"
        )
    ]

    private let artisanClusters: [ArtisanCluster] = [
        ArtisanCluster(
            id: "cluster-raghurajpur",
            name: "Raghurajpur Heritage Crafts Village",
            odiaName: "ରଘୁରାଜପୁର ହେରିଟେଜ୍ ଗ୍ରାମ",
            district: "Puri",
            craftName: "Pattachitra & Palm Leaf Engraving",
            description: "World-renowned living heritage village where every family practices traditional Pattachitra cloth painting, palm-leaf carving (Talapatra Chitra), and Ganjifa cards. Dedicated as an INTACH heritage crafts village.",
            canonicalPlaceId: "raghurajpur-heritage-craft-village",
            giTagged: true
        ),
        ArtisanCluster(
            id: "cluster-pipili",
            name: "Pipili Applique Enclave",
            odiaName: "ପିପିଲି ଚାନ୍ଦୁଆ କଳା",
            district: "Puri",
            craftName: "Chandua Applique Heritage",
            description: "Historic craft settlement founded under the patronage of Gajapati Kings to craft ceremonial canopies (Chandua), banners, and umbrellas for Lord Jagannath's annual Rath Yatra.",
            canonicalPlaceId: "pipili-applique-village",
            giTagged: true
        ),
        ArtisanCluster(
            id: "cluster-cuttack-tarakasi",
            name: "Cuttack Silver Filigree (Tarakasi)",
            odiaName: "କଟକ ତାରକସି କଳା",
            district: "Cuttack",
            craftName: "Tarakasi Fine Silver Filigree",
            description: "Over 500-year-old maritime craft legacy of drawing fine silver wires into intricate jewelry, Durga Puja medhas, and maritime Boita models. Awarded GI tag recognition.",
            canonicalPlaceId: "cuttack-chandi-temple",
            giTagged: true
        ),
        ArtisanCluster(
            id: "cluster-ekamra-haat",
            name: "Ekamra Haat Cultural Marketplace",
            odiaName: "ଏକାମ୍ର ହାଟ କଳାକେନ୍ଦ୍ର",
            district: "Khordha",
            craftName: "Pan-Odisha Handlooms & Terracotta",
            description: "Curated open-air artisanal village in Bhubaneswar showcasing authentic master weavers, terracotta artisans, Dokra metal casters, and stone sculptors directly from all 30 districts.",
            canonicalPlaceId: "kala-bhoomi-odisha-crafts-museum",
            giTagged: false
        ),
        ArtisanCluster(
            id: "cluster-sambalpur-ikat",
            name: "Sambalpur Ikat Handloom Belt",
            odiaName: "ସମ୍ବଲପୁରୀ ଇକତ ବନ୍ଧ ବସ୍ତ୍ର",
            district: "Sambalpur",
            craftName: "Bandha Tie-Dye Weaving",
            description: "Famed western Odisha weaving heartland producing Sambalpuri Saree and textile masterworks using mathematical tie-and-dye Ikat resist dyeing technique. Awarded GI status.",
            canonicalPlaceId: "samaleswari-temple",
            giTagged: true
        ),
        ArtisanCluster(
            id: "cluster-kantilo",
            name: "Kantilo Brass & Bell Metal Enclave",
            odiaName: "କଣ୍ଟିଲୋ କଂସା ଓ ପିତ୍ତଳ କଳା",
            district: "Nayagarh",
            craftName: "Kansa & Pital Casting",
            description: "Ancient Mahanadi riverbank cluster producing traditional bronze, bell-metal (Kansa), and brass ritual vessels and culinary utensils forged by generations of Kansari smiths.",
            canonicalPlaceId: "kantilo-nilamadhaba-temple",
            giTagged: false
        )
    ]

    public func getEmergencyHelplines() -> [EmergencyHelpline] {
        helplines
    }

    public func getArtisanClusters() -> [ArtisanCluster] {
        artisanClusters
    }

    public func getNearbyServices(lat: Double, lon: Double, category: CivicCategory = .all) async throws -> [CivicServiceItem] {
        let catParam: String? = category == .all ? nil : category.rawValue
        let response = try await APIClient.shared.getNearbyServices(lat: lat, lon: lon, category: catParam)

        return response.services.map { s in
            let itemCategory = CivicCategory.fromApiKey(s.category)
            let formattedDist: String
            if let km = s.distanceKm {
                if km < 1.0 {
                    formattedDist = String(format: "%.0f m away", km * 1000.0)
                } else {
                    formattedDist = String(format: "%.1f km away", km)
                }
            } else {
                formattedDist = ""
            }

            return CivicServiceItem(
                id: s.id,
                name: s.name,
                category: itemCategory,
                district: "",
                address: s.address ?? "",
                phone: s.phone,
                lat: s.lat,
                lon: s.lon,
                distanceKm: s.distanceKm,
                distanceFormatted: formattedDist,
                is24x7: itemCategory == .healthcare || itemCategory == .police
            )
        }
    }
}
