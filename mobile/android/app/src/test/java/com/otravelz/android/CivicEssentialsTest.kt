package com.otravelz.android

import com.otravelz.android.data.repository.CivicCategory
import com.otravelz.android.data.repository.CivicEssentialsRepository
import org.junit.Assert.*
import org.junit.Test

class CivicEssentialsTest {

    private val repository = CivicEssentialsRepository()

    @Test
    fun testGetItems_filtersByCategory() {
        val hospitals = repository.getItems(CivicCategory.HOSPITAL)
        assertTrue(hospitals.isNotEmpty())
        assertTrue(hospitals.all { it.category == CivicCategory.HOSPITAL })

        val police = repository.getItems(CivicCategory.POLICE)
        assertTrue(police.isNotEmpty())
        assertTrue(police.all { it.category == CivicCategory.POLICE })
    }

    @Test
    fun testGetItemsSortedByDistance_returnsSortedPairs() {
        // Bhubaneswar origin (20.2961, 85.8245)
        val sortedHospitals = repository.getItemsSortedByDistance(
            CivicCategory.HOSPITAL,
            20.2961,
            85.8245
        )

        assertTrue(sortedHospitals.isNotEmpty())
        for (i in 0 until sortedHospitals.size - 1) {
            assertTrue(sortedHospitals[i].second <= sortedHospitals[i + 1].second)
        }
    }
}
