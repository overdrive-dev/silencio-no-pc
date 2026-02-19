# Python Desktop App Architecture

## Module Map

| Module | Responsibility |
|---|---|
| `main.py` | QApplication lifecycle, signal wiring, timers (3s app blocker, 30s sync) |
| `config.py` | Encrypted JSON config via Fernet. ALWAYS use `Config` class, never raw file access |
| `audio_monitor.py` | PyAudio stream, numpy RMS → dB, threshold comparison |
| `remote_sync.py` | Supabase heartbeat, command polling, settings sync, daily usage push |
| `pairing.py` | 6-digit token claim flow, stores `device_jwt` from `/api/dispositivos/claim` |
| `time_manager.py` | Daily limit tracking, schedule enforcement, idle detection |
| `strike_manager.py` | Strike counter, penalty application, cooldown |
| `screen_locker.py` | Fullscreen Qt overlay when time is up or outside schedule |
| `app_blocker.py` | psutil process monitoring, kills blocked apps every 3s |
| `site_blocker.py` | Windows hosts file management for blocked sites |
| `activity_tracker.py` | Active window tracking, usage time per app |
| `window_tracker.py` | Foreground window detection, title extraction |
| `browser_history.py` | Chrome/Edge history DB reading for site visits |
| `tray_app.py` | System tray icon, menu, quick actions |
| `auto_updater.py` | GitHub Releases polling, download + install new version |
| `password_manager.py` | Parent password hashing (PBKDF2) and verification |
| `logger.py` | Rotating file logger in AppData |

## Threading Model

- **Main thread**: Qt event loop (UI + timers)
- **Audio monitor**: Runs in QThread, emits signals to main thread
- **Remote sync**: QTimer on main thread (30s interval), HTTP calls are blocking but fast
- **App blocker**: QTimer on main thread (3s interval)
- **NEVER** do Supabase calls from QThread — always use QTimer or signal back to main thread

## Config Access

```python
# ALWAYS:
config = Config()
value = config.get("daily_limit_minutes", 120)
config.set("strikes_enabled", True)
config.set_batch({"key1": val1, "key2": val2})  # single disk write

# NEVER:
with open("config.json") as f: ...  # bypasses encryption
```

## Sync Protocol (remote_sync.py)

1. **Heartbeat**: POST to `pcs` table with `last_seen = now()`, `is_online = true`
2. **Command poll**: SELECT from `remote_commands` WHERE `pc_id` AND `executed = false`
3. **Settings sync**: SELECT from `pc_settings`, apply to local Config
4. **Daily usage push**: UPSERT to `daily_usage` with minutes used today
5. **Auth**: `client.postgrest.auth(device_jwt)` — per-device JWT for RLS

## Pairing Flow

1. Desktop generates 6-digit token, inserts into `pairing_tokens` table
2. Parent enters token on web dashboard → calls `/api/dispositivos/claim`
3. Claim API validates token, creates `pcs` row, signs device JWT, returns it
4. Desktop stores `device_jwt` in encrypted config, starts sync loop

## Strike System

- Audio monitor detects volume above `volume_grito_db` threshold → strike
- Each strike deducts `strike_penalty_minutes` from remaining time
- 3 strikes in a session = screen lock
- Strikes reset daily
