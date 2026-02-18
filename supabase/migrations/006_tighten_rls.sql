-- Tighten RLS: remove overly permissive INSERT/UPDATE policies on tables
-- that only the web dashboard (service_role) should write to.
-- service_role bypasses RLS entirely, so dropping these policies has zero
-- impact on the web app. The desktop Python client (anon key) never writes
-- to these tables.

-- subscriptions: only web/webhook writes (via service_role)
DROP POLICY IF EXISTS "subscriptions_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON subscriptions;

-- pc_settings: only web writes (via service_role), desktop only reads
DROP POLICY IF EXISTS "pc_settings_insert" ON pc_settings;
DROP POLICY IF EXISTS "pc_settings_update" ON pc_settings;

-- commands: only web inserts (via service_role), desktop reads + updates status
DROP POLICY IF EXISTS "commands_insert" ON commands;
-- Keep commands_update — desktop needs to mark commands as executed/failed
