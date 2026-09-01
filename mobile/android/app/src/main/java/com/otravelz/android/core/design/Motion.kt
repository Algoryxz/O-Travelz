package com.otravelz.android.core.design

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically

object Motion {
    val snappySpring = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    val smoothSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessLow
    )

    val fadeInTransition = fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
    val fadeOutTransition = fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))

    val slideUpTransition = slideInVertically(
        initialOffsetY = { 40 },
        animationSpec = snappySpring
    ) + fadeInTransition

    val slideDownExit = slideOutVertically(
        targetOffsetY = { -40 },
        animationSpec = snappySpring
    ) + fadeOutTransition
}
