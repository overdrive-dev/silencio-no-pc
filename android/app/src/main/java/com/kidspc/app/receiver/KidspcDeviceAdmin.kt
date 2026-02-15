package com.kidspc.app.receiver

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Device admin receiver — prevents the app from being uninstalled
 * without first disabling device admin.
 */
class KidspcDeviceAdmin : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        Log.i(TAG, "Device admin enabled")
    }

    override fun onDisabled(context: Context, intent: Intent) {
        Log.w(TAG, "Device admin disabled — app can now be uninstalled")
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        return "Desativar o administrador permitirá a desinstalação do KidsPC. " +
                "Isso requer autorização do responsável."
    }

    companion object {
        private const val TAG = "KidspcDeviceAdmin"
    }
}
