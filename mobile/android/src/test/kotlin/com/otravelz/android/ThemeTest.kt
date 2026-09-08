package com.otravelz.android

import com.otravelz.android.ui.theme.Spacing
import com.otravelz.android.ui.theme.TerracottaAccent
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ThemeTest {

    @Test
    fun testBrandTokensDefined() {
        assertNotNull("Terracotta brand color must be defined", TerracottaAccent)
        assertTrue("Spacing tokens must be strictly positive", Spacing.space5.value > 0f)
    }
}