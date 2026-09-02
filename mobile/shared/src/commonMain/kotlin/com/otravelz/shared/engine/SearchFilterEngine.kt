package com.otravelz.shared.engine

/**
 * Deterministic, lightweight search and filtering engine.
 *
 * Implements local tokenization, multi-token prefix/substring matching, and district/category
 * filtering rules with zero external dependencies, vector DBs, or embeddings.
 */
object SearchFilterEngine {

    /**
     * The official 30 revenue districts of Odisha, India.
     */
    val ODISHA_DISTRICTS: Set<String> = setOf(
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar",
        "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
        "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    )

    /**
     * Approved primary category taxonomy for destinations and cultural places.
     */
    val APPROVED_CATEGORIES: Set<String> = setOf(
        "temple", "heritage", "nature", "wildlife", "beach",
        "craft", "culinary", "museum", "waterfall", "village"
    )

    /**
     * Normalizes a search query string by converting to lowercase, trimming,
     * and stripping non-alphanumeric separator characters.
     */
    fun normalize(text: String): String =
        text.lowercase()
            .replace(Regex("[^a-z0-9\\s]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()

    /**
     * Splits a search query into distinct non-empty search tokens.
     */
    fun tokenize(query: String): List<String> =
        normalize(query).split(" ").filter { it.isNotBlank() }

    /**
     * Evaluates if a target text (and optional aliases) satisfies all tokens in the search query.
     * All query tokens must match at least one searchable field (AND logic).
     */
    fun matchesQuery(
        query: String,
        name: String,
        description: String? = null,
        district: String? = null,
        category: String? = null,
        aliases: List<String> = emptyList()
    ): Boolean {
        val tokens = tokenize(query)
        if (tokens.isEmpty()) return true

        val searchCorpus = buildString {
            append(normalize(name)).append(" ")
            if (!description.isNullOrBlank()) append(normalize(description)).append(" ")
            if (!district.isNullOrBlank()) append(normalize(district)).append(" ")
            if (!category.isNullOrBlank()) append(normalize(category)).append(" ")
            for (alias in aliases) {
                append(normalize(alias)).append(" ")
            }
        }

        return tokens.all { token -> searchCorpus.contains(token) }
    }

    /**
     * Validates whether a given district name is one of the 30 official Odisha districts (case-insensitive).
     */
    fun isValidDistrict(district: String?): Boolean {
        if (district.isNullOrBlank()) return false
        val normalized = district.trim().lowercase()
        return ODISHA_DISTRICTS.any { it.lowercase() == normalized }
    }

    /**
     * Validates whether a given category is part of the approved taxonomy (case-insensitive).
     */
    fun isValidCategory(category: String?): Boolean {
        if (category.isNullOrBlank()) return false
        val normalized = category.trim().lowercase()
        return APPROVED_CATEGORIES.contains(normalized)
    }
}
