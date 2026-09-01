package com.otravelz.android.core.design

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically

object MotionTokens {
    val BouncySpring = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessLow
    )

    val SmoothSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessMediumLow
    )

    val FastFade = tween<Float>(durationMillis = 150, easing = FastOutSlowInEasing)
    val StandardDuration = 250
    val LongDuration = 400

    val ScreenEnter = fadeIn(animationSpec = tween(StandardDuration)) +
            slideInVertically(animationSpec = tween(StandardDuration)) { it / 10 }

    val ScreenExit = fadeOut(animationSpec = tween(FastFade.durationMillis)) +
            slideOutVertically(animationSpec = tween(FastFade.durationMillis)) { -it / 10 }
}
