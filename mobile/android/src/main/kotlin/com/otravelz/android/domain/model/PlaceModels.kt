package com.otravelz.android.domain.model

import com.otravelz.android.data.network.ApiConfig
import com.otravelz.android.data.network.dto.PlaceDto
import com.otravelz.android.data.network.dto.PlaceImageDto

/**
 * Domain representation of a verified authentic destination photograph.
 * Strictly implements photo source-identity deduplication:
 * Responsive variants (hero, card, thumbnail) belong to one source photo.
 */
data class PlacePhoto(
    val url: String,
    val cardUrl: String?,
    val thumbnailUrl: String?,
    val altText: String?,
    val title: String?,
    val sourceName: String?,
    val license: String?,
    val attribution: String?,
    val isPrimary: Boolean
) {
    /**
     * Resolves relative or absolute image URL against the API base URL.
     */
    val resolvedCardUrl: String
        get() = resolveUrl(cardUrl ?: thumbnailUrl ?: url)

    val resolvedHeroUrl: String
        get() = resolveUrl(url)

    val resolvedThumbnailUrl: String
        get() = resolveUrl(thumbnailUrl ?: cardUrl ?: url)

    private fun resolveUrl(raw: String): String {
        return if (raw.startsWith("http://") || raw.startsWith("https://")) {
            raw
        } else {
            val base = ApiConfig.DEFAULT_BASE_URL.trimEnd('/')
            val path = raw.trimStart('/')
            "$base/$path"
        }
    }
}

/**
 * Lean domain model for Discover catalog listings and cards.
 */
data class DiscoverPlace(
    val id: String,
    val name: String,
    val odiaName: String?,
    val category: String,
    val district: String?,
    val region: String?,
    val description: String?,
    val verificationStatus: String?,
    val primaryPhoto: PlacePhoto?,
    val verifiedPhotoCount: Int
) {
    val isEligibleLeisure: Boolean
        get() = !EXCLUDED_NON_LEISURE_CATEGORIES.contains(category.lowercase().trim())

    companion object {
        val EXCLUDED_NON_LEISURE_CATEGORIES = setOf(
            "hospital", "medical", "clinic", "transit", "transit_hub",
            "bus_stop", "train_station", "railway_station"
        )
    }
}

/**
 * Rich domain model for Place Detail inspection.
 */
data class PlaceDetail(
    val id: String,
    val name: String,
    val odiaName: String?,
    val category: String,
    val district: String?,
    val region: String?,
    val description: String?,
    val lat: Double?,
    val lon: Double?,
    val avgVisitMinutes: Int?,
    val priceTier: String?,
    val address: String?,
    val contactPhone: String?,
    val emergencyPhone: String?,
    val source: String?,
    val sourceUrl: String?,
    val verifiedAt: String?,
    val verificationStatus: String?,
    val photos: List<PlacePhoto>
) {
    val hasCoordinates: Boolean
        get() = lat != null && lon != null

    val primaryPhoto: PlacePhoto?
        get() = photos.firstOrNull { it.isPrimary } ?: photos.firstOrNull()
}

/**
 * Deduplicates raw DTO image list into distinct source photos.
 * Ensures responsive variants sharing the same canonical asset are not counted as separate photos.
 */
fun List<PlaceImageDto>?.toDomainPhotos(): List<PlacePhoto> {
    if (this == null) return emptyList()
    val verified = filter { it.status?.lowercase() == "verified" || it.status == null || it.isPrimary }
    val seenPaths = mutableSetOf<String>()
    val result = mutableListOf<PlacePhoto>()

    for (dto in verified) {
        val key = extractSourceIdentity(dto.url)
        if (seenPaths.add(key)) {
            result.add(
                PlacePhoto(
                    url = dto.url,
                    cardUrl = dto.cardUrl,
                    thumbnailUrl = dto.thumbnailUrl,
                    altText = dto.altText,
                    title = dto.title,
                    sourceName = dto.sourceName,
                    license = dto.license,
                    attribution = dto.attribution,
                    isPrimary = dto.isPrimary
                )
            )
        }
    }
    return result
}

private fun extractSourceIdentity(url: String): String {
    val parts = url.replace('\\', '/').split('/')
    return if (parts.size >= 3) {
        parts.dropLast(1).takeLast(2).joinToString("/")
    } else {
        url
    }
}

fun PlaceDto.toDiscoverPlace(): DiscoverPlace {
    val domainPhotos = images.toDomainPhotos()
    val primary = domainPhotos.firstOrNull { it.isPrimary } ?: domainPhotos.firstOrNull()
    return DiscoverPlace(
        id = id,
        name = name,
        odiaName = localizedNames?.or,
        category = category,
        district = district,
        region = region,
        description = description,
        verificationStatus = verificationStatus,
        primaryPhoto = primary,
        verifiedPhotoCount = domainPhotos.size
    )
}

fun PlaceDto.toPlaceDetail(): PlaceDetail {
    val domainPhotos = images.toDomainPhotos()
    return PlaceDetail(
        id = id,
        name = name,
        odiaName = localizedNames?.or,
        category = category,
        district = district,
        region = region,
        description = description,
        lat = lat,
        lon = lon,
        avgVisitMinutes = avgVisitMinutes,
        priceTier = priceTier,
        address = address,
        contactPhone = contactPhone,
        emergencyPhone = emergencyPhone,
        source = source,
        sourceUrl = sourceUrl,
        verifiedAt = null,
        verificationStatus = verificationStatus,
        photos = domainPhotos
    )
}
