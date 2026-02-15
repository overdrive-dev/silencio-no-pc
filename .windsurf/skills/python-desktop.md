# Python Desktop App Skill

Reference guide for the KidsPC Windows desktop application (`src/`). Use when modifying, debugging, or extending any Python module.

## Module Map

| Module | Class | Purpose |
|---|---|---|
| `main.py` | `KidsPC` | Orchestrator — creates all modules, wires signals, runs Qt event loop |
| `config.py` | `Config` | Encrypted JSON config (`%APPDATA%/KidsPC/config.json`) via Fernet |
| `audio_monitor.py` | `AudioMonitor` | Captures mic audio (PyAudio), calculates dB (NumPy RMS→dB formula) |
| `strike_manager.py` | `StrikeManager` | Processes noise levels → strikes with 3-cycle: aviso → forte → penalidade |
| `time_manager.py` | `TimeManager` | Evaluates daily limits + schedule → returns `TimeAction` enum. Supports `_responsible_mode` (bypasses all checks until day reset) |
| `activity_tracker.py` | `ActivityTracker` | Tracks mouse/keyboard via Win32 `GetLastInputInfo`, measures active time |
| `screen_locker.py` | `ScreenLocker` | Calls `LockWorkStation()`, re-locks via enforcement loop if user unlocks |
| `app_blocker.py` | `AppBlocker` | Iterates `psutil.process_iter()`, terminates blocked processes |
| `site_blocker.py` | `SiteBlocker` | Writes `127.0.0.1` entries to Windows hosts file between markers |
| `remote_sync.py` | `RemoteSync` | Bidirectional Supabase polling: heartbeat out, commands/settings in |
| `auto_updater.py` | `AutoUpdater` | Checks GitHub Releases API, downloads exe, applies via temp .bat script |
| `pairing.py` | `PairingDialog` | QDialog for token-based PC↔account linking (calls `/api/dispositivos/claim`) |
| `tray_app.py` | `TrayApp` | QSystemTrayIcon with context menu (status, time, config, strikes, update) |
| `window_tracker.py` | `WindowTracker` | Tracks foreground window via Win32 API, aggregates time per app, extracts browser domains from titles |
| `browser_history.py` | `BrowserHistory` | Reads Chrome/Edge/Firefox SQLite history DBs (copies to temp to avoid locks) |
| `logger.py` | `EventLogger` | Local event log with `_pending_eventos` queue for sync |
| `actions.py` | `Actions` | System actions (e.g., `shutdown_pc()`) |
| `password_manager.py` | `solicitar_senha()` | QDialog for password input, verifies via `Config.verificar_senha()` |

## Entry Point Flow

```
main.py → KidsPC.__init__()
  1. QApplication setup
  2. Config load (encrypted JSON)
  3. Create all modules (AudioMonitor, StrikeManager, TimeManager, etc.)
  4. Setup Qt signals for cross-thread communication
  5. Setup shutdown hooks (atexit, SIGTERM, SIGINT)

KidsPC.run()
  1. First-use tutorial (if config.primeiro_uso)
  2. Pairing check (if not paired → PairingDialog, exit if cancelled)
  3. Init UI (NoiseMeterWidget + TrayApp)
  4. Start services:
     - audio_monitor.start()        → new thread
     - activity_tracker.start()     → new thread
     - remote_sync.start()          → new thread (if paired)
     - app_blocker_timer (3s)       → Qt timer on main thread
     - time_check_timer (30s)       → Qt timer on main thread
  5. app.exec_() → Qt event loop
```

## Threading Model

```
Main Thread (Qt Event Loop)
├── QTimer: time_check_timer (30s)   → _check_time()
├── QTimer: app_blocker_timer (3s)   → app_blocker.check()
├── Qt Signal: audio_update          → _on_audio_update_safe() → UI updates
└── Qt Signal: command_executed       → _on_command_executed() → UI refresh

Thread: AudioMonitor._monitor_loop()
├── PyAudio stream read (100ms chunks)
├── dB calculation (NumPy RMS)
└── Emits via callback → AudioSignals.audio_update (pyqtSignal)

Thread: ActivityTracker._monitor_loop()
├── GetLastInputInfo() poll (5s sleep)
├── Session start/end tracking
└── Day reset logic

Thread: WindowTracker._track_loop()
├── GetForegroundWindow() + GetWindowText() poll (5s)
├── psutil.Process(pid) for process name
├── Browser domain extraction from window title
└── Aggregates time per app and per domain

Thread: RemoteSync._sync_loop()
├── _sync_outbound(): heartbeat, sessions, daily_usage, events, app_usage, site_visits
├── _sync_inbound(): commands, settings, blocking rules
└── Sleep interval (default 30s, interruptible)

Thread: ScreenLocker._enforce_loop()
├── OpenInputDesktop() check (10s sleep)
└── Re-lock if user unlocked while enforcement active
```

**Critical rule**: Never touch Qt widgets from non-main threads. Use `pyqtSignal` to marshal calls to main thread. See `AudioSignals` class in `main.py`.

## Config System

Config is stored at `%APPDATA%/KidsPC/config.json`, encrypted with Fernet (key at `.key` file).

### Default Values

| Key | Default | Synced from web? |
|---|---|---|
| `primeiro_uso` | `True` | No |
| `password_hash` | `""` | Yes |
| `volume_atencao_db` | `70` | No (local calibration) |
| `volume_grito_db` | `85` | No (local calibration) |
| `daily_limit_minutes` | `120` | Yes |
| `strike_penalty_minutes` | `30` | Yes |
| `schedule` | Mon-Fri 08-22, Sat-Sun 09-23 | Yes |
| `idle_timeout_seconds` | `300` | No |
| `strikes_enabled` | `False` | No |
| `calibration_done` | `False` | No |
| `paired` | `False` | No (set during pairing) |
| `pc_id` | `""` | No (set during pairing) |
| `user_id` | `""` | No (set during pairing) |
| `sync_interval_seconds` | `30` | No |

### Sync Fields (pulled from `pc_settings` table)
`daily_limit_minutes`, `strike_penalty_minutes`, `schedule`, `password_hash`

## Strike System

```
Noise > volume_grito_db (default 85 dB)
  → strike +1 (with 10s cooldown between strikes)
  → cycle position = strikes % 3

Position 1 → StrikeAction.POPUP_AVISO    → mostrar_aviso_leve()
Position 2 → StrikeAction.POPUP_FORTE    → mostrar_aviso_forte()
Position 0 → StrikeAction.PENALIDADE_TEMPO → apply_time_penalty(strike_penalty_minutes)
```

Strikes accumulate infinitely. Every 3rd strike triggers a time penalty. `get_penalties_count() = strikes // 3`.

## Time Management

`TimeManager.check()` returns a `TimeAction` enum:
- `NONE` — all good
- `WARNING_15MIN` — 15 min remaining (fired once)
- `WARNING_5MIN` — 5 min remaining (fired once)
- `BLOCK` — time is up → lock screen
- `OUTSIDE_HOURS` — outside scheduled hours → lock screen

**Effective usage** = real active minutes + penalty minutes.
**Effective limit** = base limit + extra minutes - removed minutes.

Schedule uses weekday keys `"0"`=Monday through `"6"`=Sunday with `{start, end}` time strings.

## Remote Sync Protocol

### Outbound (desktop → Supabase)
1. **Heartbeat**: Update `pcs` table — `is_online`, `app_running`, `usage_today_minutes`, `strikes`, `last_heartbeat`, `app_version`
2. **Sessions**: Insert pending `usage_sessions` (from ActivityTracker)
3. **Daily usage**: Upsert `daily_usage` for today
4. **Events**: Insert pending events (max 50 per cycle), mark as synced

### Inbound (Supabase → desktop)
1. **Commands**: Read `commands` where `status='pending'`, execute, mark as `executed`/`failed`
2. **Settings**: Read `pc_settings`, apply sync fields to local config
3. **Blocking rules**: Read `blocked_apps` + `blocked_sites`, update AppBlocker/SiteBlocker

### Supported Commands
| Command | Payload | Effect |
|---|---|---|
| `add_time` | `{minutes: N}` | `time_manager.add_time(N)`, may unlock screen |
| `remove_time` | `{minutes: N}` | `time_manager.remove_time(N)` |
| `lock` | — | `force_lock()` + `screen_locker.start_enforcement()` |
| `unlock` | — | `force_unlock()` + `screen_locker.stop_enforcement()` |
| `shutdown` | `{delay_seconds: N}` | `actions.shutdown_pc(N)` |
| `reset_strikes` | — | `strike_manager.reset_strikes()` |
| `unpair` | — | Clears local pairing config, stops sync, shows PairingDialog |

### Pairing Validation
- Every sync cycle, the heartbeat checks if the PC record still exists in the DB
- If the update returns 0 rows for **3 consecutive cycles**, the app auto-unpairs
- `RemoteSync._trigger_unpair()` clears config and calls `on_unpair` callback
- `main.py` handles this via Qt signal (`unpair_triggered`) → stops all services → shows PairingDialog → restarts if re-paired

## App/Site Blocking

### AppBlocker
- Modes: `blacklist` (block listed) or `whitelist` (allow only listed)
- Checks every 3s via QTimer
- **NEVER** kills processes in `SYSTEM_PROCESSES` set (30+ critical Windows processes + python.exe)
- Uses `proc.terminate()` (not `kill()`)

### SiteBlocker
- Modifies `C:\Windows\System32\drivers\etc\hosts`
- Adds `127.0.0.1 domain` + `127.0.0.1 www.domain` between markers:
  ```
  # === KidsPC Blocked Sites START ===
  127.0.0.1 youtube.com
  127.0.0.1 www.youtube.com
  # === KidsPC Blocked Sites END ===
  ```
- **Must call `cleanup()`** on shutdown to restore hosts file
- Requires admin privileges (app runs with manifest requesting admin)

## UI Conventions

- **Theme**: Dark (#1e1e22 background, white text) for dialogs. Compact floating widget for noise meter.
- **Font**: Segoe UI (system), Consolas for monospace inputs
- **All UI text**: Portuguese (BR)
- **Password protection**: Config, reset strikes, add time, exit, tutorial — all require password
- **Backup password**: `Senha@123` (hardcoded in `Config.SENHA_BACKUP`)
- **Widget positioning**: Saved in config (`posicao_widget_x/y`), always-on-top

## Anti-Patterns

- **Don't access Qt widgets from threads** — always use `pyqtSignal`
- **Don't kill system processes** — always check `SYSTEM_PROCESSES` set
- **Don't forget hosts cleanup** — register `atexit` and signal handlers
- **Don't use `time.sleep()` in main thread** — use `QTimer` instead
- **Don't create circular imports** — use lazy imports for UI dialogs (import inside methods)
- **Don't hardcode version** — `__version__` in `main.py` is the single source of truth
- **Don't skip pairing check** — app must exit if user cancels pairing dialog
