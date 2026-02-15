package com.kidspc.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val KidspcColors = lightColorScheme(
    primary = Color(0xFF4F46E5),       // Indigo 600
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE0E7FF), // Indigo 100
    secondary = Color(0xFF0D9488),      // Teal 600
    onSecondary = Color.White,
    background = Color(0xFFF9FAFB),     // Gray 50
    surface = Color.White,
    error = Color(0xFFDC2626),          // Red 600
    onBackground = Color(0xFF111827),   // Gray 900
    onSurface = Color(0xFF111827),
    outline = Color(0xFFD1D5DB),        // Gray 300
)

@Composable
fun KidspcTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = KidspcColors,
        typography = Typography(),
        content = content,
    )
}
