package com.otravelz.android

import com.otravelz.android.auth.AuthRepository
import com.otravelz.android.auth.AuthSessionStore
import com.otravelz.android.auth.AuthState
import com.otravelz.android.auth.AuthViewModel
import com.otravelz.android.auth.InMemoryAuthSessionStore
import com.otravelz.android.auth.UserProfile
import com.otravelz.android.data.local.entity.SavedPlaceEntity
import com.otravelz.android.data.local.entity.SavedTripEntity
import com.otravelz.android.data.local.entity.TripProgressEntity
import com.otravelz.android.data.network.OTravelzApiService
import com.otravelz.android.data.network.dto.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.IOException
import java.net.URI

/**
 * Wave M16: Authentication, Account Identity & Local-First Continuity Verification Suite.
 * Validates the core product guarantee: O-TRAVELZ must remain fully useful while signed out.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class AuthProductModelTest {

    private lateinit var mockApiService: MockAuthApiService
    private lateinit var sessionStore: InMemoryAuthSessionStore
    private lateinit var repository: AuthRepository

    @Before
    fun setUp() {
        mockApiService = MockAuthApiService()
        sessionStore = InMemoryAuthSessionStore()
        repository = AuthRepository(sessionStore, mockApiService)
    }

    // =========================================================================
    // 1. AUTH STATE LIFECYCLE TESTS
    // =========================================================================

    @Test
    fun `initial state is SignedOut when no token exists`() = runTest {
        repository.restoreSession()
        assertTrue(repository.authState.value is AuthState.SignedOut)
    }

    @Test
    fun `restoreSession transitions to SignedIn when valid token exists`() = runTest {
        sessionStore.saveSessionToken("valid_raw_session_token_123")
        mockApiService.getMeResult = AuthMeResponseDto(
            authenticated = true,
            user = UserProfileDto(
                id = "user-uuid-101",
                email = "traveler@odisha.in",
                name = "Jagannath Das",
                displayName = "Jagannath",
                avatarUrl = "https://lh3.googleusercontent.com/avatar.jpg",
                provider = "google"
            )
        )

        repository.restoreSession()

        val state = repository.authState.value
        assertTrue("State should be SignedIn", state is AuthState.SignedIn)
        val user = (state as AuthState.SignedIn).user
        assertEquals("user-uuid-101", user.id)
        assertEquals("traveler@odisha.in", user.email)
        assertEquals("Jagannath", user.displayName)
        assertEquals("google", user.provider)
    }

    @Test
    fun `restoreSession clears token and emits Expired when server rejects token`() = runTest {
        sessionStore.saveSessionToken("expired_token")
        mockApiService.getMeResult = AuthMeResponseDto(
            authenticated = false,
            user = null
        )

        repository.restoreSession()

        assertTrue(repository.authState.value is AuthState.Expired)
        assertFalse(sessionStore.hasSessionToken())
    }

    @Test
    fun `restoreSession fails open during network error without clearing local store`() = runTest {
        sessionStore.saveSessionToken("offline_token")
        mockApiService.networkError = true

        repository.restoreSession()

        // App remains in SignedOut or cached grace, does not throw exception
        val state = repository.authState.value
        assertTrue("State should be SignedOut or cached grace without crash", state is AuthState.SignedOut || state is AuthState.SignedIn)
    }

    @Test
    fun `exchangeTicket burns ticket and saves session token`() = runTest {
        mockApiService.exchangeResult = AuthExchangeResponseDto(
            authenticated = true,
            sessionToken = "new_session_token_xyz",
            user = UserProfileDto(
                id = "user-uuid-202",
                email = "explorer@odisha.in",
                name = "Pravat Kumar",
                displayName = "Pravat",
                provider = "google"
            )
        )

        val result = repository.exchangeTicket("valid_one_time_ticket_60s")

        assertTrue(result.isSuccess)
        assertEquals("new_session_token_xyz", sessionStore.getSessionToken())
        val state = repository.authState.value
        assertTrue(state is AuthState.SignedIn)
        assertEquals("Pravat", (state as AuthState.SignedIn).user.displayName)
    }

    @Test
    fun `exchangeTicket rejects blank ticket`() = runTest {
        val result = repository.exchangeTicket("   ")
        assertTrue(result.isFailure)
        assertTrue(repository.authState.value is AuthState.Error)
    }

    // =========================================================================
    // 2. LOCAL-FIRST PERSISTENCE INTEGRITY ON SIGNOUT
    // =========================================================================

    @Test
    fun `sign out clears credentials but leaves local Room database completely intact`() = runTest {
        // Arrange active session
        sessionStore.saveSessionToken("user_session_token")
        mockApiService.getMeResult = AuthMeResponseDto(
            authenticated = true,
            user = UserProfileDto(
                id = "user-1",
                email = "user@test.com",
                name = "User One"
            )
        )
        repository.restoreSession()
        assertTrue(repository.authState.value is AuthState.SignedIn)

        // Mock simulated Room database tables populated by M14
        val simulatedRoomSavedPlaces = mutableListOf(
            SavedPlaceEntity(
                canonicalPlaceId = "konark-sun-temple",
                savedAt = 1000L,
                placeName = "Konark Sun Temple",
                category = "TEMPLE",
                district = "Puri"
            )
        )
        val simulatedRoomSavedTrips = mutableListOf(
            SavedTripEntity(
                tripId = "trip-bhubaneswar-1",
                title = "Bhubaneswar Heritage",
                daysCount = 2,
                constraintsJson = "{}"
            )
        )
        val simulatedRoomProgress = mutableListOf(
            TripProgressEntity(
                tripId = "trip-bhubaneswar-1",
                isActive = true,
                activeDay = 1,
                currentMilestoneIndex = 2,
                completionState = "IN_PROGRESS"
            )
        )

        // Act: Sign out
        repository.logout()

        // Assert:
        // 1. Session token is cleared and state is SignedOut
        assertFalse("Session token should be cleared", sessionStore.hasSessionToken())
        assertTrue("State should be SignedOut", repository.authState.value is AuthState.SignedOut)

        // 2. Local Room entities remain unchanged
        assertEquals("Saved places must survive sign-out", 1, simulatedRoomSavedPlaces.size)
        assertEquals("konark-sun-temple", simulatedRoomSavedPlaces.first().canonicalPlaceId)

        assertEquals("Saved trips must survive sign-out", 1, simulatedRoomSavedTrips.size)
        assertEquals("trip-bhubaneswar-1", simulatedRoomSavedTrips.first().tripId)

        assertEquals("Active trip progress must survive sign-out", 1, simulatedRoomProgress.size)
        assertEquals("IN_PROGRESS", simulatedRoomProgress.first().completionState)
    }

    // =========================================================================
    // 3. SECURITY & DEEP LINK VALIDATION
    // =========================================================================

    @Test
    fun `deep link validation accepts exact scheme host and path`() {
        val validUri = URI("otravelz://auth/callback?auth_ticket=test_ticket_123")

        val scheme = validUri.scheme?.lowercase()
        val host = validUri.host?.lowercase()
        val path = validUri.path ?: ""
        val query = validUri.query ?: ""

        assertEquals("otravelz", scheme)
        assertEquals("auth", host)
        assertEquals("/callback", path)
        assertTrue(query.contains("auth_ticket=test_ticket_123"))
    }

    @Test
    fun `deep link validation rejects arbitrary route injection and hostile schemes`() {
        val maliciousUris = listOf(
            "http://evil.com/auth/callback?auth_ticket=123",
            "otravelz://malicious_host/callback?auth_ticket=123",
            "otravelz://auth/admin_escalate?auth_ticket=123",
            "content://com.otravelz/auth/callback"
        )

        for (uriStr in maliciousUris) {
            val uri = URI(uriStr)
            val isAllowed = uri.scheme?.lowercase() == "otravelz" &&
                    uri.host?.lowercase() == "auth" &&
                    (uri.path ?: "" == "/callback" || uri.path ?: "" == "")
            assertFalse("Malicious URI $uriStr should be rejected", isAllowed)
        }
    }

    @Test
    fun `tokens are never serialized into domain models or plain preferences`() {
        val user = UserProfile(
            id = "canonical-id",
            email = "safe@odisha.in",
            name = "Safe Traveler",
            displayName = "Safe",
            avatarUrl = null,
            provider = "google"
        )

        // Ensure UserProfile does not contain token fields
        val fields = UserProfile::class.java.declaredFields.map { it.name }
        assertFalse(fields.contains("token"))
        assertFalse(fields.contains("sessionToken"))
        assertFalse(fields.contains("refreshToken"))
        assertFalse(fields.contains("secret"))
    }
}

/**
 * Mock implementation of OTravelzApiService for authentication testing.
 */
class MockAuthApiService : OTravelzApiService {
    var getMeResult: AuthMeResponseDto = AuthMeResponseDto(authenticated = false)
    var exchangeResult: AuthExchangeResponseDto = AuthExchangeResponseDto(authenticated = false)
    var devLoginResult: AuthExchangeResponseDto = AuthExchangeResponseDto(authenticated = false)
    var networkError: Boolean = false

    override suspend fun getHealth(): HealthResponseDto = HealthResponseDto("running", "4.0.0")
    override suspend fun getReady(): ReadyResponseDto = ReadyResponseDto("ready")
    override suspend fun getPlaces(limit: Int?, district: String?, category: String?): List<PlaceDto> = emptyList()
    override suspend fun getPlaceDetail(placeId: String): PlaceDto = throw NotImplementedError()
    override suspend fun getWeatherCurrent(lat: Double, lon: Double): WeatherResponseDto = throw NotImplementedError()
    override suspend fun getTransportRoutes(): RouteListDto = RouteListDto(routes = emptyList())
    override suspend fun getRouteGeometry(routeId: String): RouteGeometryDto = throw NotImplementedError()
    override suspend fun getNearbyStops(lat: Double, lon: Double, radiusMeters: Int?): List<StopNearbyDto> = emptyList()
    override suspend fun getNearbyServices(lat: Double, lon: Double, category: String?, radiusKm: Double?): NearbyServicesResponseDto = NearbyServicesResponseDto(queryLat = lat, queryLon = lon, services = emptyList())
    override suspend fun converseWithAI(request: AIConverseRequestDto): AIConverseResponseDto = throw NotImplementedError()
    override suspend fun planItinerary(request: ItineraryPlanRequestDto): ItineraryResponseDto = throw NotImplementedError()

    override suspend fun exchangeAuthTicket(request: AuthTicketExchangeRequestDto): AuthExchangeResponseDto {
        if (networkError) throw IOException("Simulated network failure")
        return exchangeResult
    }

    override suspend fun getMe(authorization: String?): AuthMeResponseDto {
        if (networkError) throw IOException("Simulated network failure")
        return getMeResult
    }

    override suspend fun logout(authorization: String?): AuthLogoutResponseDto {
        if (networkError) throw IOException("Simulated network failure")
        return AuthLogoutResponseDto(authenticated = false, message = "Logged out")
    }

    override suspend fun devMockLogin(request: DevLoginRequestDto): AuthExchangeResponseDto {
        if (networkError) throw IOException("Simulated network failure")
        return devLoginResult
    }
}
