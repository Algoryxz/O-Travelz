package com.otravelz.shared.i18n

/**
 * Type-safe localization string keys shared between Android and iOS.
 *
 * CRITICAL ARCHITECTURAL RULE:
 * Actual user-facing translation strings live natively in Android XML (`res/values/strings.xml`, `res/values-or/strings.xml`, `res/values-hi/strings.xml`)
 * and iOS String Catalogs (`Localizable.xcstrings`).
 * This object defines the single cross-platform canonical contract of key identifiers.
 */
object LocalizationKeys {
    // Navigation & Tabs
    const val TAB_HOME = "tab_home"
    const val TAB_EXPLORE = "tab_explore"
    const val TAB_PLAN = "tab_plan"
    const val TAB_TRIPS = "tab_trips"
    const val TAB_YOU = "tab_you"

    // Time-of-Day Greetings
    const val GREETING_MORNING = "greeting_morning"
    const val GREETING_AFTERNOON = "greeting_afternoon"
    const val GREETING_DUSK = "greeting_dusk"
    const val GREETING_NIGHT = "greeting_night"

    // Truth & Provenance Badges
    const val BADGE_VERIFIED = "badge_verified"
    const val BADGE_SCHEDULED = "badge_scheduled"
    const val BADGE_LIVE = "badge_live"
    const val BADGE_ESTIMATED = "badge_estimated"
    const val BADGE_FALLBACK = "badge_fallback"

    // First-Mile Proximity Labels
    const val FIRST_MILE_WALK = "first_mile_walk"
    const val FIRST_MILE_WALK_OR_AUTO = "first_mile_walk_or_auto"
    const val FIRST_MILE_AUTO_OR_CAB = "first_mile_auto_or_cab"

    // Location & Datum Notices
    const val LOCATION_REFERENCE_DATUM_NOTICE = "location_reference_datum_notice"
    const val LOCATION_PERMISSION_RATIONALE = "location_permission_rationale"

    // Transit Disclaimers
    const val TRANSIT_SCHEDULED_NOTICE = "transit_scheduled_notice"
    const val TRANSIT_SERVICE_FINISHED = "transit_service_finished"
    const val TRANSIT_SCHEDULE_UNAVAILABLE = "transit_schedule_unavailable"

    // Brand & Attribution
    const val BRAND_NAME = "brand_name"
    const val BRAND_TAGLINE = "brand_tagline"
    const val BUILT_BY = "built_by"

    /**
     * Resolves the appropriate greeting string key for an Indian Standard Time (IST) 24-hour hour value (0-23).
     */
    fun resolveGreetingKey(hourOfDayIst: Int): String = when (hourOfDayIst) {
        in 5..11 -> GREETING_MORNING
        in 12..16 -> GREETING_AFTERNOON
        in 17..20 -> GREETING_DUSK
        else -> GREETING_NIGHT
    }
}
