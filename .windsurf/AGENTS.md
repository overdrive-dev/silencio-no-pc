# KidsPC — Project Agent Guide

KidsPC is a parental control SaaS for Windows PCs and Android devices. Parents manage screen time, noise levels, and app/site access remotely via a web dashboard. Client apps (desktop or Android) run on the child's device and enforce rules synced from Supabase.

## Architecture

```
┌─────────────────┐       polling 30s        ┌──────────────┐      service_role      ┌─────────────────┐
│  Desktop App    │ ◄────────────────────────►│   Supabase   │◄─────────────────────► │  Next.js Web    │
│  (Python/PyQt5) │   anon key + pc_id filter │  (Postgres)  │  Clerk auth + admin    │  (Vercel)       │
│  Windows 10/11  │                           │  + Realtime   │                        │  kidspc.vercel  │
└─────────────────┘                           └──────────────┘                        └─────────────────┘
       │                                             │                                        │
       ├─ Audio monitoring (mic)                     ├─ RLS (permissive, filtered in code)     ├─ Clerk auth
       ├─ Activity tracking (Win32 API)              ├─ Realtime (pcs table)                   ├─ MercadoPago subs
       ├─ Screen lock enforcement                    └─ 10+ tables                             └─ Landing + Dashboard
       ├─ App/site blocking
       └─ Auto-update (GitHub Releases)
```

## Directory Structure

```
silencio-no-pc/
├── android/                # Kotlin Android app (child device)
│   ├── app/src/main/
│   │   ├── java/com/kidspc/app/
│   │   │   ├── MainActivity.kt          # Entry point, screen routing
│   │   │   ├── KidspcApp.kt             # Application class (Hilt, notifications)
│   │   │   ├── di/AppModule.kt          # Hilt DI module
│   │   │   ├── data/
│   │   │   │   ├── AppConfig.kt         # EncryptedSharedPreferences
│   │   │   │   ├── SyncRepository.kt    # Supabase sync + pairing
│   │   │   │   └── models/Models.kt     # Kotlin data classes (mirrors Supabase)
│   │   │   ├── service/
│   │   │   │   ├── KidspcService.kt     # Foreground service (sync + usage tracking)
│   │   │   │   └── AppBlockerService.kt # Accessibility service (app blocking)
│   │   │   ├── receiver/
│   │   │   │   ├── BootReceiver.kt      # Auto-start on boot
│   │   │   │   └── KidspcDeviceAdmin.kt # Prevent uninstall
│   │   │   └── ui/
│   │   │       ├── theme/Theme.kt       # Material3 theme (indigo/teal)
│   │   │       ├── viewmodels/PairingViewModel.kt
│   │   │       └── screens/             # PairingScreen, StatusScreen, LockScreen, PermissionsScreen
│   │   ├── res/                         # Android resources
│   │   └── AndroidManifest.xml
│   ├── build.gradle.kts
│   └── gradle/libs.versions.toml       # Version catalog
│
├── src/                    # Python desktop app (17 modules)
│   ├── main.py             # Entry point — KidsPC class orchestrates everything
│   ├── config.py           # Encrypted JSON config (Fernet)
│   ├── audio_monitor.py    # Mic capture → dB calculation (PyAudio + NumPy)
│   ├── strike_manager.py   # Noise → strikes → penalties (3-cycle)
│   ├── time_manager.py     # Daily limits, schedule, block logic
│   ├── activity_tracker.py # Mouse/keyboard idle detection (Win32 GetLastInputInfo)
│   ├── screen_locker.py    # Windows LockWorkStation + re-lock enforcement
│   ├── app_blocker.py      # Process termination (psutil, blacklist/whitelist)
│   ├── site_blocker.py     # Hosts file manipulation (127.0.0.1 redirect)
│   ├── remote_sync.py      # Bidirectional Supabase polling (outbound + inbound)
│   ├── auto_updater.py     # GitHub Releases check → download → bat script replace
│   ├── pairing.py          # Token-based PC↔account linking dialog
│   ├── tray_app.py         # System tray menu (QSystemTrayIcon)
│   ├── logger.py           # Local event log with pending sync queue
│   ├── actions.py          # System actions (shutdown, etc.)
│   ├── password_manager.py # Password verification (PBKDF2 + backup password)
│   └── ui/                 # PyQt5 widgets
│       ├── noise_meter.py          # Floating compact widget (always-on-top)
│       ├── warning_popup.py        # Strike warning popups (light/strong)
│       ├── time_warning_popup.py   # Time warnings (15min, 5min, blocked, penalty)
│       ├── config_dialog.py        # Settings dialog (password-protected)
│       ├── calibration_dialog.py   # Manual noise calibration
│       ├── auto_calibration.py     # Automatic ambient noise calibration
│       ├── welcome_tutorial.py     # First-run tutorial wizard
│       ├── live_threshold_widget.py# Real-time threshold visualization
│       └── image_popup.py          # Image display utility
│
├── web/                    # Next.js 16 web dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing page (public)
│   │   │   ├── layout.tsx                  # Root layout (ClerkProvider)
│   │   │   ├── dispositivos/page.tsx       # Device list (authed)
│   │   │   ├── dispositivo/[id]/
│   │   │   │   ├── page.tsx                # Device dashboard (tabs: history/events/controls)
│   │   │   │   ├── settings/page.tsx       # Device settings
│   │   │   │   ├── events/page.tsx         # Full events view
│   │   │   │   └── history/page.tsx        # Full history view
│   │   │   ├── settings/                   # User settings (billing, security, notifications)
│   │   │   ├── billing/page.tsx            # Billing page
│   │   │   ├── pricing/page.tsx            # Pricing page
│   │   │   ├── download/page.tsx           # App download page
│   │   │   ├── politica-privacidade/       # Privacy policy
│   │   │   └── api/
│   │   │       ├── dispositivos/           # GET list, POST create
│   │   │       ├── dispositivos/claim/     # POST claim token (pairing)
│   │   │       ├── dispositivo/[id]/       # GET, DELETE single device
│   │   │       ├── dispositivo/[id]/settings/    # GET, PUT
│   │   │       ├── dispositivo/[id]/commands/    # POST send command
│   │   │       ├── dispositivo/[id]/events/      # GET paginated
│   │   │       ├── dispositivo/[id]/history/     # GET daily usage
│   │   │       ├── dispositivo/[id]/token/       # POST generate sync token
│   │   │       ├── dispositivo/[id]/blocked-apps/  # GET, POST, DELETE
│   │   │       ├── dispositivo/[id]/blocked-sites/ # GET, POST, DELETE
│   │   │       ├── pairing/               # POST validate pairing code
│   │   │       └── mercadopago/           # checkout, webhook, status, sync, cancel, payments
│   │   ├── components/
│   │   │   ├── nav-bar.tsx
│   │   │   ├── main-wrapper.tsx
│   │   │   ├── payment-banner.tsx
│   │   │   └── landing/faq-section.tsx
│   │   ├── hooks/use-subscription.ts
│   │   ├── lib/
│   │   │   ├── types.ts            # TS interfaces mirroring Supabase tables
│   │   │   ├── supabase-client.ts  # Anon key client (client-side)
│   │   │   ├── supabase-server.ts  # Service role client (server-side API routes)
│   │   │   ├── subscription.ts     # Subscription CRUD helpers
│   │   │   ├── mercadopago.ts      # MP client + plan config
│   │   │   └── hash-password.ts    # PBKDF2 password hashing (matches Python)
│   │   └── proxy.ts                # Clerk middleware (clerkMiddleware())
│   └── package.json
│
├── supabase/
│   └── migrations/
│       ├── 001_create_tables.sql   # Core schema (10 tables)
│       ├── 002_rls_policies.sql    # RLS (permissive TRUE policies)
│       └── 003_app_usage_site_visits.sql  # app_usage + site_visits tables
│
├── installer/setup.iss     # Inno Setup script
├── build.py                # PyInstaller build script
├── publish.py              # GitHub Releases publish script
├── requirements.txt        # Python dependencies
└── .windsurf/
    ├── AGENTS.md           # This file
    ├── workflows/
    │   ├── software-house.md
    │   └── frontend-design.md
    └── skills/
        ├── python-desktop.md
        ├── nextjs-web.md
        ├── supabase-db.md
        ├── build-deploy.md
        └── android-app.md
```

## Tech Stack

### Desktop App
- **Python 3.x** with PyQt5 (UI), PyAudio + NumPy (audio), psutil (process management)
- **cryptography** (Fernet encryption for config), **pycaw + comtypes** (Windows audio)
- **supabase-py** (database sync), **httpx** (HTTP for auto-updater)
- **ctypes** (Win32 API: GetLastInputInfo, LockWorkStation, OpenInputDesktop)

### Android App
- **Kotlin 2.1** + **Jetpack Compose** (Material3 UI)
- **Hilt** (DI), **KSP** (annotation processing)
- **supabase-kt 3.x** + **Ktor OkHttp** (database sync)
- **EncryptedSharedPreferences** (secure local config)
- **Foreground Service** (persistent monitoring), **AccessibilityService** (app blocking)
- **UsageStatsManager** (screen time tracking), **DeviceAdminReceiver** (prevent uninstall)
- Package: `com.kidspc.app`, minSdk 26, targetSdk 35

### Web Dashboard
- **Next.js 16** (App Router), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** (styling), **@heroicons/react** (icons), **@headlessui/react** (UI primitives)
- **Clerk** (auth — middleware in `proxy.ts`, provider in `layout.tsx`)
- **@supabase/supabase-js** (database), **MercadoPago SDK** (payments)
- **recharts** (charts), **lucide-react** (additional icons)

### Database
- **Supabase** (project ref: `hdabvnxtxzbfemnqwfyd`)
- Postgres with RLS, Realtime on `pcs` table

### Deployment
- **Desktop**: PyInstaller → Inno Setup → GitHub Releases
- **Web**: Vercel (auto-deploy), domain: `kidspc.vercel.app`

## Environment Variables (Web)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (API routes) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `MELI_ACCESS_TOKEN` | MercadoPago access token |
| `NEXT_PUBLIC_MELI_PUBLIC_KEY` | MercadoPago public key (client-side) |
| `MELI_WEBHOOK_SECRET` | MercadoPago webhook signature secret |
| `NEXT_PUBLIC_APP_URL` | App base URL for MercadoPago callbacks |
| `GITHUB_TOKEN` | GitHub token (for publish.py, not web) |

## Key Conventions

### Naming
- **Python**: `snake_case` for files, functions, variables. Classes are `PascalCase`.
- **TypeScript**: `camelCase` for variables/functions, `PascalCase` for components/interfaces.
- **Database**: `snake_case` for tables and columns.
- **Files**: Python modules are single-responsibility. Web routes follow Next.js App Router conventions.

### Language
- All UI text is in **Portuguese (BR)** — labels, messages, comments in Python code.
- TypeScript code has English variable names but Portuguese user-facing strings.
- Documentation (this file, skills, workflows) is in **English**.

### API Route Pattern (Web)
Every API route follows this structure:
1. `auth()` from Clerk → reject if no `userId`
2. `getSupabaseAdmin()` → service_role client (bypasses RLS)
3. Query/mutate → return `NextResponse.json()`

### Desktop Sync Protocol
- `RemoteSync._sync_outbound()`: Updates `pcs` heartbeat, sends `usage_sessions`, `daily_usage`, `events`
- `RemoteSync._sync_inbound()`: Reads `commands` (pending), `pc_settings`, `blocked_apps`, `blocked_sites`
- Polling interval: 30s (configurable via `sync_interval_seconds`)

### Cross-Thread Safety (Desktop)
- AudioMonitor runs in its own thread → emits Qt signal (`audio_update`) → main thread handles UI
- Never touch Qt widgets from non-main threads. Always use `pyqtSignal`.

## Anti-Patterns

- **Never hardcode Supabase keys in web code** — use env vars. (Desktop `remote_sync.py` has hardcoded anon key — acceptable for desktop binary.)
- **Never kill Windows system processes** — `app_blocker.py` has a `SYSTEM_PROCESSES` safelist.
- **Always cleanup hosts file** — `site_blocker.cleanup()` must run on graceful shutdown.
- **Don't use `authMiddleware()`** — deprecated. Use `clerkMiddleware()` from `@clerk/nextjs/server`.
- **Don't import in middle of file** — lazy imports in Python are OK for UI dialogs only (avoid circular imports).
- **Password hashing must match** — Python (`config.py._hash_senha`) and Node (`hash-password.ts`) use same PBKDF2 params.

## Related Skills

- **Python desktop**: `.windsurf/skills/python-desktop.md`
- **Android app**: `.windsurf/skills/android-app.md`
- **Next.js web**: `.windsurf/skills/nextjs-web.md`
- **Supabase database**: `.windsurf/skills/supabase-db.md`
- **Build & deploy**: `.windsurf/skills/build-deploy.md`
- **Frontend design**: `.windsurf/workflows/frontend-design.md`
