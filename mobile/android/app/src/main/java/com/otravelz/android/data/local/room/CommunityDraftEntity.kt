package com.otravelz.android.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "community_drafts")
data class CommunityDraftEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val district: String,
    val category: String,
    val description: String,
    val imageUrl: String? = null,
    val tip: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
