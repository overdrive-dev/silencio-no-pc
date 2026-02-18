-- blocked_apps: per-device app blocking rules (managed from web, read by desktop)
CREATE TABLE IF NOT EXISTS blocked_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_blocked_apps ON blocked_apps(pc_id, name);

-- blocked_sites: per-device site blocking rules (managed from web, read by desktop)
CREATE TABLE IF NOT EXISTS blocked_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_blocked_sites ON blocked_sites(pc_id, domain);

-- RLS
ALTER TABLE blocked_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_sites ENABLE ROW LEVEL SECURITY;

-- Desktop (anon key) needs to READ blocking rules; web (service_role) bypasses RLS.
-- The existing JWT-based "FOR ALL" policy blocks anon reads — fix by adding explicit SELECT.
-- DROP the overly restrictive FOR ALL policy first (if it exists), then add proper policies.

DO $$
BEGIN
    -- blocked_apps: drop old policy, add read-all + write-restricted
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_apps' AND policyname = 'Users can manage their own blocked apps') THEN
        DROP POLICY "Users can manage their own blocked apps" ON blocked_apps;
    END IF;

    -- blocked_sites: drop old policy, add read-all + write-restricted
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_sites' AND policyname = 'Users can manage their own blocked sites') THEN
        DROP POLICY "Users can manage their own blocked sites" ON blocked_sites;
    END IF;
END $$;

-- blocked_apps policies: anon can SELECT (desktop reads rules), writes only via service_role
CREATE POLICY "blocked_apps_select" ON blocked_apps FOR SELECT USING (true);

-- blocked_sites policies: anon can SELECT (desktop reads rules), writes only via service_role
CREATE POLICY "blocked_sites_select" ON blocked_sites FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies → anon cannot write.
-- Web uses service_role which bypasses RLS entirely.
