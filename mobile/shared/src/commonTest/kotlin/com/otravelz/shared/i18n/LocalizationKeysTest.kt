package com.otravelz.shared.i18n

import kotlin.test.Test
import kotlin.test.assertEquals

class LocalizationKeysTest {

    @Test
    fun testResolveGreetingKey() {
        // Morning: 5am - 11:59am
        assertEquals(LocalizationKeys.GREETING_MORNING, LocalizationKeys.resolveGreetingKey(5))
        assertEquals(LocalizationKeys.GREETING_MORNING, LocalizationKeys.resolveGreetingKey(8))
        assertEquals(LocalizationKeys.GREETING_MORNING, LocalizationKeys.resolveGreetingKey(11))

        // Afternoon: 12pm - 4:59pm (16:59)
        assertEquals(LocalizationKeys.GREETING_AFTERNOON, LocalizationKeys.resolveGreetingKey(12))
        assertEquals(LocalizationKeys.GREETING_AFTERNOON, LocalizationKeys.resolveGreetingKey(14))
        assertEquals(LocalizationKeys.GREETING_AFTERNOON, LocalizationKeys.resolveGreetingKey(16))

        // Dusk / Evening: 5pm (17:00) - 8:59pm (20:59)
        assertEquals(LocalizationKeys.GREETING_DUSK, LocalizationKeys.resolveGreetingKey(17))
        assertEquals(LocalizationKeys.GREETING_DUSK, LocalizationKeys.resolveGreetingKey(19))
        assertEquals(LocalizationKeys.GREETING_DUSK, LocalizationKeys.resolveGreetingKey(20))

        // Night: 9pm (21:00) - 4:59am
        assertEquals(LocalizationKeys.GREETING_NIGHT, LocalizationKeys.resolveGreetingKey(21))
        assertEquals(LocalizationKeys.GREETING_NIGHT, LocalizationKeys.resolveGreetingKey(23))
        assertEquals(LocalizationKeys.GREETING_NIGHT, LocalizationKeys.resolveGreetingKey(0))
        assertEquals(LocalizationKeys.GREETING_NIGHT, LocalizationKeys.resolveGreetingKey(4))
    }
}
