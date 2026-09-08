package com.otravelz.android

import com.otravelz.android.navigation.NavDestination
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NavigationTest {

    @Test
    fun testFrozenRootDestinationsCount() {
        assertEquals("Root destinations count must be exactly 5", 5, NavDestination.rootDestinations.size)
    }

    @Test
    fun testFrozenRootDestinationsOrder() {
        val expectedRoutes = listOf("discover", "map", "plan", "trips", "you")
        val actualRoutes = NavDestination.rootDestinations.map { it.route }
        assertEquals("Navigation roots must match frozen IA", expectedRoutes, actualRoutes)
    }
}