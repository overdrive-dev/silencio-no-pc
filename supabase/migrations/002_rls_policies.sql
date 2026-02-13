-- Silêncio no PC — Row Level Security Policies
-- Python client uses anon key (filtered by pc_id)
-- Web panel uses service_role key (bypasses RLS)

-- Enable RLS on all tables
ALTER TABLE pcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pc_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_version ENABLE ROW LEVEL SECURITY;

-- ============================================
-- pcs: Python client can read/update its own PC
-- ============================================
CREATE POLICY "pcs_select_own" ON pcs
    FOR SELECT USING (TRUE);  -- anon can read (filtered by pc_id in app code)

CREATE POLICY "pcs_insert_pairing" ON pcs
    FOR INSERT WITH CHECK (TRUE);  -- anon can insert during pairing

CREATE POLICY "pcs_update_own" ON pcs
    FOR UPDATE USING (TRUE);  -- anon can update (heartbeat, status)

-- ============================================
-- pairing_codes: anon can read to validate, authenticated can create
-- ============================================
CREATE POLICY "pairing_codes_select" ON pairing_codes
    FOR SELECT USING (TRUE);  -- anon can select to validate code

CREATE POLICY "pairing_codes_insert" ON pairing_codes
    FOR INSERT WITH CHECK (TRUE);  -- service_role inserts from web

CREATE POLICY "pairing_codes_update" ON pairing_codes
    FOR UPDATE USING (TRUE);  -- anon marks as used during pairing

-- ============================================
-- usage_sessions: Python client inserts, web reads via service_role
-- ============================================
CREATE POLICY "usage_sessions_select" ON usage_sessions
    FOR SELECT USING (TRUE);

CREATE POLICY "usage_sessions_insert" ON usage_sessions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "usage_sessions_update" ON usage_sessions
    FOR UPDATE USING (TRUE);

-- ============================================
-- daily_usage: Python client upserts
-- ============================================
CREATE POLICY "daily_usage_select" ON daily_usage
    FOR SELECT USING (TRUE);

CREATE POLICY "daily_usage_insert" ON daily_usage
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "daily_usage_update" ON daily_usage
    FOR UPDATE USING (TRUE);

-- ============================================
-- events: Python client inserts
-- ============================================
CREATE POLICY "events_select" ON events
    FOR SELECT USING (TRUE);

CREATE POLICY "events_insert" ON events
    FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- commands: Python client reads pending, web inserts via service_role
-- ============================================
CREATE POLICY "commands_select" ON commands
    FOR SELECT USING (TRUE);

CREATE POLICY "commands_insert" ON commands
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "commands_update" ON commands
    FOR UPDATE USING (TRUE);

-- ============================================
-- pc_settings: Python client reads, web manages via service_role
-- ============================================
CREATE POLICY "pc_settings_select" ON pc_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "pc_settings_insert" ON pc_settings
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "pc_settings_update" ON pc_settings
    FOR UPDATE USING (TRUE);

-- ============================================
-- app_version: everyone can read
-- ============================================
CREATE POLICY "app_version_select" ON app_version
    FOR SELECT USING (TRUE);

-- ============================================
-- Enable realtime for pcs table (for web dashboard)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE pcs;
