-- Silêncio no PC — Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: pcs
-- PCs linked to a parent account
-- ============================================
CREATE TABLE pcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,  -- Clerk user ID (e.g. user_2abc123)
    name TEXT NOT NULL DEFAULT 'Novo PC',
    paired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    app_running BOOLEAN NOT NULL DEFAULT FALSE,
    shutdown_type TEXT,  -- 'graceful', 'unexpected', or null
    usage_today_minutes INTEGER NOT NULL DEFAULT 0,
    current_noise_db REAL NOT NULL DEFAULT 0,
    strikes INTEGER NOT NULL DEFAULT 0,
    last_heartbeat TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    app_version TEXT DEFAULT '2.0.0'
);

CREATE INDEX idx_pcs_user_id ON pcs(user_id);

-- ============================================
-- Table: pairing_codes
-- Temporary codes for linking PCs to accounts
-- ============================================
CREATE TABLE pairing_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,  -- Clerk user ID of who generated
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    pc_id UUID REFERENCES pcs(id)
);

CREATE INDEX idx_pairing_codes_code ON pairing_codes(code);

-- ============================================
-- Table: usage_sessions
-- Active usage sessions (start/end)
-- ============================================
CREATE TABLE usage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_usage_sessions_pc_id ON usage_sessions(pc_id);
CREATE INDEX idx_usage_sessions_started_at ON usage_sessions(started_at);

-- ============================================
-- Table: daily_usage
-- Aggregated usage per day
-- ============================================
CREATE TABLE daily_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    sessions_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(pc_id, date)
);

CREATE INDEX idx_daily_usage_pc_date ON daily_usage(pc_id, date);

-- ============================================
-- Table: events
-- Synced event log
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL,
    description TEXT,
    noise_db REAL DEFAULT 0
);

CREATE INDEX idx_events_pc_id ON events(pc_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);

-- ============================================
-- Table: commands
-- Command queue (web panel → PC)
-- ============================================
CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pc_id UUID NOT NULL REFERENCES pcs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    command TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    executed_at TIMESTAMPTZ
);

CREATE INDEX idx_commands_pc_pending ON commands(pc_id, status) WHERE status = 'pending';

-- ============================================
-- Table: pc_settings
-- Per-PC settings (editable from web panel)
-- ============================================
CREATE TABLE pc_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pc_id UUID NOT NULL UNIQUE REFERENCES pcs(id) ON DELETE CASCADE,
    daily_limit_minutes INTEGER NOT NULL DEFAULT 120,
    allowed_start_time TEXT NOT NULL DEFAULT '08:00',
    allowed_end_time TEXT NOT NULL DEFAULT '22:00',
    allowed_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
    noise_limit_media_offset INTEGER NOT NULL DEFAULT 35,
    noise_limit_pico_offset INTEGER NOT NULL DEFAULT 50,
    warning_minutes_before INTEGER[] NOT NULL DEFAULT '{15,5}',
    idle_timeout_seconds INTEGER NOT NULL DEFAULT 300
);

-- ============================================
-- Table: app_version
-- Latest app version info (for auto-update)
-- ============================================
CREATE TABLE app_version (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL,
    download_url TEXT NOT NULL,
    changelog TEXT DEFAULT '',
    force_update BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial version
INSERT INTO app_version (version, download_url, changelog)
VALUES ('2.0.0', '', 'Initial release with time management');
