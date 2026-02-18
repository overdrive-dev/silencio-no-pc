-- Per-device JWT: rewrite all RLS policies to scope by pc_id from JWT claims.
-- Device clients now receive a custom JWT at pairing containing pc_id + user_id.
-- RLS checks (auth.jwt() ->> 'pc_id')::uuid against the row's pc_id column.
-- service_role (web dashboard) bypasses RLS entirely — unaffected.

-- Helper function: extract pc_id from JWT claims
CREATE OR REPLACE FUNCTION public.jwt_pc_id() RETURNS uuid
  LANGUAGE sql STABLE
  SET search_path = ''
  AS $$ SELECT (current_setting('request.jwt.claims', true)::json ->> 'pc_id')::uuid; $$;

-- =============================================================================
-- TIER 1: Desktop-writable tables — scope all operations to jwt.pc_id
-- =============================================================================

-- ── pcs ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pcs_select_own" ON pcs;
DROP POLICY IF EXISTS "pcs_update_own" ON pcs;
DROP POLICY IF EXISTS "pcs_insert_pairing" ON pcs;

CREATE POLICY "pcs_select_own" ON pcs
  FOR SELECT USING (id = jwt_pc_id());

CREATE POLICY "pcs_update_own" ON pcs
  FOR UPDATE USING (id = jwt_pc_id());

-- No INSERT policy: PCs are created by web (service_role) only.

-- ── events ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;

CREATE POLICY "events_select" ON events
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

-- ── usage_sessions ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usage_sessions_select" ON usage_sessions;
DROP POLICY IF EXISTS "usage_sessions_insert" ON usage_sessions;
DROP POLICY IF EXISTS "usage_sessions_update" ON usage_sessions;

CREATE POLICY "usage_sessions_select" ON usage_sessions
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "usage_sessions_insert" ON usage_sessions
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

CREATE POLICY "usage_sessions_update" ON usage_sessions
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── daily_usage ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "daily_usage_select" ON daily_usage;
DROP POLICY IF EXISTS "daily_usage_insert" ON daily_usage;
DROP POLICY IF EXISTS "daily_usage_update" ON daily_usage;

CREATE POLICY "daily_usage_select" ON daily_usage
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "daily_usage_insert" ON daily_usage
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

CREATE POLICY "daily_usage_update" ON daily_usage
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── app_usage ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all_select" ON app_usage;
DROP POLICY IF EXISTS "allow_all_insert" ON app_usage;
DROP POLICY IF EXISTS "allow_all_update" ON app_usage;

CREATE POLICY "app_usage_select" ON app_usage
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "app_usage_insert" ON app_usage
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

CREATE POLICY "app_usage_update" ON app_usage
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── site_visits ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all_select" ON site_visits;
DROP POLICY IF EXISTS "allow_all_insert" ON site_visits;
DROP POLICY IF EXISTS "allow_all_update" ON site_visits;

CREATE POLICY "site_visits_select" ON site_visits
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "site_visits_insert" ON site_visits
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

CREATE POLICY "site_visits_update" ON site_visits
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── commands (SELECT + UPDATE only, INSERT already dropped in 006) ───────────
DROP POLICY IF EXISTS "commands_select" ON commands;
DROP POLICY IF EXISTS "commands_update" ON commands;

CREATE POLICY "commands_select" ON commands
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "commands_update" ON commands
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── pairing_codes ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pairing_codes_select" ON pairing_codes;
DROP POLICY IF EXISTS "pairing_codes_insert" ON pairing_codes;
DROP POLICY IF EXISTS "pairing_codes_update" ON pairing_codes;

CREATE POLICY "pairing_codes_select" ON pairing_codes
  FOR SELECT USING (pc_id = jwt_pc_id());

CREATE POLICY "pairing_codes_insert" ON pairing_codes
  FOR INSERT WITH CHECK (pc_id = jwt_pc_id());

CREATE POLICY "pairing_codes_update" ON pairing_codes
  FOR UPDATE USING (pc_id = jwt_pc_id());

-- ── app_version (global read-only lookup — keep USING true) ──────────────────
-- No change: app_version_select already uses USING (true).

-- =============================================================================
-- TIER 2: Read-only for anon — scope SELECT to jwt.pc_id
-- =============================================================================

-- ── pc_settings ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pc_settings_select" ON pc_settings;

CREATE POLICY "pc_settings_select" ON pc_settings
  FOR SELECT USING (pc_id = jwt_pc_id());

-- ── blocked_apps ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "blocked_apps_select" ON blocked_apps;

CREATE POLICY "blocked_apps_select" ON blocked_apps
  FOR SELECT USING (pc_id = jwt_pc_id());

-- ── blocked_sites ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "blocked_sites_select" ON blocked_sites;

CREATE POLICY "blocked_sites_select" ON blocked_sites
  FOR SELECT USING (pc_id = jwt_pc_id());

-- subscriptions: keep USING (true) — no pc_id column, desktop doesn't read it.
