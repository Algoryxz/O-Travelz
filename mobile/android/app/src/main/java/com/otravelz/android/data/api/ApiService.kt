package com.otravelz.android.data.api

import com.otravelz.android.data.model.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    @GET("places")
    suspend fun listPlaces(
        @Query("category") category: String? = null,
        @Query("district") district: String? = null,
        @Query("search") search: String? = null,
        @Query("limit") limit: Int = 50
    ): List<PlaceDetailDto>

    @GET("places/{id}")
    suspend fun getPlaceDetail(
        @Path("id") placeId: String
    ): PlaceDetailDto

    @GET("weather/current")
    suspend fun getCurrentWeather(
        @Query("lat") lat: Double? = null,
        @Query("lon") lon: Double? = null,
        @Query("location_name") locationName: String? = null
    ): WeatherResponseDto

    @POST("itinerary/plan")
    suspend fun planItinerary(
        @Body constraints: PlanningConstraintsDto
    ): ItineraryPlanResponseDto

    @POST("ai/plan")
    suspend fun planWithAi(
        @Body request: AIPlanRequestDto
    ): AIResponseDto

    @GET("transport/stops/nearby")
    suspend fun getNearbyStops(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("radius_m") radiusM: Int = 3000,
        @Query("limit") limit: Int = 10
    ): List<NearbyStopDto>

    @GET("api/v1/sync/saved-places")
    suspend fun getSavedPlaces(): SyncSavedPlacesResponseDto

    @POST("api/v1/sync/saved-places")
    suspend fun syncSavedPlaces(
        @Body request: SyncSavedPlacesRequestDto
    ): SyncSavedPlacesResponseDto

    @POST("api/v1/trips/share")
    suspend fun shareTrip(
        @Body request: CreateShareTripRequestDto
    ): CreateShareTripResponseDto

    @GET("api/v1/trips/shared/{share_id}")
    suspend fun getSharedTrip(
        @Path("share_id") shareId: String
    ): CreateShareTripRequestDto

    @GET("api/v1/sync/trips")
    suspend fun getSavedTrips(): SyncTripsResponseDto

    @POST("api/v1/sync/trips")
    suspend fun syncSavedTrips(
        @Body request: SyncTripsRequestDto
    ): SyncTripsResponseDto
}
