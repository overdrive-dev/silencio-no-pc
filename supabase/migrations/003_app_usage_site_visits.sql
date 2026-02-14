-- App usage: tracks time spent per app per device per day
CREATE TABLE IF NOT EXISTS app_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  pc_id uuid NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  app_name text NOT NULL,
  display_name text,
  minutes integer NOT NULL DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_usage_pc_date_app ON app_usage(pc_id, date, app_name);
CREATE INDEX IF NOT EXISTS idx_app_usage_pc_date ON app_usage(pc_id, date);

ALTER TABLE app_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON app_usage FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON app_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON app_usage FOR UPDATE USING (true);

-- Site visits: tracks visited domains per device per day
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  pc_id uuid NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  domain text NOT NULL,
  title text,
  visit_count integer NOT NULL DEFAULT 1,
  total_seconds integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'window_title',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_visits_pc_date_domain ON site_visits(pc_id, date, domain);
CREATE INDEX IF NOT EXISTS idx_site_visits_pc_date ON site_visits(pc_id, date);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_select" ON site_visits FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON site_visits FOR UPDATE USING (true);
