package com.kidspc.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Mirrors `pcs` table in Supabase */
@Serializable
data class PC(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val name: String = "",
    @SerialName("is_online") val isOnline: Boolean = false,
    @SerialName("app_running") val appRunning: Boolean = false,
    @SerialName("last_heartbeat") val lastHeartbeat: String? = null,
    @SerialName("paired_at") val pairedAt: String? = null,
    @SerialName("platform") val platform: String = "android",
)

/** Mirrors `pc_settings` table */
@Serializable
data class PCSettings(
    val id: String = "",
    @SerialName("pc_id") val pcId: String = "",
    @SerialName("daily_limit_minutes") val dailyLimitMinutes: Int = 120,
    @SerialName("penalty_minutes") val penaltyMinutes: Int = 15,
    @SerialName("is_locked") val isLocked: Boolean = false,
    @SerialName("schedule_enabled") val scheduleEnabled: Boolean = false,
    @SerialName("schedule_start") val scheduleStart: String? = null,
    @SerialName("schedule_end") val scheduleEnd: String? = null,
    @SerialName("app_block_mode") val appBlockMode: String = "blacklist",
    @SerialName("site_block_mode") val siteBlockMode: String = "blacklist",
)

/** Mirrors `commands` table */
@Serializable
data class Command(
    val id: String = "",
    @SerialName("pc_id") val pcId: String = "",
    val command: String = "",
    val payload: String? = null,
    val status: String = "pending",
)

/** Mirrors `blocked_apps` table */
@Serializable
data class BlockedApp(
    val id: String = "",
    @SerialName("pc_id") val pcId: String = "",
    @SerialName("package_name") val packageName: String = "",
    val name: String = "",
)

/** Mirrors `blocked_sites` table */
@Serializable
data class BlockedSite(
    val id: String = "",
    @SerialName("pc_id") val pcId: String = "",
    val domain: String = "",
)

/** Response from /api/dispositivos/claim */
@Serializable
data class ClaimResponse(
    @SerialName("pc_id") val pcId: String,
    @SerialName("user_id") val userId: String,
    @SerialName("device_jwt") val deviceJwt: String = "",
)

/** Heartbeat update payload */
@Serializable
data class HeartbeatUpdate(
    @SerialName("is_online") val isOnline: Boolean = true,
    @SerialName("app_running") val appRunning: Boolean = true,
    @SerialName("last_heartbeat") val lastHeartbeat: String,
)

/** Daily usage upsert */
@Serializable
data class DailyUsageUpsert(
    @SerialName("pc_id") val pcId: String,
    @SerialName("user_id") val userId: String,
    val date: String,
    @SerialName("total_minutes") val totalMinutes: Int,
    @SerialName("active_minutes") val activeMinutes: Int,
)
