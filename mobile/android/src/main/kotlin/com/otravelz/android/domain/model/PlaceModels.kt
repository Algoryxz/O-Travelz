package com.otravelz.android.domain.model

import com.otravelz.android.data.network.ApiConfig
import com.otravelz.android.data.network.dto.PlaceDto
import com.otravelz.android.data.network.dto.PlaceImageDto
import com.otravelz.shared.geo.HaversineDistance

/**
 * Domain representation of a verified authentic destination photograph.
 * Strictly implements photo source-identity deduplication:
 * Responsive variants (hero, card, thumbnail) belong to one source photo.
 */
data class PlacePhoto(
    val id: String? = null,
    val mediaAssetId: String? = null,
    val contentSha256: String? = null,
    val assetHash: String? = null,
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
 * Lean domain model for Discover catalog listings, search, and spatial filtering.
 */
data class DiscoverPlace(
    val id: String,
    val name: String,
    val odiaName: String? = null,
    val category: String,
    val district: String? = null,
    val region: String? = null,
    val description: String? = null,
    val lat: Double? = null,
    val lon: Double? = null,
    val verificationStatus: String? = null,
    val primaryPhoto: PlacePhoto? = null,
    val verifiedPhotoCount: Int = 0
) {
    val isEligibleLeisure: Boolean
        get() = !EXCLUDED_NON_LEISURE_CATEGORIES.contains(category.lowercase().trim())

    val hasCoordinates: Boolean
        get() = lat != null && lon != null

    val normalizedDistrict: String?
        get() = when (district?.trim()?.lowercase()) {
            "kendujhar" -> "Keonjhar"
            null -> null
            else -> district.trim()
        }

    fun distanceKmFrom(userLat: Double, userLon: Double): Double? {
        if (lat == null || lon == null) return null
        return HaversineDistance.calculateKm(userLat, userLon, lat, lon)
    }

    fun formattedDistance(km: Double): String {
        return if (km < 1.0) {
            "${(km * 1000).toInt()} m away"
        } else {
            "${String.format(java.util.Locale.US, "%.1f", km)} km away"
        }
    }

    fun formattedDistance(userLat: Double, userLon: Double): String? {
        val km = distanceKmFrom(userLat, userLon) ?: return null
        return formattedDistance(km)
    }

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

    val distinctPhotoCount: Int
        get() = photos.size

    val hasMultiplePhotos: Boolean
        get() = photos.size > 1

    /**
     * Strict capability gating: backend places API does not expose video streams.
     * Prevents rendering false video tabs, play buttons, or fake durations.
     */
    val hasVideo: Boolean
        get() = false

    /**
     * Strict capability gating: backend places API does not expose 3D runtime models.
     * Prevents rendering fake 3D viewers, AR buttons, or cross-destination leakage.
     */
    val has3d: Boolean
        get() = false
}

/**
 * Pure, deterministic search, filtering, and ranking engine for Discover.
 */
object DiscoverSearchEngine {
    /**
     * Normalized tokens from query string. Preserves Unicode Odia script.
     */
    fun tokenize(query: String): List<String> {
        val trimmed = query.trim().lowercase()
        if (trimmed.isEmpty()) return emptyList()
        return trimmed.split(Regex("[\\s,;]+")).filter { it.isNotBlank() }
    }

    /**
     * Evaluates whether a destination matches all query tokens.
     */
    fun matches(place: DiscoverPlace, query: String): Boolean {
        val tokens = tokenize(query)
        if (tokens.isEmpty()) return true

        val searchCorpus = buildString {
            append(place.name.lowercase()).append(" ")
            place.odiaName?.let { append(it.lowercase()).append(" ") }
            place.district?.let { append(it.lowercase()).append(" ") }
            place.normalizedDistrict?.let { append(it.lowercase()).append(" ") }
            append(place.category.lowercase().replace('_', ' ')).append(" ")
            place.description?.let { append(it.lowercase()).append(" ") }
        }

        return tokens.all { token -> searchCorpus.contains(token) }
    }

    /**
     * Computes tiered deterministic relevance score:
     * Tier 1: Exact Name match = 1000
     * Tier 2: Name Prefix match = 800
     * Tier 3: Odia Script exact/prefix = 600
     * Tier 4: District or Category match = 400
     * Tier 5: Substring match in Name/Desc = 200
     */
    fun calculateRelevanceScore(place: DiscoverPlace, query: String): Int {
        val trimmed = query.trim().lowercase()
        if (trimmed.isEmpty()) return 0

        val nameLower = place.name.lowercase()
        if (nameLower == trimmed) return 1000
        if (nameLower.startsWith(trimmed)) return 800
        if (nameLower.split(' ').any { it.startsWith(trimmed) }) return 750

        val odiaLower = place.odiaName?.lowercase()
        if (odiaLower != null) {
            if (odiaLower == trimmed) return 600
            if (odiaLower.startsWith(trimmed)) return 550
            if (odiaLower.contains(trimmed)) return 500
        }

        val distLower = (place.normalizedDistrict ?: place.district)?.lowercase()
        if (distLower != null && (distLower == trimmed || distLower.startsWith(trimmed))) return 400

        val catLower = place.category.lowercase().replace('_', ' ')
        if (catLower == trimmed || catLower.startsWith(trimmed)) return 350

        if (nameLower.contains(trimmed)) return 250
        if (place.description?.lowercase()?.contains(trimmed) == true) return 200

        return 100
    }

    /**
     * Filters and ranks catalog according to query, category, district, and spatial proximity.
     */
    fun filterAndRank(
        catalog: List<DiscoverPlace>,
        query: String = "",
        category: String? = null,
        district: String? = null,
        isNearbyEnabled: Boolean = false,
        userLat: Double? = null,
        userLon: Double? = null
    ): List<DiscoverPlace> {
        val filtered = catalog.filter { place ->
            if (!place.isEligibleLeisure) return@filter false

            // Category filter
            if (category != null && category != "all") {
                val catNorm = category.trim().lowercase().replace('_', ' ')
                val placeCatNorm = place.category.trim().lowercase().replace('_', ' ')
                if (catNorm != placeCatNorm && !placeCatNorm.contains(catNorm)) {
                    return@filter false
                }
            }

            // District filter
            if (district != null && district != "all") {
                val distNorm = district.trim().lowercase()
                val placeDist = (place.normalizedDistrict ?: place.district)?.trim()?.lowercase()
                if (placeDist != distNorm) {
                    return@filter false
                }
            }

            // Text search filter
            if (query.isNotBlank()) {
                if (!matches(place, query)) {
                    return@filter false
                }
            }

            true
        }

        // Sorting & Ranking
        return if (isNearbyEnabled && userLat != null && userLon != null) {
            // Spatial proximity sort (nearest first)
            filtered.sortedWith(
                compareBy<DiscoverPlace> {
                    it.distanceKmFrom(userLat, userLon) ?: Double.MAX_VALUE
                }.thenBy { it.name }
            )
        } else if (query.isNotBlank()) {
            // Search relevance score sort (highest score first)
            filtered.sortedWith(
                compareByDescending<DiscoverPlace> {
                    calculateRelevanceScore(it, query)
                }.thenBy { it.name }
            )
        } else {
            // Default discovery sort: Verified photo first, then alphabetical A-Z
            filtered.sortedWith(
                compareByDescending<DiscoverPlace> { it.primaryPhoto != null }
                    .thenBy { it.name }
            )
        }
    }
}

/**
 * Deduplicates raw DTO image list into distinct source photos.
 * Ensures responsive variants sharing the same canonical asset are not counted as separate photos.
 */
fun List<PlaceImageDto>?.toDomainPhotos(): List<PlacePhoto> {
    if (this == null) return emptyList()
    val verified = filter { it.status?.lowercase() == "verified" || it.status == null || it.isPrimary }
    val seenIdentities = mutableSetOf<String>()
    val result = mutableListOf<PlacePhoto>()

    for (dto in verified) {
        val identity = extractSourceIdentity(dto)
        if (seenIdentities.add(identity)) {
            result.add(
                PlacePhoto(
                    id = dto.id,
                    mediaAssetId = dto.mediaAssetId,
                    contentSha256 = dto.contentSha256,
                    assetHash = dto.assetHash,
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

/**
 * 5-tier canonical source-photo identity priority:
 * 1. media_asset_id
 * 2. content_sha256
 * 3. asset_hash
 * 4. canonical image record id
 * 5. normalized source URL fallback
 */
fun extractSourceIdentity(dto: PlaceImageDto): String {
    dto.mediaAssetId?.takeIf { it.isNotBlank() }?.let { return "media_asset:$it" }
    dto.contentSha256?.takeIf { it.isNotBlank() }?.let { return "sha256:$it" }
    dto.assetHash?.takeIf { it.isNotBlank() }?.let { return "hash:$it" }
    dto.id?.takeIf { it.isNotBlank() }?.let { return "record_id:$it" }
    return "url:${extractSourceIdentity(dto.url)}"
}

fun extractSourceIdentity(url: String): String {
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
        lat = lat,
        lon = lon,
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
