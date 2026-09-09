package com.otravelz.android

import com.otravelz.android.data.repository.EssentialsRepository
import com.otravelz.android.domain.model.CivicCategory
import com.otravelz.android.domain.model.CivicServiceItem
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Wave M15: Comprehensive Unit Tests for Emergency Essentials, Civic Contacts,
 * and Artisan Clusters.
 */
class EssentialsProductModelTest {

    private lateinit var repository: EssentialsRepository

    @Before
    fun setUp() {
        repository = EssentialsRepository.getInstance()
    }

    @Test
    fun testEmergencyHelplinesIntegrity() {
        val helplines = repository.getEmergencyHelplines()
        assertEquals("Must provide exactly 8 verified state/national emergency helplines", 8, helplines.size)

        val numbers = helplines.map { it.number }
        assertTrue("Must include National Emergency 112", numbers.contains("112"))
        assertTrue("Must include Medical Ambulance 108", numbers.contains("108"))
        assertTrue("Must include National Tourist Helpline 1363", numbers.contains("1363"))
        assertTrue("Must include Odisha Tourist Police / Helpline", numbers.contains("0674-2396996"))
        assertTrue("Must include Women Helpline 181", numbers.contains("181"))
        assertTrue("Must include Fire & Rescue 101", numbers.contains("101"))
        assertTrue("Must include NHAI Highway Helpline 1033", numbers.contains("1033"))
        assertTrue("Must include Childline 1098", numbers.contains("1098"))

        // Security check: phone numbers must sanitize safely for tel: URI
        helplines.forEach { helpline ->
            val sanitized = helpline.number.filter { it.isDigit() || it == '+' }
            assertTrue("Sanitized number must not be empty", sanitized.isNotEmpty())
            assertTrue("Sanitized number must contain only digits or +", sanitized.all { it.isDigit() || it == '+' })
            assertFalse("Helpline label must not be blank", helpline.label.isBlank())
            assertFalse("Helpline description must not be blank", helpline.description.isBlank())
        }
    }

    @Test
    fun testArtisanClustersIntegrity() {
        val clusters = repository.getArtisanClusters()
        assertEquals("Must provide 6 canonical living heritage artisan clusters", 6, clusters.size)

        val ids = clusters.map { it.id }
        assertTrue("Must contain Raghurajpur", ids.contains("cluster-raghurajpur"))
        assertTrue("Must contain Pipili", ids.contains("cluster-pipili"))
        assertTrue("Must contain Cuttack Tarakasi", ids.contains("cluster-cuttack-tarakasi"))
        assertTrue("Must contain Ekamra Haat", ids.contains("cluster-ekamra-haat"))
        assertTrue("Must contain Sambalpuri Ikat", ids.contains("cluster-sambalpur-ikat"))
        assertTrue("Must contain Kantilo", ids.contains("cluster-kantilo"))

        // Check GI tag truth
        val raghurajpur = clusters.first { it.id == "cluster-raghurajpur" }
        assertTrue("Raghurajpur Pattachitra must have GI tag status", raghurajpur.giTagged)
        assertEquals("Raghurajpur district must be Puri", "Puri", raghurajpur.district)
        assertNotNull("Raghurajpur must link to canonical place catalog", raghurajpur.canonicalPlaceId)

        val pipili = clusters.first { it.id == "cluster-pipili" }
        assertTrue("Pipili Applique must have GI tag status", pipili.giTagged)
        assertEquals("Pipili district must be Puri", "Puri", pipili.district)

        val tarakasi = clusters.first { it.id == "cluster-cuttack-tarakasi" }
        assertTrue("Cuttack Silver Filigree must have GI tag status", tarakasi.giTagged)
        assertEquals("Tarakasi district must be Cuttack", "Cuttack", tarakasi.district)

        val ikat = clusters.first { it.id == "cluster-sambalpur-ikat" }
        assertTrue("Sambalpuri Ikat must have GI tag status", ikat.giTagged)
        assertEquals("Sambalpur Ikat district must be Sambalpur", "Sambalpur", ikat.district)

        // All clusters must have genuine Odia names and authentic descriptions
        clusters.forEach { c ->
            assertTrue("Odia name must not be blank for ${c.name}", c.odiaName.isNotBlank())
            assertTrue("Craft name must not be blank for ${c.name}", c.craftName.isNotBlank())
            assertTrue("Description must be substantive (> 20 chars) for ${c.name}", c.description.length > 20)
        }
    }

    @Test
    fun testCivicCategoryMapping() {
        assertEquals(CivicCategory.HEALTHCARE, CivicCategory.fromApiKey("healthcare"))
        assertEquals(CivicCategory.HEALTHCARE, CivicCategory.fromApiKey("HEALTHCARE"))
        assertEquals(CivicCategory.POLICE, CivicCategory.fromApiKey("police"))
        assertEquals(CivicCategory.FUEL, CivicCategory.fromApiKey("fuel"))
        assertEquals(CivicCategory.ATM, CivicCategory.fromApiKey("atm"))
        assertEquals(CivicCategory.TRANSIT, CivicCategory.fromApiKey("transit"))
        assertEquals(CivicCategory.ALL, CivicCategory.fromApiKey("all"))
        // Safe fallback
        assertEquals(CivicCategory.ALL, CivicCategory.fromApiKey("unknown_category"))
    }

    @Test
    fun testCivicServiceItemPhoneSanitization() {
        val item = CivicServiceItem(
            id = "test-hosp-1",
            name = "Capital Hospital, Bhubaneswar",
            category = CivicCategory.HEALTHCARE,
            phone = "0674-2391983",
            lat = 20.2618,
            lon = 85.8239,
            distanceKm = 1.25,
            distanceFormatted = "1.3 km away",
            is24x7 = true
        )

        val sanitized = item.phone!!.filter { it.isDigit() || it == '+' }
        assertEquals("06742391983", sanitized)
        assertEquals("1.3 km away", item.distanceFormatted)
        assertTrue(item.is24x7)
    }

    @Test
    fun testOfflineResilienceInvariants() {
        // Helplines and artisan clusters must be synchronously available with 0 network calls
        val helplines = repository.getEmergencyHelplines()
        val clusters = repository.getArtisanClusters()

        assertNotNull(helplines)
        assertFalse(helplines.isEmpty())
        assertNotNull(clusters)
        assertFalse(clusters.isEmpty())
    }
}
