package com.kidspc.app

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import com.kidspc.app.data.AppConfig
import com.kidspc.app.service.KidspcService
import com.kidspc.app.ui.screens.LockScreen
import com.kidspc.app.ui.screens.PairingScreen
import com.kidspc.app.ui.screens.PermissionsScreen
import com.kidspc.app.ui.screens.StatusScreen
import com.kidspc.app.ui.theme.KidspcTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var config: AppConfig

    private var screenState = mutableStateOf(ScreenState.LOADING)
    private var lockReason = mutableStateOf("time_up")

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { /* proceed regardless */ }

    private val serviceReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                KidspcService.ACTION_LOCK_SCREEN -> {
                    lockReason.value = intent.getStringExtra("reason") ?: "time_up"
                    screenState.value = ScreenState.LOCKED
                }
                KidspcService.ACTION_UNLOCK_SCREEN -> {
                    screenState.value = ScreenState.STATUS
                }
                KidspcService.ACTION_UNPAIRED -> {
                    screenState.value = ScreenState.PAIRING
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request notification permission (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // Determine initial screen
        screenState.value = if (config.isPaired) ScreenState.STATUS else ScreenState.PAIRING

        setContent {
            KidspcTheme {
                val state by screenState

                when (state) {
                    ScreenState.LOADING -> {
                        // Brief splash — resolves immediately
                    }
                    ScreenState.PAIRING -> {
                        PairingScreen(
                            onPaired = {
                                screenState.value = ScreenState.PERMISSIONS
                            }
                        )
                    }
                    ScreenState.PERMISSIONS -> {
                        PermissionsScreen(
                            onAllGranted = {
                                startMonitoring()
                                screenState.value = ScreenState.STATUS
                            }
                        )
                    }
                    ScreenState.STATUS -> {
                        StatusScreen(config = config)
                    }
                    ScreenState.LOCKED -> {
                        LockScreen(reason = lockReason.value)
                    }
                }
            }
        }

        // Start service if already paired
        if (config.isPaired) {
            startMonitoring()
        }
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter().apply {
            addAction(KidspcService.ACTION_LOCK_SCREEN)
            addAction(KidspcService.ACTION_UNLOCK_SCREEN)
            addAction(KidspcService.ACTION_UNPAIRED)
        }
        registerReceiver(serviceReceiver, filter, RECEIVER_NOT_EXPORTED)
    }

    override fun onPause() {
        super.onPause()
        try {
            unregisterReceiver(serviceReceiver)
        } catch (_: Exception) { }
    }

    private fun startMonitoring() {
        KidspcService.start(this)
    }

    enum class ScreenState {
        LOADING, PAIRING, PERMISSIONS, STATUS, LOCKED
    }
}
