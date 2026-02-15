# KidsPC Android App — Skill Reference

## Architecture

Kotlin + Jetpack Compose native Android app for the **child's device**. Mirrors the desktop Python app's functionality on Android.

```
android/app/src/main/java/com/kidspc/app/
├── KidspcApp.kt              # @HiltAndroidApp, notification channels
├── MainActivity.kt           # Screen routing (Pairing → Permissions → Status → Locked)
├── di/AppModule.kt           # Hilt providers (AppConfig, SupabaseClient)
├── data/
│   ├── AppConfig.kt          # EncryptedSharedPreferences (paired, pc_id, user_id, settings cache)
│   ├── SyncRepository.kt     # Supabase sync: heartbeat, commands, settings, daily usage, claim
│   └── models/Models.kt      # @Serializable data classes mirroring Supabase tables
├── service/
│   ├── KidspcService.kt      # Foreground service: sync loop (30s), usage tracking (60s), command execution
│   └── AppBlockerService.kt  # AccessibilityService: detects foreground app, blocks if restricted
├── receiver/
│   ├── BootReceiver.kt       # ACTION_BOOT_COMPLETED → start KidspcService
│   └── KidspcDeviceAdmin.kt  # Prevent uninstall (device admin)
└── ui/
    ├── theme/Theme.kt        # Material3 (indigo primary, teal secondary)
    ├── viewmodels/PairingViewModel.kt
    └── screens/
        ├── PairingScreen.kt      # 6-digit token input → claim API
        ├── PermissionsScreen.kt  # Guide user through USAGE_ACCESS + OVERLAY
        ├── StatusScreen.kt       # Shows pairing status, daily limit, lock state
        └── LockScreen.kt         # Full-screen overlay when time up or locked
```

## Key Dependencies (libs.versions.toml)

| Library | Purpose |
|---|---|
| supabase-kt 3.1 | Postgrest client for Supabase |
| ktor-client-okhttp | HTTP engine for supabase-kt |
| hilt 2.53 | Dependency injection |
| compose-bom 2024.12 | Jetpack Compose UI |
| security-crypto | EncryptedSharedPreferences |
| work-runtime | WorkManager (future periodic sync fallback) |

## Sync Protocol

Same as desktop, adapted for Android:
1. **Heartbeat** (30s): Update `pcs` table (`is_online`, `app_running`, `last_heartbeat`)
2. **Orphan detection**: If heartbeat update returns 0 rows for 3 consecutive cycles → auto-unpair
3. **Commands**: Fetch `commands` where `status=pending`, execute, mark `executed`
4. **Settings**: Fetch `pc_settings` → cache locally in AppConfig
5. **Usage**: UsageStatsManager → upsert `daily_usage` table

## Supported Commands

| Command | Effect |
|---|---|
| `lock` | Set `isLocked=true`, show LockScreen |
| `unlock` | Set `isLocked=false`, dismiss LockScreen |
| `add_time` | Increase dailyLimitMinutes |
| `remove_time` | Decrease dailyLimitMinutes, check if exceeded |
| `unpair` | Clear config, stop service, show PairingScreen |

## App Blocking

- **AccessibilityService** listens for `TYPE_WINDOW_STATE_CHANGED`
- Checks package name against `blockedPackages` (blacklist) or `allowedPackages` (whitelist)
- If blocked → `Intent(ACTION_MAIN, CATEGORY_HOME)` sends user to home
- System packages (systemui, launcher, kidspc itself) are always allowed
- Lists updated by KidspcService when settings sync

## Required Permissions

| Permission | Purpose |
|---|---|
| `INTERNET` | Supabase sync |
| `FOREGROUND_SERVICE` | Keep monitoring alive |
| `POST_NOTIFICATIONS` | Persistent notification (Android 13+) |
| `PACKAGE_USAGE_STATS` | Screen time tracking |
| `SYSTEM_ALERT_WINDOW` | Lock screen overlay |
| `RECEIVE_BOOT_COMPLETED` | Auto-start on boot |
| `BIND_ACCESSIBILITY_SERVICE` | App blocking |
| `BIND_DEVICE_ADMIN` | Prevent uninstall |

## Pairing Flow

1. Parent creates device on web dashboard → gets 6-digit sync token
2. Child opens KidsPC app → enters token on PairingScreen
3. App calls `POST /api/dispositivos/claim` with `{token, name, platform: "android"}`
4. API returns `{pc_id, user_id}` → stored in EncryptedSharedPreferences
5. PermissionsScreen guides user through USAGE_ACCESS and OVERLAY permissions
6. KidspcService starts → sync begins

## Platform Field

- `pcs.platform` column: `"windows"` (default) or `"android"`
- Set during claim via the `platform` field in the request body
- Web dashboard shows Windows/Android icon next to device name

## Anti-Patterns

- **Never block system packages** in AppBlockerService (systemui, launcher, settings)
- **Never store secrets in plain SharedPreferences** — always use EncryptedSharedPreferences
- **Always use Hilt** for DI — don't manually construct singletons
- **Never do network calls on main thread** — all sync in coroutines on Dispatchers.IO
- **Lock screen must be an overlay** (SYSTEM_ALERT_WINDOW) — not just an activity, otherwise user can dismiss it
