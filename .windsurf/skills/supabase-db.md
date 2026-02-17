# Supabase Database Skill

Reference guide for the KidsPC Supabase schema, RLS policies, and data patterns. Use when modifying migrations, writing queries, or debugging data issues.

## Project Info

- **Project ref**: `hdabvnxtxzbfemnqwfyd`
- **Migrations**: `supabase/migrations/` (numbered SQL files)
- **Web migration drafts**: `web/supabase/` (not yet applied)

## Table Catalog

### `pcs` — Registered devices

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Default `gen_random_uuid()` |
| `user_id` | text NOT NULL | Clerk user ID |
| `name` | text NOT NULL | Display name set by parent |
| `sync_token` | text | Token for pairing (hex, 32 chars) |
| `sync_token_expires_at` | timestamptz | 30min TTL |
| `paired_at` | timestamptz | Set when desktop claims token |
| `is_online` | boolean | Updated by desktop heartbeat |
| `is_locked` | boolean | Screen lock state |
| `app_running` | boolean | Desktop app running state |
| `shutdown_type` | text | `graceful` or `unexpected` |
| `usage_today_minutes` | integer | Today's active minutes |
| `current_noise_db` | real | Current mic dB level |
| `strikes` | integer | Cumulative strike count |
| `last_heartbeat` | timestamptz | Last sync timestamp |
| `last_activity` | timestamptz | Last mouse/keyboard activity |
| `app_version` | text | Installed desktop app version |
| `effective_limit_minutes` | integer | Current effective daily limit (after extras/penalties) |
| `responsible_mode` | boolean | Responsible mode active (bypasses all checks) |
| `platform` | text NOT NULL | `windows` (default) or `android` |

**Indexes**: `idx_pcs_user_id` on `user_id`, `idx_pcs_sync_token` on `sync_token`
**Realtime**: Enabled (`alter publication supabase_realtime add table pcs`)

### `pairing_codes` — Legacy pairing (6-digit codes)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `code` | text NOT NULL UNIQUE | 6-digit code |
| `created_at` | timestamptz | |
| `expires_at` | timestamptz | 10min TTL |
| `used` | boolean | |
| `pc_id` | uuid FK → pcs | Set when claimed |

**Note**: Current pairing uses token-based flow (`sync_token` on `pcs`), not this table. Kept for backward compatibility.

### `usage_sessions` — Individual usage sessions

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `started_at` | timestamptz | |
| `ended_at` | timestamptz | Null if session still active |
| `duration_minutes` | integer | |

**Index**: `idx_usage_sessions_pc_id` on `pc_id`

### `daily_usage` — Aggregated daily stats

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `date` | date NOT NULL | |
| `total_minutes` | integer | |
| `sessions_count` | integer | |

**Unique**: `uq_daily_usage` on `(pc_id, date)` — desktop uses upsert
**Index**: `idx_daily_usage_pc_date` on `(pc_id, date)`

### `events` — Activity/system events

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `timestamp` | timestamptz | |
| `type` | text NOT NULL | See event types below |
| `description` | text | Human-readable PT-BR description |
| `noise_db` | real | dB level at time of event (0 if N/A) |

**Index**: `idx_events_pc_timestamp` on `(pc_id, timestamp DESC)`

**Event types**: `strike`, `penalidade_tempo`, `bloqueio`, `desbloqueio`, `command`, `app_started`, `app_closed`, `app_killed`, `sessao_inicio`, `sessao_fim`, `calibracao`
**Deduplication index**: `idx_events_dedup` on `(pc_id, timestamp, type)` — desktop uses upsert with ignore_duplicates

### `commands` — Remote commands from web to desktop

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `created_at` | timestamptz | |
| `command` | text NOT NULL | `add_time`, `remove_time`, `lock`, `unlock`, `shutdown`, `reset_strikes`, `unpair` |
| `payload` | jsonb | e.g. `{"minutes": 15}` |
| `status` | text | `pending` → `executed` or `failed` |
| `executed_at` | timestamptz | Set by desktop after execution |

**Index**: `idx_commands_pc_status` on `(pc_id, status)`

### `pc_settings` — Per-device configuration

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs UNIQUE | ON DELETE CASCADE |
| `daily_limit_minutes` | integer | Default 120 |
| `strike_penalty_minutes` | integer | Default 30 |
| `noise_threshold_db` | integer | Default 70 |
| `noise_grito_db` | integer | Default 85 |
| `schedule` | jsonb | `WeekSchedule` — keys "0"-"6" (Mon-Sun) |
| `app_block_mode` | text | `blacklist` or `whitelist` |
| `site_block_mode` | text | `blacklist` or `whitelist` |
| `password_hash` | text | PBKDF2 hash (matches Python impl) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `blocked_apps` — Per-device app blocking rules

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `name` | text NOT NULL | Process name (e.g. `chrome.exe`) |
| `display_name` | text | Friendly name (e.g. `Google Chrome`) |
| `created_at` | timestamptz | |

**Unique**: `uq_blocked_apps` on `(pc_id, name)`

### `blocked_sites` — Per-device site blocking rules

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `domain` | text NOT NULL | e.g. `youtube.com` |
| `display_name` | text | Friendly name |
| `created_at` | timestamptz | |

**Unique**: `uq_blocked_sites` on `(pc_id, domain)`

### `app_usage` — Per-app time tracking per device per day

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `date` | date NOT NULL | |
| `app_name` | text NOT NULL | Process name (e.g. `chrome.exe`) |
| `display_name` | text | Friendly name (e.g. `Google Chrome`) |
| `minutes` | integer | Time spent in foreground |
| `category` | text | Optional category |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Unique**: `uq_app_usage_pc_date_app` on `(pc_id, date, app_name)` — desktop uses upsert
**Index**: `idx_app_usage_pc_date` on `(pc_id, date)`

### `site_visits` — Visited domains per device per day

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL | |
| `pc_id` | uuid FK → pcs | ON DELETE CASCADE |
| `date` | date NOT NULL | |
| `domain` | text NOT NULL | e.g. `youtube.com` |
| `title` | text | Last seen page title |
| `visit_count` | integer | Number of visits |
| `total_seconds` | integer | Time with site in foreground |
| `source` | text | `window_title`, `browser_history`, or `both` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Unique**: `uq_site_visits_pc_date_domain` on `(pc_id, date, domain)` — desktop uses upsert
**Index**: `idx_site_visits_pc_date` on `(pc_id, date)`

### `app_version` — Desktop app version tracking

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | Single row (id=1) |
| `latest_version` | text NOT NULL | e.g. `1.5.0` |
| `download_url` | text | GitHub release URL |
| `release_notes` | text | |
| `updated_at` | timestamptz | |

**Seed**: `INSERT INTO app_version (id, latest_version) VALUES (1, '1.0.0')`

### `subscriptions` — MercadoPago subscriptions

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | text NOT NULL UNIQUE | One sub per user |
| `stripe_customer_id` | text | Legacy (unused) |
| `stripe_subscription_id` | text | Legacy (unused) |
| `mp_payer_id` | text | MercadoPago payer ID |
| `mp_subscription_id` | text | MercadoPago subscription ID |
| `plan` | text | e.g. `monthly` |
| `status` | text | `active`, `trialing`, `cancelled`, `past_due` |
| `current_period_start` | timestamptz | |
| `current_period_end` | timestamptz | |
| `cancel_at_period_end` | boolean | |
| `max_devices` | integer NOT NULL | Default 2. Base plan includes 2; each extra costs R$14,90/mês |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

## RLS Strategy

All tables have RLS enabled with **permissive TRUE policies**:

```sql
CREATE POLICY "allow_all_select" ON pcs FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON pcs FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON pcs FOR UPDATE USING (true);
```

**Rationale**: The desktop app uses the anon key but filters by `pc_id` in application code. The web app uses `service_role` key which bypasses RLS entirely. This simplifies access while both clients handle their own authorization:
- Desktop: hardcoded anon key + filters by `config.pc_id`
- Web: service_role key + filters by `auth().userId`

**Known risk**: Any client with the anon key can read/write all rows. Acceptable because the anon key is embedded in a compiled Windows binary, not exposed in browser JS.

## Migration Conventions

- Files in `supabase/migrations/` with numeric prefix: `001_`, `002_`, `003_`, etc.
- DDL only (CREATE TABLE, ALTER TABLE, CREATE POLICY)
- Each migration is idempotent where possible (`IF NOT EXISTS`)
- Schema changes to existing tables: new migration file, never edit existing ones
- After adding columns: update `web/src/lib/types.ts` interfaces AND Python `remote_sync.py` queries
- Supabase MCP `apply_migration` can also be used for DDL changes (tracked separately from local files)

## Data Lifecycle

```
Desktop App                      Supabase                        Web Dashboard
────────────                     ────────                        ─────────────
Audio → dB                                                       
  │                                                              
  ├─ Strike? ──────────────────► events (type=strike)  ────────► Events tab
  │                                                              
  ├─ Penalty? ─────────────────► events (type=penalidade) ─────► Events tab
  │                                                              
  ├─ Session start/end ────────► usage_sessions ───────────────► History tab
  │                                                              
  ├─ Daily aggregate ──────────► daily_usage (upsert) ─────────► History chart
  │                                                              
  ├─ Foreground window ────────► app_usage (upsert) ──────────► Activity tab (apps)
  │                                                              
  ├─ Browser domains ──────────► site_visits (upsert) ────────► Activity tab (sites)
  │                                                              
  └─ Heartbeat (30s) ─────────► pcs (update) ─────────────────► Device card (online/usage/strikes)
                                                                 
                                 commands (insert) ◄─────────── Quick Actions (lock/unlock/+time)
  ◄─ Execute command ──────────  commands (status→executed)      
                                                                 
                                 pc_settings (update) ◄────────── Settings page
  ◄─ Apply settings ───────────  pc_settings (read)              
                                                                 
                                 blocked_apps/sites (CRUD) ◄───── Controls tab
  ◄─ Apply rules ──────────────  blocked_apps/sites (read)       
```

## Key Query Patterns

### Desktop: Heartbeat upsert
```sql
UPDATE pcs SET
  is_online = true, app_running = true,
  usage_today_minutes = $1, strikes = $2,
  current_noise_db = $3, last_heartbeat = now(),
  app_version = $4
WHERE id = $pc_id;
```

### Desktop: Fetch pending commands
```sql
SELECT * FROM commands
WHERE pc_id = $pc_id AND status = 'pending'
ORDER BY created_at ASC;
```

### Desktop: Mark command executed
```sql
UPDATE commands SET status = 'executed', executed_at = now()
WHERE id = $cmd_id;
```

### Web: List user's PCs
```sql
SELECT * FROM pcs WHERE user_id = $userId ORDER BY paired_at DESC;
```

### Web: Daily usage history
```sql
SELECT * FROM daily_usage
WHERE pc_id = $pcId
ORDER BY date DESC
LIMIT $days;
```

### Web: Paginated events
```sql
SELECT * FROM events
WHERE pc_id = $pcId [AND type = $filter]
ORDER BY timestamp DESC
LIMIT $limit OFFSET $offset;
```

### Web: Send command
```sql
INSERT INTO commands (user_id, pc_id, command, payload, status)
VALUES ($userId, $pcId, $cmd, $payload, 'pending');
```

## Realtime

Only `pcs` table is published for realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE pcs;
```

Used for live dashboard updates (device online/offline status, usage counters). The web dashboard currently uses polling (15s interval) rather than realtime subscriptions.

## Anti-Patterns

- **Don't edit existing migration files** — always create a new numbered migration
- **Don't add RLS policies that break desktop access** — desktop uses anon key with permissive policies
- **Don't forget ON DELETE CASCADE** — all child tables reference `pcs.id` with cascade
- **Don't use raw SQL in web code** — always go through `supabase-js` client
- **Don't forget to update types.ts** — after any schema change, sync the TypeScript interfaces
- **Don't store sensitive data unencrypted** — password hashes use PBKDF2, sync tokens are random hex
