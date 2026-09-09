package com.otravelz.android.data.repository

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.OTravelzApiService
import com.otravelz.android.domain.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository providing verified emergency helplines, civic facilities, and living artisan clusters.
 * Offline-resilient: State emergency numbers and artisan clusters are bundled and 100% accessible offline.
 */
class EssentialsRepository(
    private val apiService: OTravelzApiService = ApiClient.createService()
) {
    companion object {
        @Volatile
        private var INSTANCE: EssentialsRepository? = null

        fun getInstance(apiService: OTravelzApiService = ApiClient.createService()): EssentialsRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: EssentialsRepository(apiService).also { INSTANCE = it }
            }
        }

        val STATE_EMERGENCY_HELPLINES = listOf(
            EmergencyHelpline(
                id = "helpline-112",
                label = "All-India Emergency",
                number = "112",
                description = "Unified national emergency helpline for Police, Fire, and Ambulance",
                is24x7 = true,
                serviceType = "ALL_INDIA"
            ),
            EmergencyHelpline(
                id = "helpline-108",
                label = "Medical & Ambulance",
                number = "108",
                description = "Free emergency medical transportation and ambulance response across Odisha",
                is24x7 = true,
                serviceType = "MEDICAL"
            ),
            EmergencyHelpline(
                id = "helpline-1363",
                label = "National Tourist Helpline",
                number = "1363",
                description = "24x7 toll-free multi-language tourist information and emergency guidance",
                is24x7 = true,
                serviceType = "TOURIST_POLICE"
            ),
            EmergencyHelpline(
                id = "helpline-tourist-police-odisha",
                label = "Odisha Tourist Police",
                number = "0674-2396996",
                description = "Odisha Tourism Police Cell, Bhubaneswar headquarters for traveler safety",
                is24x7 = true,
                serviceType = "TOURIST_POLICE"
            ),
            EmergencyHelpline(
                id = "helpline-181",
                label = "Women Helpline",
                number = "181",
                description = "24x7 support, counseling, and crisis response for women travelers",
                is24x7 = true,
                serviceType = "WOMEN"
            ),
            EmergencyHelpline(
                id = "helpline-101",
                label = "Fire Control",
                number = "101",
                description = "Odisha Fire and Disaster Response Services",
                is24x7 = true,
                serviceType = "FIRE"
            ),
            EmergencyHelpline(
                id = "helpline-1033",
                label = "National Highway Emergency",
                number = "1033",
                description = "NHAI 24x7 road assistance, tow trucks, and accident response on highways",
                is24x7 = true,
                serviceType = "HIGHWAY"
            ),
            EmergencyHelpline(
                id = "helpline-1098",
                label = "Child Helpline",
                number = "1098",
                description = "Emergency response and protective care for children in distress",
                is24x7 = true,
                serviceType = "CHILD"
            )
        )

        val CANONICAL_ARTISAN_CLUSTERS = listOf(
            ArtisanCluster(
                id = "cluster-raghurajpur",
                name = "Raghurajpur Heritage Craft Village",
                odiaName = "ରଘୁରାଜପୁର ହେରିଟେଜ୍ କ୍ରାଫ୍ଟ ଭିଲେଜ୍",
                district = "Puri",
                craftName = "Pattachitra & Palm-Leaf Engraving",
                description = "Odisha's premier living heritage village where every family practices traditional Pattachitra painting, palm-leaf Tala Pattachitra engraving, and cow-dung toys. A living museum preserved under INTACH heritage auspices.",
                canonicalPlaceId = "raghurajpur-heritage-craft-village",
                heroImageUrl = "/images/destinations/raghurajpur_craft_village.webp",
                giTagged = true
            ),
            ArtisanCluster(
                id = "cluster-pipili",
                name = "Pipili Applique Village",
                odiaName = "ପିପିଲି ଚାନ୍ଦୁଆ ଗ୍ରାମ",
                district = "Puri",
                craftName = "Chandua (Applique & Patchwork)",
                description = "Historic artisan corridor world-renowned for vibrant Chandua applique canopies, chhatris, and wall hangings crafted for Puri Jagannath Temple Rath Yatra traditions since the 12th century.",
                canonicalPlaceId = "pipili-applique-village",
                heroImageUrl = "/images/destinations/pipili_applique_village.webp",
                giTagged = true
            ),
            ArtisanCluster(
                id = "cluster-cuttack-tarakasi",
                name = "Cuttack Silver Filigree Hub",
                odiaName = "କଟକ ତାରକସି ହବ୍",
                district = "Cuttack",
                craftName = "Tarakasi (Fine Silver Filigree)",
                description = "Centuries-old craft enclave renowned for exquisite hair-thin silver wire jewelry, miniature Rathas, and Durga Puja decorative tableaux (Chandi Medha). Recently accorded the prestigious Geographical Indication (GI) tag.",
                canonicalPlaceId = "cuttack-chandi-temple",
                heroImageUrl = "/images/destinations/cuttack_silver_filigree.webp",
                giTagged = true
            ),
            ArtisanCluster(
                id = "cluster-ekamra-haat",
                name = "Ekamra Haat Cultural Center",
                odiaName = "ଏକାମ୍ର ହାଟ",
                district = "Khordha",
                craftName = "Statewide Living Crafts & Handloom Hub",
                description = "Central urban cultural village in Bhubaneswar featuring over 40 artisan cottages exhibiting genuine handloom and handicrafts from all 30 districts of Odisha directly from master weavers and artisans.",
                canonicalPlaceId = "kala-bhoomi-odisha-crafts-museum",
                heroImageUrl = "/images/destinations/ekamra_haat.webp",
                giTagged = false
            ),
            ArtisanCluster(
                id = "cluster-sambalpur-ikat",
                name = "Sambalpur Handloom & Ikat Cluster",
                odiaName = "ସମ୍ବଲପୁର ବାନ୍ଧ ହ୍ୟାଣ୍ଡଲୁମ୍ କ୍ଲଷ୍ଟର",
                district = "Sambalpur",
                craftName = "Sambalpuri Bandha (Weft & Warp Ikat)",
                description = "Famous Western Odisha weaving sanctuary known for tie-dye warp and weft silk and cotton sarees, featuring traditional shankha, chakra, and flora motifs woven by generations of Bhulia master weavers.",
                canonicalPlaceId = "samaleswari-temple",
                heroImageUrl = "/images/destinations/sambalpur_ikat.webp",
                giTagged = true
            ),
            ArtisanCluster(
                id = "cluster-kantilo",
                name = "Kantilo Bell Metal Enclave",
                odiaName = "କଣ୍ଟିଲୋ କଂସାରୀ ହବ୍",
                district = "Nayagarh",
                craftName = "Kansari Bell Metal & Brass Craft",
                description = "Centuries-old artisan hub on the banks of the Mahanadi, famous for handcrafted Kansari brass utensils, ceremonial temple bells, and bronze singing bowls created by indigenous casting techniques.",
                canonicalPlaceId = "kantilo-nilamadhaba-temple",
                heroImageUrl = "/images/destinations/kantilo_bell_metal.webp",
                giTagged = false
            )
        )
    }

    fun getEmergencyHelplines(): List<EmergencyHelpline> = STATE_EMERGENCY_HELPLINES

    fun getArtisanClusters(): List<ArtisanCluster> = CANONICAL_ARTISAN_CLUSTERS

    suspend fun getNearbyServices(
        lat: Double,
        lon: Double,
        category: CivicCategory = CivicCategory.ALL,
        radiusKm: Double = 15.0
    ): Result<List<CivicServiceItem>> = withContext(Dispatchers.IO) {
        try {
            val catParam = if (category == CivicCategory.ALL) null else category.apiKey
            val response = apiService.getNearbyServices(
                lat = lat,
                lon = lon,
                category = catParam,
                radiusKm = radiusKm
            )

            val items = response.services.map { dto ->
                CivicServiceItem(
                    id = dto.id,
                    name = dto.name,
                    category = CivicCategory.fromApiKey(dto.category),
                    subcategory = "",
                    district = "",
                    address = dto.address ?: "",
                    phone = dto.phone,
                    lat = dto.lat,
                    lon = dto.lon,
                    distanceKm = dto.distanceKm,
                    distanceFormatted = dto.distanceKm?.let {
                        if (it < 1.0) "${(it * 1000).toInt()} m" else "%.1f km".format(java.util.Locale.US, it)
                    } ?: "",
                    is24x7 = dto.category == "police" || dto.category == "healthcare"
                )
            }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
