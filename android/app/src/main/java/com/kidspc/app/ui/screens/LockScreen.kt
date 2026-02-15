package com.kidspc.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/**
 * Full-screen lock overlay shown when time is up or device is locked.
 * Displayed as a system overlay (SYSTEM_ALERT_WINDOW).
 */
@Composable
fun LockScreen(reason: String = "time_up") {
    val isTimedOut = reason == "time_up"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1E1B4B)), // Deep indigo
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(48.dp),
        ) {
            Icon(
                imageVector = if (isTimedOut) Icons.Default.Timer else Icons.Default.Lock,
                contentDescription = null,
                tint = Color.White.copy(alpha = 0.8f),
                modifier = Modifier.size(80.dp),
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = if (isTimedOut) "Tempo esgotado!" else "Dispositivo bloqueado",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (isTimedOut) {
                    "O tempo de uso diário acabou.\nPeça mais tempo ao responsável."
                } else {
                    "Este dispositivo foi bloqueado\npelo responsável."
                },
                style = MaterialTheme.typography.bodyLarge,
                color = Color.White.copy(alpha = 0.7f),
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(48.dp))

            Surface(
                color = Color.White.copy(alpha = 0.1f),
                shape = MaterialTheme.shapes.medium,
            ) {
                Text(
                    text = "Acesse kidspc.vercel.app\npara gerenciar o dispositivo",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.5f),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(16.dp),
                )
            }
        }
    }
}
