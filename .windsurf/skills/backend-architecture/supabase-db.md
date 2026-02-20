# Supabase Database Architecture

## Table Catalog

| Table | Purpose | RLS |
|---|---|---|
| `pcs` | Registered devices (pc_id, user_id, name, platform, last_seen, is_online) | per-device JWT |
| `pc_settings` | Per-device settings (limits, schedule, volume thresholds, block modes) | per-device JWT |
| `daily_usage` | Daily minutes used per device | per-device JWT |
| `remote_commands` | Commands from web → device (lock, unlock, unpair, update_settings) | per-device JWT |
| `pairing_codes` | Inverted pairing codes (desktop generates, parent confirms via QR scan). Columns: code, platform, user_id (nullable until confirmed), pc_id, device_jwt, used, expires_at (10 min) | public insert (rate-limited), Clerk-scoped confirm |
| `strikes` | Strike events (timestamp, volume_db, penalty_minutes) | per-device JWT |
| `app_usage` | Per-app usage time tracking | per-device JWT |
| `site_visits` | Browser history entries synced from device | per-device JWT |
| `blocked_apps` | App blocklist per device | per-device JWT |
| `blocked_sites` | Site blocklist per device | per-device JWT |
| `subscriptions` | MercadoPago subscription state (user_id, status, max_devices, preapproval_id) | Clerk userId |
| `app_version` | Latest desktop app version for auto-updater | public read |

## RLS Strategy

Two auth patterns coexist:

1. **Per-device JWT** — Device data tables. SQL function `jwt_pc_id()` extracts `pc_id` from JWT claims.
   ```sql
   CREATE POLICY "device_select" ON pcs FOR SELECT USING (pc_id = jwt_pc_id());
   ```

2. **Service role** — Web API routes use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS), scope manually by Clerk `userId`.

**NEVER** use shared anon key for device data — always per-device JWT.

## Migration Conventions

- Migrations live in `supabase/migrations/`
- Naming: `NNN_description.sql` (sequential number)
- Use the Supabase MCP `apply_migration` tool for DDL operations
- Use `execute_sql` for data queries/checks
- ALWAYS include RLS policies when creating new tables
- ALWAYS add `created_at` / `updated_at` timestamps

## Data Lifecycle

- **Device online**: heartbeat every 30s updates `pcs.last_seen`
- **Orphan detection**: 3 consecutive failed orphan checks → auto-unpair
- **Device deletion**: Soft delete — sets `pcs.deleted_at` timestamp. All API queries filter `.is("deleted_at", null)`. An `unpair` command is sent so desktop/android app auto-unpairs. Related data (settings, usage, events, blocked lists) is preserved for history.
- **Subscription cancellation**: devices keep working during grace period, then block
- **Pairing codes**: auto-expire after 10 minutes. Desktop generates code → shows QR + text → parent scans → confirms on web → device auto-detects via polling
