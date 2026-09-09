package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AuthTicketExchangeRequestDto(
    val ticket: String
)

@Serializable
data class UserProfileDto(
    val id: String,
    val email: String,
    val name: String,
    @SerialName("display_name") val displayName: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val provider: String = "google"
)

@Serializable
data class AuthExchangeResponseDto(
    val authenticated: Boolean = false,
    val user: UserProfileDto? = null,
    @SerialName("session_token") val sessionToken: String? = null,
    @SerialName("exchange_ticket") val exchangeTicket: String? = null
)

@Serializable
data class AuthMeResponseDto(
    val authenticated: Boolean = false,
    val user: UserProfileDto? = null
)

@Serializable
data class AuthLogoutResponseDto(
    val authenticated: Boolean = false,
    val message: String? = null
)

@Serializable
data class DevLoginRequestDto(
    val email: String = "traveler@odisha.in",
    val name: String = "Odisha Traveler"
)
