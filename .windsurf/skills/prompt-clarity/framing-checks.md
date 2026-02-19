# Framing Checks Library

Domain-specific pre-flight questions the Senior PO runs before the team starts working. This file grows over time as `@root-cause-review` discovers new framing mistakes.

**How to use**: Identify which domains the request touches, then run ONLY those checks. Flag concerns to the user before planning.

---

## Auth & Security

- Does this feature touch authentication? → Web uses Clerk (`auth()` from `@clerk/nextjs/server`), desktop uses device JWT
- Does it need Clerk userId? → API routes must `await auth()` and check `userId` before data access
- Does it expose Supabase keys? → Service role key is server-only. Client uses API routes, never direct Supabase
- Is this a webhook endpoint? → Webhooks (MercadoPago) must NOT have Clerk auth — they're called by external services
- Does it create/modify device JWTs? → JWT must include `pc_id`, `user_id`, and `role: "anon"` claims

## Desktop App (Python)

- Does this feature touch the config? → Always use `Config` class, never raw file access
- Does it make Supabase calls? → Must be on main thread (QTimer), never from QThread
- Does it change the sync protocol? → Verify both desktop and Android implement the same protocol
- Does it affect the pairing flow? → Changes must be reflected in claim API, desktop pairing, and Android pairing
- Is this Windows-specific? → Check if Android equivalent is needed

## Supabase / Database

- Does this add a new table? → Must include RLS policies and timestamps
- Does this modify RLS? → Verify per-device JWT pattern (`jwt_pc_id()`) is maintained
- Does the migration need to handle existing data? → Check for data migration needs
- Does it affect device deletion? → Verify CASCADE is configured for new child tables
- Is this a cross-platform change? → Both Windows and Android devices share the same tables

## Frontend (Web)

- Does this UI pattern already exist in `component-patterns.md`? → Reuse, don't reinvent
- Is this a novel UI pattern? → Trigger `@ui-ux-research` step
- Does it need responsive behavior? → Check mobile layout, card grids, nav
- Is this a landing page change? → Landing uses `bg-background` cream, blobs, `font-display` headings
- Is this a dashboard change? → Dashboard uses `card-flat` white cards, `bg-background` cream bg

## Payments (MercadoPago)

- Does this change subscription logic? → Verify pricing: R$19,90 base + R$14,90/extra device
- Does it touch the webhook? → Must filter `subscription_preapproval_plan` (ACK only)
- Does it need plan-based vs direct preapproval? → We use plan-based model with `getOrCreatePlan()`
- Can the developer test this? → Self-subscription blocked by MP. Use test accounts.

## Data Flow

- Where does data flow? → Desktop → Supabase ← Web API ← Clerk auth
- Does the feature require real-time updates? → Desktop syncs every 30s, web polls API
- Does it affect the pairing flow? → Token generation (desktop) → Claim API (web) → JWT return
- Is there an offline scenario? → Desktop must handle offline gracefully (skip sync, keep local state)
