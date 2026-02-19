# Backend Review Checklist

## Python Desktop
- [ ] Config access uses `Config` class — never raw file I/O
- [ ] No Supabase calls from QThread — use QTimer or signal to main thread
- [ ] Audio monitor runs in QThread with signal-based communication
- [ ] Sync loop validates pairing (orphan check) on every heartbeat
- [ ] Device JWT used for `client.postgrest.auth()` — never shared anon key
- [ ] Error handling with graceful degradation (offline mode)

## Next.js API Routes
- [ ] Auth uses `await auth()` from `@clerk/nextjs/server` — never deprecated patterns
- [ ] `userId` checked before any data access
- [ ] Supabase uses `SUPABASE_SERVICE_ROLE_KEY` in API routes (server-side only)
- [ ] Service role key NEVER exposed to client
- [ ] Error responses use structured format: `{ error: "CODE", message: "..." }`
- [ ] Device operations verify ownership: `user_id = userId` before mutations
- [ ] Subscription checks before device creation (NO_SUBSCRIPTION, DEVICE_LIMIT_REACHED)

## Supabase / Database
- [ ] New tables have RLS policies
- [ ] RLS uses `jwt_pc_id()` for device-scoped tables
- [ ] Migrations in `supabase/migrations/` with sequential naming
- [ ] CASCADE configured on device deletion for all child tables
- [ ] Timestamps (`created_at`, `updated_at`) on new tables

## MercadoPago
- [ ] Webhook filters `subscription_preapproval_plan` (ACK only, no processing)
- [ ] Webhook validates notification type before calling `PreApproval.get()`
- [ ] Subscription amounts calculated correctly: base R$19,90 + extras R$14,90 each
- [ ] `MP_ACCESS_TOKEN` from env, never hardcoded

## Debug Artifacts
- [ ] No `print()` statements in Python (use logger)
- [ ] No `console.log()` with debug content in TypeScript
- [ ] No hardcoded test values (pairing codes, user IDs)

## Conventions
- [ ] Python modules in `src/` with correct responsibility separation
- [ ] API routes in `web/src/app/api/` following Next.js App Router convention
- [ ] No new pip/npm dependencies without explicit request
- [ ] No logic changes unless explicitly requested
- [ ] Imports at top of file
