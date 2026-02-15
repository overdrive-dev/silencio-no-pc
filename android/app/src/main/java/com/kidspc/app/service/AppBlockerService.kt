package com.kidspc.app.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * Accessibility service that detects foreground app changes and blocks restricted apps.
 * The blocked app list is managed via the web dashboard and synced by KidspcService.
 */
class AppBlockerService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 100
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
        }
        Log.i(TAG, "AppBlockerService connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Skip our own app and system UI
        if (packageName == "com.kidspc.app" ||
            packageName == "com.android.systemui" ||
            packageName == "com.android.launcher" ||
            packageName.startsWith("com.android.launcher")) {
            return
        }

        if (isBlocked(packageName)) {
            Log.i(TAG, "Blocked app detected: $packageName — sending back to home")
            goHome()
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "AppBlockerService interrupted")
    }

    private fun isBlocked(packageName: String): Boolean {
        val mode = blockedMode
        return if (mode == "whitelist") {
            // Whitelist mode: block everything not in the list
            packageName !in allowedPackages && allowedPackages.isNotEmpty()
        } else {
            // Blacklist mode: block only listed packages
            packageName in blockedPackages
        }
    }

    private fun goHome() {
        val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(intent)
    }

    companion object {
        private const val TAG = "AppBlockerService"

        // Updated by KidspcService when settings are synced
        var blockedPackages: Set<String> = emptySet()
        var allowedPackages: Set<String> = emptySet()
        var blockedMode: String = "blacklist"
    }
}
