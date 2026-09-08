package com.otravelz.android.data.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HealthResponseDto(
    val status: String,
    val version: String,
    @SerialName("git_sha") val gitSha: String? = null,
    @SerialName("alembic_version") val alembicVersion: String? = null,
    val database: String? = null
)

@Serializable
data class ReadyResponseDto(
    val status: String,
    val database: String? = null
)

@Serializable
data class ApiErrorDetailDto(
    val code: String,
    val message: String,
    val field: String? = null
)

@Serializable
data class ApiErrorResponseDto(
    val error: ApiErrorDetailDto,
    val details: List<Map<String, String?>> = emptyList()
)
