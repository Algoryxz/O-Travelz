package com.otravelz.android.data.repository

import com.otravelz.android.core.location.FirstMileEstimator

data class CivicEssentialItem(
    val id: String,
    val name: String,
    val category: CivicCategory,
    val district: String,
    val address: String,
    val phoneNumber: String?,
    val lat: Double,
    val lon: Double,
    val isOpen24x7: Boolean = true
)

enum class CivicCategory(val displayName: String, val iconName: String) {
    HOSPITAL("Hospital / Medical", "LocalHospital"),
    POLICE("Police Station", "LocalPolice"),
    FUEL("Fuel / EV Station", "LocalGasStation"),
    ATM("ATM / Banking", "LocalAtm")
}

class CivicEssentialsRepository {

    private val canonicalCivicItems = listOf(
        // Hospitals
        CivicEssentialItem(
            id = "aiims_bbsr",
            name = "AIIMS Hospital Bhubaneswar",
            category = CivicCategory.HOSPITAL,
            district = "Khordha",
            address = "Sijua, Patrapada, Bhubaneswar, Odisha 751019",
            phoneNumber = "0674-2476789",
            lat = 20.2312,
            lon = 85.7766,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "capital_hospital_bbsr",
            name = "Capital Hospital Bhubaneswar",
            category = CivicCategory.HOSPITAL,
            district = "Khordha",
            address = "Unit 6, Ganga Nagar, Bhubaneswar, Odisha 751001",
            phoneNumber = "0674-2391983",
            lat = 20.2667,
            lon = 85.8236,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "scb_medical_cuttack",
            name = "SCB Medical College & Hospital",
            category = CivicCategory.HOSPITAL,
            district = "Cuttack",
            address = "Manglabag, Cuttack, Odisha 753007",
            phoneNumber = "0671-2414080",
            lat = 20.4625,
            lon = 85.8906,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "dhh_puri",
            name = "District Headquarter Hospital Puri",
            category = CivicCategory.HOSPITAL,
            district = "Puri",
            address = "Hospital Square, Grand Road, Puri, Odisha 752001",
            phoneNumber = "06752-222053",
            lat = 19.8135,
            lon = 85.8312,
            isOpen24x7 = true
        ),

        // Police
        CivicEssentialItem(
            id = "police_emergency_112",
            name = "Odisha Police Emergency Control Room",
            category = CivicCategory.POLICE,
            district = "Statewide",
            address = "State Police HQ, Cuttack / Commissionerate BBSR",
            phoneNumber = "112",
            lat = 20.2961,
            lon = 85.8245,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "tourist_police_puri",
            name = "Puri Sea Beach Tourist Police Outpost",
            category = CivicCategory.POLICE,
            district = "Puri",
            address = "Chakratirtha Road, Sea Beach, Puri",
            phoneNumber = "06752-222074",
            lat = 19.7983,
            lon = 85.8250,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "capital_police_bbsr",
            name = "Capital Police Station Unit-1",
            category = CivicCategory.POLICE,
            district = "Khordha",
            address = "Unit 1, Rajpath, Bhubaneswar",
            phoneNumber = "0674-2533722",
            lat = 20.2705,
            lon = 85.8398,
            isOpen24x7 = true
        ),

        // Fuel
        CivicEssentialItem(
            id = "ioc_rajpath_bbsr",
            name = "Indian Oil Auto Care & EV Center",
            category = CivicCategory.FUEL,
            district = "Khordha",
            address = "Janpath, Master Canteen, Bhubaneswar",
            phoneNumber = null,
            lat = 20.2685,
            lon = 85.8423,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "hp_grand_road_puri",
            name = "HP Fuel Center Grand Road",
            category = CivicCategory.FUEL,
            district = "Puri",
            address = "Bada Danda, Puri",
            phoneNumber = null,
            lat = 19.8080,
            lon = 85.8285,
            isOpen24x7 = true
        ),

        // ATM
        CivicEssentialItem(
            id = "sbi_master_canteen_bbsr",
            name = "SBI 24x7 Cash Point & CDM",
            category = CivicCategory.ATM,
            district = "Khordha",
            address = "Master Canteen Square, Bhubaneswar",
            phoneNumber = null,
            lat = 20.2662,
            lon = 85.8436,
            isOpen24x7 = true
        ),
        CivicEssentialItem(
            id = "sbi_puri_temple_square",
            name = "SBI Jagannath Temple Square ATM",
            category = CivicCategory.ATM,
            district = "Puri",
            address = "Singhadwara, Puri",
            phoneNumber = null,
            lat = 19.8050,
            lon = 85.8180,
            isOpen24x7 = true
        )
    )

    fun getItems(category: CivicCategory? = null): List<CivicEssentialItem> {
        return if (category == null) canonicalCivicItems else canonicalCivicItems.filter { it.category == category }
    }

    fun getItemsSortedByDistance(
        category: CivicCategory? = null,
        originLat: Double,
        originLon: Double
    ): List<Pair<CivicEssentialItem, Double>> {
        val items = getItems(category)
        return items.map { item ->
            val distKm = FirstMileEstimator.calculateHaversineDistanceKm(
                originLat, originLon, item.lat, item.lon
            )
            item to distKm
        }.sortedBy { it.second }
    }
}
