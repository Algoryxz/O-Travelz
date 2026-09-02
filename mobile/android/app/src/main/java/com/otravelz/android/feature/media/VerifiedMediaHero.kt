package com.otravelz.android.feature.media

import android.net.Uri
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.otravelz.android.core.design.*

@OptIn(UnstableApi::class)
@Composable
fun VerifiedMediaHero(
    title: String,
    subtitle: String? = null,
    videoUrl: String? = null,
    posterImageUrl: String? = null,
    modifier: Modifier = Modifier,
    isVerified: Boolean = true,
    autoPlay: Boolean = false
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var isPlaying by remember { mutableStateOf(false) }
    var isMuted by remember { mutableStateOf(true) }
    var isVideoReady by remember { mutableStateOf(false) }
    var hasVideoError by remember { mutableStateOf(false) }

    // ExoPlayer instance managed across lifecycle
    val exoPlayer = remember(videoUrl) {
        if (!videoUrl.isNullOrBlank()) {
            ExoPlayer.Builder(context).build().apply {
                val mediaItem = MediaItem.fromUri(Uri.parse(videoUrl))
                setMediaItem(mediaItem)
                volume = if (isMuted) 0f else 1f
                repeatMode = Player.REPEAT_MODE_ALL
                prepare()
                playWhenReady = autoPlay
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        if (playbackState == Player.STATE_READY) {
                            isVideoReady = true
                        }
                    }

                    override fun onIsPlayingChanged(playing: Boolean) {
                        isPlaying = playing
                    }

                    override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                        hasVideoError = true
                    }
                })
            }
        } else {
            null
        }
    }

    // Lifecycle cleanup & auto-pause
    DisposableEffect(lifecycleOwner, exoPlayer) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE, Lifecycle.Event.ON_STOP -> {
                    exoPlayer?.pause()
                }
                Lifecycle.Event.ON_RESUME -> {
                    if (autoPlay && isVideoReady && !hasVideoError) {
                        exoPlayer?.play()
                    }
                }
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            exoPlayer?.release()
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(240.dp)
            .background(DarkSurface)
    ) {
        // 1. Poster Image (Always rendered as base or fallback)
        if (!posterImageUrl.isNullOrBlank() || exoPlayer == null || hasVideoError || !isVideoReady) {
            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data(posterImageUrl)
                    .crossfade(true)
                    .build(),
                contentDescription = title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }

        // 2. Video Surface
        if (exoPlayer != null && !hasVideoError) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = false
                        setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }

        // 3. Gradient Scrim for contrast
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            DarkBackground.copy(alpha = 0.3f),
                            DarkBackground.copy(alpha = 0.1f),
                            DarkBackground.copy(alpha = 0.85f)
                        )
                    )
                )
        )

        // 4. Verification Badge (Top-Start)
        Row(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(Spacing.md),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            if (isVerified) {
                TruthBadge(
                    label = if (exoPlayer != null && !hasVideoError) "VERIFIED VIDEO" else "VERIFIED PHOTO",
                    backgroundColor = OchrePrimary,
                    contentColor = DarkBackground
                )
            }
        }

        // 5. Video Play / Sound Controls (Top-End)
        if (exoPlayer != null && !hasVideoError) {
            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(Spacing.md),
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                IconButton(
                    onClick = {
                        isMuted = !isMuted
                        exoPlayer.volume = if (isMuted) 0f else 1f
                    },
                    modifier = Modifier
                        .size(36.dp)
                        .background(DarkBackground.copy(alpha = 0.7f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                        contentDescription = if (isMuted) "Unmute" else "Mute",
                        tint = SunTempleGold,
                        modifier = Modifier.size(18.dp)
                    )
                }

                IconButton(
                    onClick = {
                        if (isPlaying) {
                            exoPlayer.pause()
                        } else {
                            exoPlayer.play()
                        }
                    },
                    modifier = Modifier
                        .size(36.dp)
                        .background(DarkBackground.copy(alpha = 0.7f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = SunTempleGold,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // 6. Title and Subtitle Overlay (Bottom-Start)
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(Spacing.md)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
            if (!subtitle.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = OchreLight
                )
            }
        }
    }
}
