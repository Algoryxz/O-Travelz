package com.otravelz.shared.geo

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class OdishaBoundsTest {

    @Test
    fun testCoordinatesInsideOdishaBounds() {
        // Bhubaneswar (20.2961, 85.8245)
        assertTrue(OdishaBounds.contains(20.2961, 85.8245))
        assertTrue(OdishaBounds.contains(OdishaBounds.MASTER_CANTEEN))

        // Sambalpur (21.4680, 83.9820)
        assertTrue(OdishaBounds.contains(21.4680, 83.9820))

        // Koraput (18.8135, 82.7118)
        assertTrue(OdishaBounds.contains(18.8135, 82.7118))

        // Balasore (21.4930, 86.9320)
        assertTrue(OdishaBounds.contains(21.4930, 86.9320))

        // Similipal / Mayurbhanj (21.8500, 86.3500)
        assertTrue(OdishaBounds.contains(21.8500, 86.3500))
    }

    @Test
    fun testCoordinatesOutsideOdishaBounds() {
        // New Delhi (28.6139, 77.2090) - north/west of Odisha
        assertFalse(OdishaBounds.contains(28.6139, 77.2090))

        // Mumbai (19.0760, 72.8777) - west of Odisha
        assertFalse(OdishaBounds.contains(19.0760, 72.8777))

        // London (51.5074, -0.1278) - overseas
        assertFalse(OdishaBounds.contains(51.5074, -0.1278))

        // Bay of Bengal deep sea (15.0, 90.0) - south/east of Odisha
        assertFalse(OdishaBounds.contains(15.0, 90.0))
    }
}
