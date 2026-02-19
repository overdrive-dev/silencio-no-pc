# Security Review Checklist

## Auth & Authorization
- [ ] Web API routes check `await auth()` and verify `userId` before data access
- [ ] Device operations verify `user_id = userId` ownership
- [ ] Webhook endpoint (`/api/mercadopago/webhook`) has NO Clerk auth (public for MP notifications)
- [ ] No secrets or API keys hardcoded in source
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used server-side (API routes), never in client code
- [ ] `NEXT_PRIVATE_SUPABASE_JWT_SECRET` never exposed to client
- [ ] `.env.local` in `.gitignore` — no real keys in version control

## Supabase RLS
- [ ] All device data tables have RLS policies using `jwt_pc_id()`
- [ ] New tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] No policies with `USING (true)` on sensitive tables
- [ ] Device JWT includes `pc_id`, `user_id`, and `role: "anon"` claims

## Input & Validation
- [ ] API route inputs validated before database operations
- [ ] Pairing tokens validated for format (6-digit) and expiry (5 min TTL)
- [ ] Device names sanitized (no XSS in dashboard display)
- [ ] File paths in Python desktop validated (no path traversal)

## Desktop Security
- [ ] Config encrypted with Fernet — never raw JSON on disk
- [ ] Password hashed with PBKDF2 (480k iterations) — never stored plaintext
- [ ] Desktop app doesn't expose Supabase credentials in logs
- [ ] Hosts file modifications (site blocker) require admin privileges

## Data Isolation
- [ ] Users can only see/modify their own devices (scoped by Clerk userId)
- [ ] Devices can only access their own data (scoped by device JWT pc_id)
- [ ] Subscription data scoped to user
- [ ] No cross-user data leaks in API responses

## Severity Guide

| Level | When to use | Action |
|---|---|---|
| 🔴 Critical | Security vulnerability, data loss risk, broken functionality | Must fix before merge |
| 🟡 Warning | Convention violation, performance concern, potential bug | Should fix |
| 🔵 Suggestion | Style improvement, minor optimization, better practice | Nice to have |
