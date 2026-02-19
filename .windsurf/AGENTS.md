# KidsPC (Silêncio no PC) — Project Map

## What is KidsPC?

A parental control system with three client apps (Windows desktop, Android, web dashboard) and a shared Supabase backend. Parents manage screen time, monitor audio levels, block apps/sites, and track usage — all from a web dashboard.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Windows Desktop │     │   Android App   │     │  Web Dashboard   │
│  Python + PyQt5  │     │  Kotlin+Compose │     │  Next.js + React │
│  src/            │     │  android/       │     │  web/src/        │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                        │
         │  per-device JWT       │  per-device JWT        │  Clerk auth
         │                       │                        │  + service role
         ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL + RLS)                  │
│  Tables: pcs, pc_settings, daily_usage, remote_commands,        │
│  strikes, app_usage, site_visits, blocked_apps, blocked_sites,  │
│  pairing_tokens, subscriptions, app_version                     │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │  Webhook
┌────────┴────────┐
│   MercadoPago    │
│  Subscriptions   │
└─────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop app | Python 3, PyQt5, pyaudio, numpy, pycaw, cryptography, supabase-py |
| Android app | Kotlin 2.1, Jetpack Compose, Hilt DI, supabase-kt |
| Web dashboard | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Auth (web) | Clerk (@clerk/nextjs) |
| Auth (devices) | Per-device JWT (HS256, 1-year expiry) |
| Database | Supabase (PostgreSQL + RLS) |
| Payments | MercadoPago (plan-based preapproval subscriptions) |
| Icons | Lucide React + @heroicons/react |
| UI Components | HeadlessUI React, Framer Motion, Recharts |
| Build (desktop) | PyInstaller + Inno Setup |
| Build (web) | Vercel |
| Auto-updater | GitHub Releases |

## Directory Structure

```
silencio-no-pc/
├── src/                          # Python desktop app
│   ├── main.py                   # Entry point, Qt app lifecycle
│   ├── config.py                 # Encrypted config (Fernet)
│   ├── remote_sync.py            # Supabase sync loop
│   ├── pairing.py                # Device pairing flow
│   ├── audio_monitor.py          # Volume detection
│   ├── time_manager.py           # Screen time limits
│   ├── strike_manager.py         # Strike system
│   ├── screen_locker.py          # Lock screen overlay
│   ├── app_blocker.py            # App blocking (psutil)
│   ├── site_blocker.py           # Site blocking (hosts file)
│   ├── activity_tracker.py       # Active window tracking
│   ├── window_tracker.py         # Foreground window detection
│   ├── browser_history.py        # Chrome/Edge history
│   ├── tray_app.py               # System tray icon
│   ├── auto_updater.py           # GitHub Releases updater
│   ├── password_manager.py       # Parent password (PBKDF2)
│   ├── logger.py                 # Rotating file logger
│   └── ui/                       # PyQt5 dialogs and widgets
├── web/                          # Next.js web dashboard
│   └── src/
│       ├── app/                  # App Router pages
│       │   ├── api/              # API routes
│       │   │   ├── dispositivos/ # Device CRUD
│       │   │   ├── dispositivo/  # Per-device operations
│       │   │   ├── mercadopago/  # Payments + webhook
│       │   │   └── pairing/      # Token generation
│       │   ├── dispositivos/     # Device list page
│       │   ├── dispositivo/      # Device detail page
│       │   ├── settings/         # Settings pages
│       │   ├── pricing/          # Pricing page
│       │   ├── download/         # Download page
│       │   └── page.tsx          # Landing page
│       ├── components/
│       │   ├── nav-bar.tsx       # Sticky nav with Clerk auth
│       │   ├── main-wrapper.tsx  # Content wrapper
│       │   ├── payment-banner.tsx# Subscription warnings
│       │   ├── device/           # Device-specific components
│       │   └── landing/          # Landing page components
│       ├── hooks/
│       │   └── use-subscription.ts # Subscription state hook
│       ├── lib/                  # Utilities
│       └── proxy.ts              # Clerk middleware
├── android/                      # Android app (Kotlin)
│   └── app/src/
├── supabase/
│   └── migrations/               # SQL migrations
├── assets/                       # Icons, images, sounds
├── installer/
│   └── setup.iss                 # Inno Setup script
├── .windsurf/                    # Project documentation
│   ├── skills/                   # Domain knowledge
│   └── workflows/                # Dev processes
├── build.py                      # PyInstaller build script
├── publish.py                    # Release publisher
└── requirements.txt              # Python dependencies
```

## Key Data Flows

### Pairing
Desktop generates 6-digit token → Parent enters on web → Claim API creates device + signs JWT → Desktop stores JWT → Sync starts

### Sync Loop (every 30s)
Device heartbeat → Poll commands → Sync settings → Push daily usage

### Subscription
User signs up (Clerk) → Checkout (MercadoPago) → Webhook updates `subscriptions` table → Device limit enforced

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Web | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Web (server only) | Bypasses RLS for API routes |
| `NEXT_PRIVATE_SUPABASE_JWT_SECRET` | Web (server only) | Signs device JWTs |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Web | Clerk frontend |
| `CLERK_SECRET_KEY` | Web (server only) | Clerk backend |
| `MP_ACCESS_TOKEN` | Web (server only) | MercadoPago API |
| `MP_PLAN_ID` | Web (server only) | Cached plan ID (optional) |

## Conventions

- **UI language**: Português (BR)
- **Product name**: "KidsPC" (not "Silêncio no PC")
- **Config**: Always use `Config` class (desktop), never raw file access
- **Auth**: Clerk for web, per-device JWT for devices
- **RLS**: `jwt_pc_id()` for device tables, service role for API routes
- **Design**: "Flat Illustration" — warm cream, soft blue accent, pill buttons, no dark mode
- **Fonts**: DM Serif Display (headings) + Plus Jakarta Sans (body)
- **Icons**: Lucide React + @heroicons/react (no FontAwesome)
