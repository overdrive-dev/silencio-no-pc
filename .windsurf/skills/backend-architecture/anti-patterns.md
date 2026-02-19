# Things That WILL Break The App

## These cause crashes or data corruption:

- **Reading/writing config files directly** → Desktop config is Fernet-encrypted. ALWAYS use `Config` class. Raw file access bypasses encryption and corrupts the file.
- **Using shared anon key for device data** → Supabase RLS requires per-device JWT (`jwt_pc_id()`). Shared anon key returns empty results or fails policies.
- **Supabase calls from QThread** → Python supabase client isn't thread-safe. Use QTimer on main thread or signal back from QThread to main thread for DB calls.
- **Exposing `SUPABASE_SERVICE_ROLE_KEY` to client** → Service role key bypasses ALL RLS. Only use in Next.js API routes (server-side). NEVER import in client components.
- **Using deprecated Clerk patterns** → `authMiddleware()`, `withAuth`, pages router patterns are all deprecated. Use `clerkMiddleware()` in `proxy.ts` and `auth()` from `@clerk/nextjs/server`.
- **Missing `await` on `auth()`** → `auth()` in Next.js is async. Forgetting `await` returns a Promise, not the auth object. `userId` will be `undefined`.
- **Webhook without plan-type filtering** → `subscription_preapproval_plan` notifications carry a plan ID, not a preapproval ID. Calling `PreApproval.get({ id })` with a plan ID → 404 → 500 → MP retries. ACK plan-level notifications without processing.

## These cause bugs or regressions:

- **Forgetting orphan check in sync loop** → Desktop must validate pairing on every heartbeat. After 3 consecutive failures, auto-unpair. Without this, deleted devices keep running.
- **Not updating `app_version` table when publishing** → Auto-updater checks `app_version` table for latest version. Forgetting to update it means users never get updates.
- **Hardcoding Supabase URL or keys** → Use `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY`. Hardcoding breaks across environments.
- **Device JWT without `role: "anon"`** → Supabase expects a `role` claim. Without it, the JWT is rejected by PostgREST.
- **Forgetting CASCADE on device deletion** → Deleting a `pcs` row must cascade to `pc_settings`, `daily_usage`, `remote_commands`, `strikes`, `app_usage`, `site_visits`, `blocked_apps`, `blocked_sites`.
- **Using `client.from('table').select()` without `.eq('pc_id', ...)` in device context** → RLS filters by JWT, but explicit filtering prevents returning wrong data if JWT is misconfigured.
- **Self-subscription testing with seller account** → MercadoPago blocks the seller from subscribing to their own plan. Use test accounts.
- **Pix for non-MercadoPago users** → Pix in subscriptions only works for users with a MercadoPago account. Non-MP users can use credit card or boleto.

## These violate project rules:

- Adding pip/npm/gradle dependencies without asking the user
- Changing business logic unless the user explicitly asked for it
- Putting imports mid-file — ALWAYS at the top
- UI text not in Português (BR)
- Hardcoding hex colors in frontend — use CSS token classes
