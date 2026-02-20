-- Make user_id nullable (desktop creates code without knowing the parent)
ALTER TABLE pairing_codes ALTER COLUMN user_id DROP NOT NULL;

-- Add columns for inverted pairing flow
ALTER TABLE pairing_codes ADD COLUMN IF NOT EXISTS device_jwt text;
ALTER TABLE pairing_codes ADD COLUMN IF NOT EXISTS platform text DEFAULT 'windows';
