package com.otravelz.android.data.network

import com.otravelz.android.data.network.dto.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Retrofit interface representing the 11 core MOBILE_REQUIRED_NOW backend contracts.
 */
interface OTravelzApiService {

    @GET("health")
    suspend fun getHealth(): HealthResponseDto

    @GET("ready")
    suspend fun getReady(): ReadyResponseDto

    @GET("places")
    suspend fun getPlaces(
        @Query("limit") limit: Int? = null,
        @Query("district") district: String? = null,
        @Query("category") category: String? = null
    ): List<PlaceDto>

    @GET("places/{place_id}")
    suspend fun getPlaceDetail(
        @Path("place_id") placeId: String
    ): PlaceDto

    @GET("weather/current")
    suspend fun getWeatherCurrent(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double
    ): WeatherResponseDto

    @GET("api/transport/routes")
    suspend fun getTransportRoutes(): RouteListDto

    @GET("api/transport/routes/{route_id}/geometry")
    suspend fun getRouteGeometry(
        @Path("route_id") routeId: String
    ): RouteGeometryDto

    @GET("transport/stops/nearby")
    suspend fun getNearbyStops(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("radius_m") radiusMeters: Int? = null
    ): List<StopNearbyDto>

    @GET("api/v1/services/nearby")
    suspend fun getNearbyServices(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("category") category: String? = null,
        @Query("radius_km") radiusKm: Double? = null
    ): NearbyServicesResponseDto

    @POST("ai/converse")
    suspend fun converseWithAI(
        @Body request: AIConverseRequestDto
    ): AIConverseResponseDto

    @POST("itinerary/plan")
    suspend fun planItinerary(
        @Body request: ItineraryPlanRequestDto
    ): ItineraryResponseDto
}
