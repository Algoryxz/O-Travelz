package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ChatMessageDto(
    val role: String,
    val content: String
)

@Serializable
data class AIConverseRequestDto(
    val messages: List<ChatMessageDto>
)

@Serializable
data class AIConverseResponseDto(
    val message: String,
    val status: String? = "ok",
    val language: String? = "en",
    val intent: String? = null,
    @SerialName("is_grounded") val isGrounded: Boolean = false
)
