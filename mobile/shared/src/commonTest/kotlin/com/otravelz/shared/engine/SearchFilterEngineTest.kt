package com.otravelz.shared.engine

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SearchFilterEngineTest {

    @Test
    fun testNormalizeAndTokenize() {
        val query = "  Konark, Sun-Temple! "
        val tokens = SearchFilterEngine.tokenize(query)

        assertEquals(listOf("konark", "sun", "temple"), tokens)
    }

    @Test
    fun testMatchesQuery() {
        val name = "Konark Sun Temple"
        val desc = "13th century UNESCO World Heritage Site built by King Narasimhadeva I"
        val district = "Puri"
        val category = "heritage"
        val aliases = listOf("Black Pagoda", "Arka Kshetra")

        // Matches name token
        assertTrue(SearchFilterEngine.matchesQuery("konark", name, desc, district, category, aliases))

        // Matches alias token
        assertTrue(SearchFilterEngine.matchesQuery("black pagoda", name, desc, district, category, aliases))

        // Matches multi-token across fields (name + district)
        assertTrue(SearchFilterEngine.matchesQuery("temple puri", name, desc, district, category, aliases))

        // Fails when token is not present
        assertFalse(SearchFilterEngine.matchesQuery("chilika", name, desc, district, category, aliases))
    }

    @Test
    fun testDistrictValidation() {
        assertTrue(SearchFilterEngine.isValidDistrict("Khordha"))
        assertTrue(SearchFilterEngine.isValidDistrict("puri"))
        assertTrue(SearchFilterEngine.isValidDistrict("PURI"))
        assertTrue(SearchFilterEngine.isValidDistrict("Sambalpur"))
        assertTrue(SearchFilterEngine.isValidDistrict("Mayurbhanj"))
        assertTrue(SearchFilterEngine.isValidDistrict("Koraput"))

        assertFalse(SearchFilterEngine.isValidDistrict("Kolkata"))
        assertFalse(SearchFilterEngine.isValidDistrict("Mumbai"))
        assertFalse(SearchFilterEngine.isValidDistrict(""))
        assertFalse(SearchFilterEngine.isValidDistrict(null))
    }

    @Test
    fun testCategoryValidation() {
        assertTrue(SearchFilterEngine.isValidCategory("temple"))
        assertTrue(SearchFilterEngine.isValidCategory("HERITAGE"))
        assertTrue(SearchFilterEngine.isValidCategory("nature"))
        assertTrue(SearchFilterEngine.isValidCategory("craft"))

        assertFalse(SearchFilterEngine.isValidCategory("amusement_park"))
        assertFalse(SearchFilterEngine.isValidCategory(""))
        assertFalse(SearchFilterEngine.isValidCategory(null))
    }
}
