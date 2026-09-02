package com.otravelz.android

import com.otravelz.android.data.model.PlaceDetailDto
import org.junit.Assert.*
import org.junit.Test

class GlobalSearchLogicTest {

    @Test
    fun testGlobalSearchFiltering_matchesPlaceNameAndCategoryAndDistrict() {
        val places = listOf(
            PlaceDetailDto(id = "p1", name = "Konark Sun Temple", category = "temple", district = "Puri"),
            PlaceDetailDto(id = "p2", name = "Chilika Lake", category = "nature", district = "Khordha"),
            PlaceDetailDto(id = "p3", name = "Dhauli Shanti Stupa", category = "heritage", district = "Khordha")
        )

        val query = "puri"
        val results = places.filter { p ->
            p.name.contains(query, ignoreCase = true) ||
            p.category.contains(query, ignoreCase = true) ||
            (p.district?.contains(query, ignoreCase = true) == true)
        }

        assertEquals(1, results.size)
        assertEquals("p1", results.first().id)

        val categoryQuery = "heritage"
        val catResults = places.filter { p ->
            p.name.contains(categoryQuery, ignoreCase = true) ||
            p.category.contains(categoryQuery, ignoreCase = true) ||
            (p.district?.contains(categoryQuery, ignoreCase = true) == true)
        }
        assertEquals(1, catResults.size)
        assertEquals("p3", catResults.first().id)
    }
}
