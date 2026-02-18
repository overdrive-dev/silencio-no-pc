package com.kidspc.app.data

import com.kidspc.app.data.models.*
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncRepository @Inject constructor(
    private val supabase: SupabaseClient,
    private val config: AppConfig,
) {
    private var orphanCheckCount = 0

    /**
     * Send heartbeat — update pcs table. Returns false if PC not found (orphaned).
     */
    suspend fun sendHeartbeat(): Boolean {
        val pcId = config.pcId
        if (pcId.isBlank()) return false

        val now = Instant.now().atOffset(ZoneOffset.UTC)
            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)

        val result = supabase.postgrest["pcs"]
            .update(HeartbeatUpdate(isOnline = true, appRunning = true, lastHeartbeat = now)) {
                filter { eq("id", pcId) }
            }

        // Check if update affected any rows (PC still exists)
        val updated = result.data.let {
            try {
                Json.parseToJsonElement(it).toString() != "[]"
            } catch (_: Exception) {
                true // Assume OK if we can't parse
            }
        }

        if (!updated) {
            orphanCheckCount++
            if (orphanCheckCount >= 3) {
                // PC was deleted from server — trigger unpair
                config.clearPairing()
                orphanCheckCount = 0
                return false
            }
        } else {
            orphanCheckCount = 0
        }

        return true
    }

    /**
     * Fetch pending commands and mark them as executed.
     */
    suspend fun fetchAndExecuteCommands(): List<Command> {
        val pcId = config.pcId
        if (pcId.isBlank()) return emptyList()

        val commands = supabase.postgrest["commands"]
            .select {
                filter {
                    eq("pc_id", pcId)
                    eq("status", "pending")
                }
            }
            .decodeList<Command>()

        // Mark as executed
        for (cmd in commands) {
            supabase.postgrest["commands"]
                .update(mapOf("status" to "executed")) {
                    filter { eq("id", cmd.id) }
                }
        }

        return commands
    }

    /**
     * Fetch current settings from server.
     */
    suspend fun fetchSettings(): PCSettings? {
        val pcId = config.pcId
        if (pcId.isBlank()) return null

        return try {
            supabase.postgrest["pc_settings"]
                .select {
                    filter { eq("pc_id", pcId) }
                    limit(1)
                }
                .decodeSingleOrNull<PCSettings>()
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Fetch blocked apps list.
     */
    suspend fun fetchBlockedApps(): List<BlockedApp> {
        val pcId = config.pcId
        if (pcId.isBlank()) return emptyList()

        return try {
            supabase.postgrest["blocked_apps"]
                .select {
                    filter { eq("pc_id", pcId) }
                }
                .decodeList<BlockedApp>()
        } catch (_: Exception) {
            emptyList()
        }
    }

    /**
     * Upsert daily usage for today.
     */
    suspend fun upsertDailyUsage(totalMinutes: Int, activeMinutes: Int) {
        val pcId = config.pcId
        val userId = config.userId
        if (pcId.isBlank() || userId.isBlank()) return

        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

        try {
            supabase.postgrest["daily_usage"]
                .upsert(
                    DailyUsageUpsert(
                        pcId = pcId,
                        userId = userId,
                        date = today,
                        totalMinutes = totalMinutes,
                        activeMinutes = activeMinutes,
                    )
                ) {
                    onConflict = "pc_id,date"
                }
        } catch (_: Exception) {
            // Non-critical, will retry next cycle
        }
    }

    /**
     * Claim a pairing token via the web API.
     */
    suspend fun claimToken(token: String): ClaimResponse? {
        val apiUrl = com.kidspc.app.BuildConfig.API_BASE_URL
        val url = "$apiUrl/api/dispositivos/claim"

        return try {
            val client = java.net.URL(url).openConnection() as java.net.HttpURLConnection
            client.requestMethod = "POST"
            client.setRequestProperty("Content-Type", "application/json")
            client.doOutput = true

            val body = """{"token":"$token","name":"${config.deviceName}","platform":"android"}"""
            client.outputStream.write(body.toByteArray())

            if (client.responseCode == 200) {
                val response = client.inputStream.bufferedReader().readText()
                val json = Json.parseToJsonElement(response).jsonObject
                ClaimResponse(
                    pcId = json["pc_id"]?.jsonPrimitive?.content ?: return null,
                    userId = json["user_id"]?.jsonPrimitive?.content ?: return null,
                    deviceJwt = json["device_jwt"]?.jsonPrimitive?.content ?: "",
                )
            } else {
                null
            }
        } catch (_: Exception) {
            null
        }
    }
}
