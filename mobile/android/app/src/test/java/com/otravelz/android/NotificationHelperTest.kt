package com.otravelz.android

import com.otravelz.android.core.notifications.NotificationHelper
import com.otravelz.android.core.notifications.NotificationPreferencesData
import org.junit.Assert.*
import org.junit.Test

class NotificationHelperTest {

    @Test
    fun testNotificationChannelsConfigured() {
        assertEquals("otravelz_trip_alerts", NotificationHelper.CHANNEL_TRIP_ALERTS)
        assertEquals("otravelz_transit_guidance", NotificationHelper.CHANNEL_TRANSIT_GUIDANCE)
        assertEquals("otravelz_weather_alerts", NotificationHelper.CHANNEL_WEATHER_ALERTS)
    }

    @Test
    fun testDeepLinkUriPatternMatchesNavHost() {
        val placeId = "konark-sun-temple"
        val expectedUri = "otravelz://place?id=konark-sun-temple"
        val uriString = NotificationHelper.buildPlaceDeepLinkUriString(placeId)

        assertEquals(expectedUri, uriString)
        assertEquals("otravelz", NotificationHelper.DEEP_LINK_SCHEME)
        assertEquals("place", NotificationHelper.DEEP_LINK_HOST_PLACE)
    }

    @Test
    fun testNotificationIdBasesAreDistinct() {
        assertTrue(NotificationHelper.NOTIFICATION_ID_BASE_TRIP != NotificationHelper.NOTIFICATION_ID_BASE_TRANSIT)
        assertTrue(NotificationHelper.NOTIFICATION_ID_BASE_TRANSIT != NotificationHelper.NOTIFICATION_ID_BASE_WEATHER)
        assertTrue(NotificationHelper.NOTIFICATION_ID_BASE_TRIP != NotificationHelper.NOTIFICATION_ID_BASE_WEATHER)
    }

    @Test
    fun testNotificationPreferencesDataDefaults() {
        val prefs = NotificationPreferencesData()
        assertTrue("Trip alerts should be enabled by default", prefs.tripAlertsEnabled)
        assertTrue("Transit guidance should be enabled by default", prefs.transitGuidanceEnabled)
        assertTrue("Weather alerts should be enabled by default", prefs.weatherAlertsEnabled)
    }

    @Test
    fun testNotificationPreferencesDataCustomState() {
        val prefs = NotificationPreferencesData(
            tripAlertsEnabled = true,
            transitGuidanceEnabled = false,
            weatherAlertsEnabled = true
        )
        assertTrue(prefs.tripAlertsEnabled)
        assertFalse(prefs.transitGuidanceEnabled)
        assertTrue(prefs.weatherAlertsEnabled)
    }

    @Test
    fun testDeepLinkUriBuilderWithQueryParam() {
        val uri = NotificationHelper.buildPlaceDeepLinkUri("lingaraj-temple")
        assertEquals("otravelz", uri.scheme)
        assertEquals("place", uri.host)
        assertEquals("lingaraj-temple", uri.getQueryParameter("id"))
    }
}
