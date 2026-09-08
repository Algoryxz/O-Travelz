package com.otravelz.android.network

import com.otravelz.android.data.network.ApiClient
import com.otravelz.android.data.network.NetworkError
import com.otravelz.android.data.network.NetworkResult
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

class ApiClientMockWebServerTest {

    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun testSuccessfulHealthCall() = runBlocking {
        server.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody("""{"status":"ok","version":"4.0.0","database":"connected"}""")
        )

        val service = ApiClient.createService(baseUrl = server.url("/").toString())
        val result = ApiClient.safeApiCall { service.getHealth() }

        assertTrue(result is NetworkResult.Success)
        val data = (result as NetworkResult.Success).data
        assertEquals("ok", data.status)
        assertEquals("4.0.0", data.version)
    }

    @Test
    fun testHttp404ClientError() = runBlocking {
        server.enqueue(
            MockResponse()
                .setResponseCode(404)
                .setBody("""{"detail":"Place not found"}""")
        )

        val service = ApiClient.createService(baseUrl = server.url("/").toString())
        val result = ApiClient.safeApiCall { service.getPlaceDetail("nonexistent-id") }

        assertTrue(result is NetworkResult.Failure)
        val error = (result as NetworkResult.Failure).error
        assertTrue(error is NetworkError.HttpClientError)
        assertEquals(404, (error as NetworkError.HttpClientError).statusCode)
    }

    @Test
    fun testHttp422ValidationError() = runBlocking {
        server.enqueue(
            MockResponse()
                .setResponseCode(422)
                .setBody("""{"error":{"code":"validation_error","message":"Invalid itinerary request"}}""")
        )

        val service = ApiClient.createService(baseUrl = server.url("/").toString())
        val result = ApiClient.safeApiCall { service.getHealth() }

        assertTrue(result is NetworkResult.Failure)
        val error = (result as NetworkResult.Failure).error
        assertTrue(error is NetworkError.ValidationError)
    }

    @Test
    fun testHttp500ServerError() = runBlocking {
        server.enqueue(
            MockResponse()
                .setResponseCode(500)
                .setBody("""{"error":"Internal server error"}""")
        )

        val service = ApiClient.createService(baseUrl = server.url("/").toString())
        val result = ApiClient.safeApiCall { service.getHealth() }

        assertTrue(result is NetworkResult.Failure)
        val error = (result as NetworkResult.Failure).error
        assertTrue(error is NetworkError.HttpServerError)
        assertEquals(500, (error as NetworkError.HttpServerError).statusCode)
    }

    @Test
    fun testMalformedJsonDecodingError() = runBlocking {
        server.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody("""{"corrupt_json": [missing_bracket""")
        )

        val service = ApiClient.createService(baseUrl = server.url("/").toString())
        val result = ApiClient.safeApiCall { service.getHealth() }

        assertTrue(result is NetworkResult.Failure)
        val error = (result as NetworkResult.Failure).error
        assertTrue("Malformed JSON must map to DecodingError", error is NetworkError.DecodingError)
    }

    @Test
    fun testTimeoutHandling() = runBlocking {
        server.enqueue(
            MockResponse()
                .setBody("""{"status":"ok"}""")
                .setBodyDelay(1000, TimeUnit.MILLISECONDS)
        )

        val okHttpClient = OkHttpClient.Builder()
            .readTimeout(100, TimeUnit.MILLISECONDS)
            .build()

        val service = ApiClient.createService(
            baseUrl = server.url("/").toString(),
            okHttpClient = okHttpClient
        )
        val result = ApiClient.safeApiCall { service.getHealth() }

        assertTrue(result is NetworkResult.Failure)
        val error = (result as NetworkResult.Failure).error
        assertTrue("Delayed response must map to Timeout", error is NetworkError.Timeout)
    }
}
