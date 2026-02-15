package com.kidspc.app.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.kidspc.app.KidspcApp
import com.kidspc.app.MainActivity
import com.kidspc.app.R
import com.kidspc.app.data.AppConfig
import com.kidspc.app.data.SyncRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.*
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import javax.inject.Inject

@AndroidEntryPoint
class KidspcService : Service() {

    @Inject lateinit var config: AppConfig
    @Inject lateinit var syncRepo: SyncRepository

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var syncJob: Job? = null
    private var usageTrackingJob: Job? = null

    // Usage tracking
    private var todayActiveMinutes = 0
    private var todayTotalMinutes = 0
    private var lastTrackingDate: LocalDate = LocalDate.now()

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopSelf()
                return START_NOT_STICKY
            }
        }

        startSync()
        startUsageTracking()

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    private fun startSync() {
        syncJob?.cancel()
        syncJob = scope.launch {
            while (isActive) {
                try {
                    if (config.isPaired) {
                        // 1. Heartbeat
                        val stillPaired = syncRepo.sendHeartbeat()
                        if (!stillPaired) {
                            Log.w(TAG, "PC removed from server — unpaired")
                            config.clearPairing()
                            broadcastUnpaired()
                            break
                        }

                        // 2. Fetch & execute commands
                        val commands = syncRepo.fetchAndExecuteCommands()
                        for (cmd in commands) {
                            handleCommand(cmd.command, cmd.payload)
                        }

                        // 3. Sync settings
                        val settings = syncRepo.fetchSettings()
                        if (settings != null) {
                            config.dailyLimitMinutes = settings.dailyLimitMinutes
                            config.isLocked = settings.isLocked
                        }

                        // 4. Upload daily usage
                        syncRepo.upsertDailyUsage(todayTotalMinutes, todayActiveMinutes)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Sync error", e)
                }

                delay(SYNC_INTERVAL_MS)
            }
        }
    }

    private fun startUsageTracking() {
        usageTrackingJob?.cancel()
        usageTrackingJob = scope.launch {
            while (isActive) {
                try {
                    val today = LocalDate.now()
                    if (today != lastTrackingDate) {
                        // New day — reset counters
                        todayActiveMinutes = 0
                        todayTotalMinutes = 0
                        lastTrackingDate = today
                    }

                    val stats = getUsageStatsManager()
                    if (stats != null) {
                        val startOfDay = today.atStartOfDay(ZoneId.systemDefault())
                            .toInstant().toEpochMilli()
                        val now = System.currentTimeMillis()

                        val usageStats = stats.queryUsageStats(
                            UsageStatsManager.INTERVAL_DAILY, startOfDay, now
                        )

                        // Sum foreground time of all non-system apps
                        val totalMs = usageStats
                            ?.filter { it.totalTimeInForeground > 0 }
                            ?.sumOf { it.totalTimeInForeground } ?: 0

                        todayTotalMinutes = (totalMs / 60_000).toInt()
                        todayActiveMinutes = todayTotalMinutes // On mobile, foreground ≈ active

                        // Check time limit
                        checkTimeLimit()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Usage tracking error", e)
                }

                delay(USAGE_CHECK_INTERVAL_MS)
            }
        }
    }

    private fun checkTimeLimit() {
        if (config.isLocked) {
            broadcastLockScreen(reason = "locked")
            return
        }

        val limit = config.dailyLimitMinutes
        if (limit > 0 && todayActiveMinutes >= limit) {
            broadcastLockScreen(reason = "time_up")
        }
    }

    private fun handleCommand(command: String, payload: String?) {
        Log.i(TAG, "Executing command: $command")
        when (command) {
            "lock" -> {
                config.isLocked = true
                broadcastLockScreen(reason = "locked")
            }
            "unlock" -> {
                config.isLocked = false
                broadcastUnlockScreen()
            }
            "add_time" -> {
                val minutes = parseMinutes(payload)
                config.dailyLimitMinutes += minutes
                broadcastUnlockScreen()
            }
            "remove_time" -> {
                val minutes = parseMinutes(payload)
                config.dailyLimitMinutes = maxOf(0, config.dailyLimitMinutes - minutes)
                checkTimeLimit()
            }
            "unpair" -> {
                config.clearPairing()
                broadcastUnpaired()
                stopSelf()
            }
        }
    }

    private fun parseMinutes(payload: String?): Int {
        if (payload == null) return 0
        return try {
            val json = kotlinx.serialization.json.Json.parseToJsonElement(payload)
            json.jsonObject["minutes"]?.jsonPrimitive?.int ?: 0
        } catch (_: Exception) {
            0
        }
    }

    // Broadcasts to UI
    private fun broadcastLockScreen(reason: String) {
        sendBroadcast(Intent(ACTION_LOCK_SCREEN).putExtra("reason", reason))
    }

    private fun broadcastUnlockScreen() {
        sendBroadcast(Intent(ACTION_UNLOCK_SCREEN))
    }

    private fun broadcastUnpaired() {
        sendBroadcast(Intent(ACTION_UNPAIRED))
    }

    private fun getUsageStatsManager(): UsageStatsManager? {
        return getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, KidspcApp.CHANNEL_SERVICE)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val TAG = "KidspcService"
        private const val NOTIFICATION_ID = 1
        private const val SYNC_INTERVAL_MS = 30_000L
        private const val USAGE_CHECK_INTERVAL_MS = 60_000L

        const val ACTION_STOP = "com.kidspc.app.STOP_SERVICE"
        const val ACTION_LOCK_SCREEN = "com.kidspc.app.LOCK_SCREEN"
        const val ACTION_UNLOCK_SCREEN = "com.kidspc.app.UNLOCK_SCREEN"
        const val ACTION_UNPAIRED = "com.kidspc.app.UNPAIRED"

        fun start(context: Context) {
            val intent = Intent(context, KidspcService::class.java)
            context.startForegroundService(intent)
        }
    }
}

// Extensions for JSON parsing in handleCommand
private val kotlinx.serialization.json.JsonElement.jsonObject
    get() = this as kotlinx.serialization.json.JsonObject
private val kotlinx.serialization.json.JsonElement.jsonPrimitive
    get() = this as kotlinx.serialization.json.JsonPrimitive
private val kotlinx.serialization.json.JsonPrimitive.int
    get() = this.content.toIntOrNull()
