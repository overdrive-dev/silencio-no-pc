package com.kidspc.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.kidspc.app.service.KidspcService

/**
 * Starts the foreground service on device boot if the app is paired.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i(TAG, "Boot completed — checking if paired")

            // Read isPaired from encrypted prefs
            // Note: We can't inject here, so read directly
            try {
                val prefs = context.getSharedPreferences("kidspc_config", Context.MODE_PRIVATE)
                // EncryptedSharedPreferences wraps this, but for boot we just start the service
                // and let it check pairing status
                KidspcService.start(context)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start service on boot", e)
            }
        }
    }

    companion object {
        private const val TAG = "BootReceiver"
    }
}
