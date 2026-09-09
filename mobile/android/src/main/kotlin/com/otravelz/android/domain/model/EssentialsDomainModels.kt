package com.otravelz.android.domain.model

/**
 * Domain models for Wave M15 Emergency Essentials, Civic Contacts, and Artisan Clusters.
 */

data class EmergencyHelpline(
    val id: String,
    val label: String,
    val number: String,
    val description: String,
    val is24x7: Boolean = true,
    val serviceType: String // e.g. "ALL_INDIA", "MEDICAL", "TOURIST_POLICE", "WOMEN", "FIRE"
)

enum class CivicCategory(val apiKey: String, val displayName: String) {
    ALL("all", "All"),
    HEALTHCARE("healthcare", "Hospitals"),
    POLICE("police", "Police"),
    FUEL("fuel", "Fuel"),
    ATM("atm", "ATMs"),
    TRANSIT("transit", "Transit");

    companion object {
        fun fromApiKey(key: String): CivicCategory {
            return entries.firstOrNull { it.apiKey.equals(key, ignoreCase = true) } ?: ALL
        }
    }
}

data class CivicServiceItem(
    val id: String,
    val name: String,
    val category: CivicCategory,
    val subcategory: String = "",
    val district: String = "",
    val address: String = "",
    val phone: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val distanceKm: Double? = null,
    val distanceFormatted: String = "",
    val is24x7: Boolean = false
)

data class ArtisanCluster(
    val id: String,
    val name: String,
    val odiaName: String,
    val district: String,
    val craftName: String,
    val description: String,
    val canonicalPlaceId: String? = null,
    val heroImageUrl: String? = null,
    val giTagged: Boolean = false
)
