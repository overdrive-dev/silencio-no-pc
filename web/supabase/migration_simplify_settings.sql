-- Migration: Add sync token to pcs table
ALTER TABLE pcs
  ADD COLUMN IF NOT EXISTS sync_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS sync_token_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_pcs_sync_token ON pcs (sync_token) WHERE sync_token IS NOT NULL;

-- Migration: Add password_hash to pc_settings (parent sets password on the web)
ALTER TABLE pc_settings
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Migration: Simplify pc_settings
-- Add schedule (jsonb per-day) and strike_penalty_minutes
-- Remove noise/warning/idle fields (now controlled locally or not needed)

ALTER TABLE pc_settings
  ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '{
    "0": {"start": "08:00", "end": "22:00"},
    "1": {"start": "08:00", "end": "22:00"},
    "2": {"start": "08:00", "end": "22:00"},
    "3": {"start": "08:00", "end": "22:00"},
    "4": {"start": "08:00", "end": "22:00"},
    "5": {"start": "09:00", "end": "23:00"},
    "6": {"start": "09:00", "end": "23:00"}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS strike_penalty_minutes int DEFAULT 30;

-- Populate schedule from existing allowed_start_time / allowed_end_time / allowed_days
UPDATE pc_settings
SET schedule = (
  SELECT jsonb_object_agg(
    d::text,
    jsonb_build_object('start', allowed_start_time, 'end', allowed_end_time)
  )
  FROM unnest(allowed_days) AS d
)
WHERE allowed_days IS NOT NULL AND array_length(allowed_days, 1) > 0;

-- Drop old columns
ALTER TABLE pc_settings
  DROP COLUMN IF EXISTS allowed_start_time,
  DROP COLUMN IF EXISTS allowed_end_time,
  DROP COLUMN IF EXISTS allowed_days,
  DROP COLUMN IF EXISTS noise_limit_media_offset,
  DROP COLUMN IF EXISTS noise_limit_pico_offset,
  DROP COLUMN IF EXISTS warning_minutes_before,
  DROP COLUMN IF EXISTS idle_timeout_seconds;
