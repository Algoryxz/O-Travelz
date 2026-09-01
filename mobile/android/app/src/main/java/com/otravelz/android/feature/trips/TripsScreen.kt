package com.otravelz.android.feature.trips

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.otravelz.android.core.design.*
import com.otravelz.android.core.ui.trips.EmptyTripsStateV3
import com.otravelz.android.core.ui.trips.SavedTripCardV3
import com.otravelz.android.core.ui.trips.TripsHeader
import com.otravelz.android.data.repository.SavedTripsRepository

@Composable
fun TripsScreen(
    onPlanNewTrip: () -> Unit,
    onTripClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val repository = remember {
        try {
            SavedTripsRepository(context)
        } catch (_: Exception) {
            null
        }
    }

    val savedTrips by repository?.savedTrips?.collectAsState() ?: remember { mutableStateOf(emptyList()) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(Spacing.md)
    ) {
        TripsHeader(
            tripCount = savedTrips.size,
            onPlanNewTrip = onPlanNewTrip
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        if (savedTrips.isEmpty()) {
            EmptyTripsStateV3(
                onPlanNewTrip = onPlanNewTrip,
                modifier = Modifier.weight(1f)
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
                modifier = Modifier.weight(1f)
            ) {
                items(savedTrips, key = { it.id }) { trip ->
                    SavedTripCardV3(
                        trip = trip,
                        onClick = { onTripClick(trip.id) },
                        onShare = {
                            val days = trip.itinerary?.days.orEmpty()
                            val stopsText = days.flatMap { it.stops }.joinToString("\n") { "• ${it.place.name}" }
                            val shareIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, "O-TRAVELZ Itinerary: ${trip.title}\n$stopsText")
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Trip"))
                        },
                        onDelete = {
                            repository?.deleteTrip(trip.id)
                        }
                    )
                }
            }
        }
    }
}
