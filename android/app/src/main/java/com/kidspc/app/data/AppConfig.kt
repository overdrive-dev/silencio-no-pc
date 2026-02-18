package com.kidspc.app.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Encrypted local config — mirrors desktop's config.py.
 * Stores pairing state, pc_id, user_id, and cached settings.
 */
class AppConfig(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "kidspc_config",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    var isPaired: Boolean
        get() = prefs.getBoolean(KEY_PAIRED, false)
        set(value) = prefs.edit().putBoolean(KEY_PAIRED, value).apply()

    var pcId: String
        get() = prefs.getString(KEY_PC_ID, "") ?: ""
        set(value) = prefs.edit().putString(KEY_PC_ID, value).apply()

    var userId: String
        get() = prefs.getString(KEY_USER_ID, "") ?: ""
        set(value) = prefs.edit().putString(KEY_USER_ID, value).apply()

    var deviceJwt: String
        get() = prefs.getString(KEY_DEVICE_JWT, "") ?: ""
        set(value) = prefs.edit().putString(KEY_DEVICE_JWT, value).apply()

    var deviceName: String
        get() = prefs.getString(KEY_DEVICE_NAME, android.os.Build.MODEL) ?: android.os.Build.MODEL
        set(value) = prefs.edit().putString(KEY_DEVICE_NAME, value).apply()

    // Cached settings from server
    var dailyLimitMinutes: Int
        get() = prefs.getInt(KEY_DAILY_LIMIT, 120)
        set(value) = prefs.edit().putInt(KEY_DAILY_LIMIT, value).apply()

    var isLocked: Boolean
        get() = prefs.getBoolean(KEY_LOCKED, false)
        set(value) = prefs.edit().putBoolean(KEY_LOCKED, value).apply()

    fun clearPairing() {
        prefs.edit()
            .putBoolean(KEY_PAIRED, false)
            .putString(KEY_PC_ID, "")
            .putString(KEY_USER_ID, "")
            .putString(KEY_DEVICE_JWT, "")
            .apply()
    }

    companion object {
        private const val KEY_PAIRED = "paired"
        private const val KEY_PC_ID = "pc_id"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_DEVICE_NAME = "device_name"
        private const val KEY_DEVICE_JWT = "device_jwt"
        private const val KEY_DAILY_LIMIT = "daily_limit_minutes"
        private const val KEY_LOCKED = "locked"
    }
}
