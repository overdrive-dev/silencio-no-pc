-- Subscriptions table: tracks MercadoPago (and legacy Stripe) subscription state per user
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    mp_payer_id TEXT,
    mp_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'inactive',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    max_devices INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_sub_id ON subscriptions(mp_subscription_id) WHERE mp_subscription_id IS NOT NULL;

-- RLS: web uses service_role (bypasses), anon needs read/write for webhook upserts
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select" ON subscriptions
    FOR SELECT USING (TRUE);

CREATE POLICY "subscriptions_insert" ON subscriptions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "subscriptions_update" ON subscriptions
    FOR UPDATE USING (TRUE);
