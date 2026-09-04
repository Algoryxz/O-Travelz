package com.otravelz.shared.i18n

/**
 * Universal Localized Entity Identity contract in Kotlin Multiplatform.
 *
 * Provides a language-first representation across domains:
 * Place, Stop, CraftTradition, ArtisanCluster, RailwayStation, etc.
 *
 * @property en Canonical English name (fallback source of truth)
 * @property orName Odia (ଓଡ଼ିଆ) script name
 * @property hi Hindi (हिन्दी) Devanagari script name
 */
data class LocalizedNames(
    val en: String,
    val orName: String? = null,
    val hi: String? = null
) {
    /**
     * Resolves the localized string given a language code (e.g., "or", "odia", "hi", "hindi", "en").
     * Always falls back safely to [en].
     */
    fun resolve(languageCode: String = "en"): String {
        val normalized = languageCode.trim().lowercase()
        return when {
            normalized in listOf("or", "odi", "odia") -> orName?.takeIf { it.isNotBlank() } ?: en
            normalized in listOf("hi", "hin", "hindi") -> hi?.takeIf { it.isNotBlank() } ?: en
            else -> en
        }
    }
}