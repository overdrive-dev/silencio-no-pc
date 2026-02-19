---
name: backend-architecture
description: KidsPC backend architecture guidelines — Python desktop app, Next.js API routes, Supabase DB, Clerk auth, MercadoPago payments. Use when building or modifying backend code.
---

# Backend Architecture Skill — KidsPC

Follow these rules when building or modifying any backend code in this project. KidsPC has three backend surfaces: Python desktop app (`src/`), Next.js API routes (`web/src/app/api/`), and Android app (`android/`).

## Before You Write Any Code

1. **Identify the surface** — Is this Python desktop, Next.js API, or Android? Pick the right directory and patterns.
2. **Check the supporting files** below for the specific rules that apply.
3. **Never guess** — If you're unsure which pattern to follow, read existing code in the same directory first.

## Mandatory Rules (apply to ALL backend code)

- **Config**: ALWAYS use the `Config` class for desktop settings. NEVER read/write raw config files.
- **Supabase RLS**: ALWAYS use per-device JWT (`jwt_pc_id()`) for device data access. NEVER use shared anon key.
- **Clerk auth**: In web API routes, use `auth()` from `@clerk/nextjs/server`. NEVER use deprecated patterns.
- **Dependencies**: NEVER add new pip/npm/gradle packages without asking the user first.
- **Logic**: NEVER change business logic unless the user explicitly requested it.

## Supporting Resources

Read the relevant file BEFORE implementing:

- `python-desktop.md` — Desktop app modules, threading model, config, sync protocol, strike system
- `nextjs-api.md` — API route conventions, Clerk auth, Supabase access, MercadoPago integration
- `supabase-db.md` — Table catalog, RLS strategy, migration conventions, data lifecycle
- `android-app.md` — Kotlin modules, Hilt DI, supabase-kt, foreground service patterns
- `anti-patterns.md` — Things that WILL break the app if you do them
