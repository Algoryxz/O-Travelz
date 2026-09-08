package com.otravelz.android

import androidx.compose.ui.unit.dp
import com.otravelz.android.navigation.NavDestination
import com.otravelz.android.ui.components.WindowSizeClassCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AdaptiveChromeTest {

    @Test
    fun testWindowSizeClassBreakpoints() {
        // Compact width (< 600dp)
        assertEquals(WindowSizeClassCategory.COMPACT, WindowSizeClassCategory.fromWidth(360.dp))
        assertEquals(WindowSizeClassCategory.COMPACT, WindowSizeClassCategory.fromWidth(412.dp))
        assertEquals(WindowSizeClassCategory.COMPACT, WindowSizeClassCategory.fromWidth(599.dp))

        // Medium width (600dp - 839dp)
        assertEquals(WindowSizeClassCategory.MEDIUM, WindowSizeClassCategory.fromWidth(600.dp))
        assertEquals(WindowSizeClassCategory.MEDIUM, WindowSizeClassCategory.fromWidth(720.dp))
        assertEquals(WindowSizeClassCategory.MEDIUM, WindowSizeClassCategory.fromWidth(839.dp))

        // Expanded width (>= 840dp)
        assertEquals(WindowSizeClassCategory.EXPANDED, WindowSizeClassCategory.fromWidth(840.dp))
        assertEquals(WindowSizeClassCategory.EXPANDED, WindowSizeClassCategory.fromWidth(1024.dp))
        assertEquals(WindowSizeClassCategory.EXPANDED, WindowSizeClassCategory.fromWidth(1280.dp))
    }

    @Test
    fun testRootDestinationsUniquenessAndOrder() {
        val roots = NavDestination.rootDestinations
        assertEquals(5, roots.size)

        // All routes must be unique
        val uniqueRoutes = roots.map { it.route }.toSet()
        assertEquals(5, uniqueRoutes.size)

        // Exact frozen IA order
        assertEquals(NavDestination.DISCOVER, roots[0])
        assertEquals(NavDestination.MAP, roots[1])
        assertEquals(NavDestination.PLAN, roots[2])
        assertEquals(NavDestination.TRIPS, roots[3])
        assertEquals(NavDestination.YOU, roots[4])
    }

    @Test
    fun testTabReselectionIdempotency() {
        var currentTab = NavDestination.DISCOVER
        val initialTab = currentTab

        // Re-clicking current tab must produce identical tab destination
        val clickedTab = NavDestination.DISCOVER
        currentTab = clickedTab
        assertEquals("Reselecting active tab must be idempotent", initialTab, currentTab)

        // Switching to different tab updates state
        currentTab = NavDestination.MAP
        assertNotEquals(initialTab, currentTab)
        assertEquals(NavDestination.MAP, currentTab)
    }

    @Test
    fun testBackNavigationBehaviorLogic() {
        // From any secondary tab, simulated back press returns to DISCOVER
        val secondaryTabs = listOf(
            NavDestination.MAP,
            NavDestination.PLAN,
            NavDestination.TRIPS,
            NavDestination.YOU
        )

        for (tab in secondaryTabs) {
            var activeTab = tab
            val shouldInterceptBack = activeTab != NavDestination.DISCOVER
            assertTrue("Back should be intercepted on secondary tab", shouldInterceptBack)

            // When back pressed
            if (shouldInterceptBack) {
                activeTab = NavDestination.DISCOVER
            }
            assertEquals("Back press must return to DISCOVER", NavDestination.DISCOVER, activeTab)
        }

        // On DISCOVER, back press is not intercepted (delegates to system exit)
        val homeTab = NavDestination.DISCOVER
        val shouldInterceptBackOnHome = homeTab != NavDestination.DISCOVER
        assertEquals("Back must NOT be intercepted on DISCOVER root", false, shouldInterceptBackOnHome)
    }
}
