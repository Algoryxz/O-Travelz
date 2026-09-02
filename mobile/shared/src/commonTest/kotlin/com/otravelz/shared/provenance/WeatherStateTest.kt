package com.otravelz.shared.provenance

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class WeatherStateTest {

    @Test
    fun testUnavailableWeatherStateHasNullValues() {
        val unavailable = WeatherState.UNAVAILABLE

        assertFalse(unavailable.hasValidObservation)
        assertEquals(DataTier.UNAVAILABLE, unavailable.dataTier)
        assertNull(unavailable.temperatureC)
        assertNull(unavailable.conditionName)
        assertNull(unavailable.windSpeedKmh)
    }

    @Test
    fun testValidWeatherState() {
        val weather = WeatherState(
            temperatureC = 28.5,
            apparentTemperatureC = 31.0,
            relativeHumidityPercent = 75.0,
            weatherCode = 1,
            conditionName = "Mainly Clear",
            windSpeedKmh = 12.0,
            isDay = true,
            dataTier = DataTier.LIVE,
            locationName = "Bhubaneswar"
        )

        assertTrue(weather.hasValidObservation)
        assertEquals(28.5, weather.temperatureC)
        assertEquals(DataTier.LIVE, weather.dataTier)
        assertEquals("Mainly Clear", weather.conditionName)
    }

    @Test
    fun testNullTemperatureNeverDefaultsToZero() {
        val missingTempState = WeatherState(
            temperatureC = null,
            conditionName = null,
            dataTier = DataTier.UNAVAILABLE
        )

        assertNull(missingTempState.temperatureC)
        assertFalse(missingTempState.hasValidObservation)
    }
}
