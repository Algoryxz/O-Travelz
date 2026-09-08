package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PlaceImageDto(
    val url: String,
    @SerialName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerialName("card_url") val cardUrl: String? = null,
    @SerialName("alt_text") val altText: String? = null,
    val title: String? = null,
    @SerialName("source_name") val sourceName: String? = null,
    val license: String? = null,
    val attribution: String? = null,
    val status: String? = "verified",
    @SerialName("is_primary") val isPrimary: Boolean = false
)

@Serializable
data class LocalizedNamesDto(
    val en: String? = null,
    val or: String? = null,
    val hi: String? = null
)

@Serializable
data class PlaceDto(
    val id: String,
    @SerialName("research_id") val researchId: String? = null,
    val name: String,
    val category: String,
    val description: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val district: String? = null,
    val region: String? = null,
    @SerialName("avg_visit_minutes") val avgVisitMinutes: Int? = null,
    @SerialName("price_tier") val priceTier: String? = null,
    val rating: Double? = null,
    @SerialName("rating_count") val ratingCount: Int? = null,
    @SerialName("rating_source") val ratingSource: String? = null,
    @SerialName("opening_hours_source") val openingHoursSource: String? = null,
    val interests: List<String> = emptyList(),
    val source: String? = null,
    @SerialName("source_url") val sourceUrl: String? = null,
    @SerialName("verified_at") val verifiedAt: String? = null,
    @SerialName("verification_status") val verificationStatus: String? = null,
    @SerialName("contact_phone") val contactPhone: String? = null,
    @SerialName("emergency_phone") val emergencyPhone: String? = null,
    val address: String? = null,
    val images: List<PlaceImageDto> = emptyList(),
    @SerialName("localized_names") val localizedNames: LocalizedNamesDto? = null,
    val confidence: String? = null
)
