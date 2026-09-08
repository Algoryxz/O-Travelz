package com.otravelz.android.data.repository

import android.content.Context
import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.dto.CanonicalRouteRawDto
import com.otravelz.android.data.network.dto.CanonicalRouteSequenceDto
import com.otravelz.android.data.network.dto.CanonicalScheduleRawDto
import com.otravelz.android.domain.model.StopVerificationTier
import com.otravelz.android.domain.model.TransitRegion
import com.otravelz.android.domain.model.TransitRouteDetail
import com.otravelz.android.domain.model.TransitRouteSummary
import com.otravelz.android.domain.model.TransitSchedule
import com.otravelz.android.domain.model.TransitStop
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream

interface TransitRepository {
    suspend fun getRoutes(): List<TransitRouteSummary>
    suspend fun getRouteDetail(routeId: String): TransitRouteDetail?
    suspend fun getStop(stopId: String): TransitStop?
}

class TransitRepositoryImpl(
    private val context: Context
) : TransitRepository {

    private var cachedRoutes: List<TransitRouteSummary>? = null
    private var cachedSchedules: Map<String, List<CanonicalScheduleRawDto>>? = null
    private var cachedSequences: Map<String, List<CanonicalRouteSequenceDto>>? = null
    private var cachedRawRoutes: Map<String, CanonicalRouteRawDto>? = null

    override suspend fun getRoutes(): List<TransitRouteSummary> = withContext(Dispatchers.IO) {
        cachedRoutes?.let { return@withContext it }
        ensureLoaded()
        cachedRoutes ?: emptyList()
    }

    override suspend fun getRouteDetail(routeId: String): TransitRouteDetail? = withContext(Dispatchers.IO) {
        ensureLoaded()
        val rawRoute = cachedRawRoutes?.get(routeId) ?: return@withContext null
        val region = TransitRegion.fromString(rawRoute.serviceArea)
            ?: TransitRegion.inferFromRouteNumber(rawRoute.routeNumber)

        // Get sequences and build stops list
        val sequences = cachedSequences?.get(routeId) ?: emptyList()
        val forwardSeq = sequences.firstOrNull { it.direction == "forward" } ?: sequences.firstOrNull()
        val stopItems = forwardSeq?.stops?.map { s ->
            val tier = StopVerificationTier.fromString(s.coordinateStatus)
            TransitStop(
                stopId = s.stopId,
                name = s.normalizedStopName ?: s.rawStopName ?: s.stopId,
                sequenceOrder = s.sequence,
                latitude = s.latitude,
                longitude = s.longitude,
                tier = tier,
                routesServing = listOf(rawRoute.routeNumber)
            )
        } ?: emptyList()

        // Get schedules
        val rawScheds = cachedSchedules?.get(routeId) ?: emptyList()
        val scheduleList = rawScheds.map { sc ->
            TransitSchedule(
                scheduleId = sc.scheduleId,
                groupLabel = sc.direction ?: sc.terminus ?: "Outbound",
                terminus = sc.terminus ?: sc.destination ?: rawRoute.destination ?: "",
                totalTrips = sc.departureTimes.size,
                departureTimes = sc.departureTimes,
                sourceDocument = sc.sourceDocument ?: rawRoute.sourceDocument,
                effectiveDate = sc.effectiveDate ?: rawRoute.effectiveDate
            )
        }

        TransitRouteDetail(
            routeId = rawRoute.routeId,
            routeNumber = rawRoute.routeNumber,
            routeName = rawRoute.routeName,
            region = region,
            operatorName = rawRoute.operator,
            networkType = rawRoute.networkType,
            origin = rawRoute.origin,
            destination = rawRoute.destination ?: "",
            via = rawRoute.via,
            stops = stopItems,
            schedules = scheduleList,
            isGeometryAvailable = false,
            geometryStatus = "NONE",
            sourceDocument = rawRoute.sourceDocument,
            effectiveDate = rawRoute.effectiveDate
        )
    }

    override suspend fun getStop(stopId: String): TransitStop? = withContext(Dispatchers.IO) {
        ensureLoaded()
        // Search through all sequences to find the stop and all serving routes
        val servingRoutes = mutableListOf<String>()
        var foundStop: TransitStop? = null

        cachedSequences?.values?.forEach { seqList ->
            seqList.forEach { seq ->
                seq.stops.forEach { s ->
                    if (s.stopId == stopId) {
                        seq.routeNumber?.let { if (!servingRoutes.contains(it)) servingRoutes.add(it) }
                        if (foundStop == null) {
                            foundStop = TransitStop(
                                stopId = s.stopId,
                                name = s.normalizedStopName ?: s.rawStopName ?: s.stopId,
                                sequenceOrder = s.sequence,
                                latitude = s.latitude,
                                longitude = s.longitude,
                                tier = StopVerificationTier.fromString(s.coordinateStatus)
                            )
                        }
                    }
                }
            }
        }

        foundStop?.copy(routesServing = servingRoutes.sorted())
    }

    private fun ensureLoaded() {
        if (cachedRoutes != null && cachedSchedules != null && cachedSequences != null) return

        try {
            // Load routes.json
            val routesStream: InputStream = context.assets.open("transit/routes.json")
            val routesJson = routesStream.bufferedReader().use { it.readText() }
            val rawRoutes = ApiClient.json.decodeFromString<List<CanonicalRouteRawDto>>(routesJson)

            cachedRawRoutes = rawRoutes.associateBy { it.routeId }
            cachedRoutes = rawRoutes.map { r ->
                val region = TransitRegion.fromString(r.serviceArea)
                    ?: TransitRegion.inferFromRouteNumber(r.routeNumber)
                TransitRouteSummary(
                    routeId = r.routeId,
                    routeNumber = r.routeNumber,
                    routeName = r.routeName,
                    region = region,
                    operatorName = r.operator,
                    networkType = r.networkType,
                    origin = r.origin,
                    destination = r.destination ?: "",
                    via = r.via,
                    hasSchedule = r.hasSchedule,
                    totalStops = r.totalStops
                )
            }

            // Load schedules.json
            val schedStream: InputStream = context.assets.open("transit/schedules.json")
            val schedJson = schedStream.bufferedReader().use { it.readText() }
            val rawScheds = ApiClient.json.decodeFromString<List<CanonicalScheduleRawDto>>(schedJson)
            cachedSchedules = rawScheds.groupBy { it.routeId }

            // Load route_stops.json
            val seqStream: InputStream = context.assets.open("transit/route_stops.json")
            val seqJson = seqStream.bufferedReader().use { it.readText() }
            val rawSeqs = ApiClient.json.decodeFromString<List<CanonicalRouteSequenceDto>>(seqJson)
            cachedSequences = rawSeqs.groupBy { it.routeId }

        } catch (e: Exception) {
            // Calm degradation: empty cached state
            cachedRoutes = cachedRoutes ?: emptyList()
            cachedSchedules = cachedSchedules ?: emptyMap()
            cachedSequences = cachedSequences ?: emptyMap()
            cachedRawRoutes = cachedRawRoutes ?: emptyMap()
        }
    }
}
