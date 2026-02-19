# Android App Architecture

## Package: `com.kidspc.app`

Tech: Kotlin 2.1, Jetpack Compose, Hilt DI, supabase-kt 3.1, EncryptedSharedPreferences.
minSdk 26, targetSdk 35.

## Key Components

| Component | Type | Responsibility |
|---|---|---|
| `KidspcService` | Foreground Service | 30s sync loop + 60s usage tracking |
| `AppBlockerService` | AccessibilityService | Monitors and blocks forbidden apps |
| `SyncRepository` | Repository | Supabase heartbeat, commands, settings, daily usage, token claim |
| `PairingScreen` | Composable | 6-digit token entry UI |
| `PermissionsScreen` | Composable | Accessibility, usage stats, device admin permissions |
| `StatusScreen` | Composable | Current status display (time remaining, strikes, etc.) |
| `LockScreen` | Composable | Fullscreen overlay when time is up |
| `BootReceiver` | BroadcastReceiver | Auto-start service on boot |
| `KidspcDeviceAdmin` | DeviceAdminReceiver | Prevent uninstall |
| `AppConfig` | Singleton | EncryptedSharedPreferences wrapper |

## DI (Hilt)

- `AppModule` provides Supabase client, AppConfig, SyncRepository
- All ViewModels use `@HiltViewModel` with constructor injection
- Supabase client is initialized once with device JWT auth

## DB Integration

- `platform` column on `pcs` table distinguishes Windows/Android
- Claim API accepts `platform` and `name` fields
- Same per-device JWT pattern as desktop (HS256, 1-year expiry)

## Permissions Required

- `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_SPECIAL_USE`
- `QUERY_ALL_PACKAGES` (app blocking)
- `PACKAGE_USAGE_STATS` (usage tracking)
- `RECEIVE_BOOT_COMPLETED` (auto-start)
- Device Admin (prevent uninstall)
- Accessibility Service (app blocking)

## Build

- Gradle Kotlin DSL (`build.gradle.kts`)
- Version catalog: `gradle/libs.versions.toml`
- Needs launcher icons (mipmap) before final build
