# Common Misframes

Catalog of past framing mistakes where the team built (or almost built) the wrong thing due to incorrect assumptions. Each entry explains the misframe, why it happened, and how to catch it early.

**How to use**: Before planning, scan this list. If the current request resembles a past misframe, proactively warn the user.

---

<!-- New entries are added at the top. Oldest entries at the bottom. -->

## Webhook treating plan-level notifications as subscriptions

**Pattern**: MercadoPago webhook receives `subscription_preapproval_plan` notifications and tries to process them like user subscriptions.

**Past example**: Webhook called `PreApproval.get({ id })` with a plan ID (not a preapproval ID) → 404 → 500 → MP retries flooding the server.

**How to catch**: Ask "Does this webhook code distinguish between `subscription_preapproval` (user subscription) and `subscription_preapproval_plan` (plan-level)?" Plan-level should be ACKed without processing.

---

## Windows-only features without Android consideration

**Pattern**: Building a feature for the desktop app only, without considering that Android devices share the same Supabase tables and sync protocol.

**Past example**: App blocking was implemented for Windows (psutil-based) but the `blocked_apps` table and API were shared. Android needed its own AccessibilityService implementation.

**How to catch**: Ask "Does this feature change the sync protocol or add new tables?" If yes → verify both platforms are accounted for.

---

## Using shared anon key instead of per-device JWT

**Pattern**: Using the Supabase shared anon key for device data access instead of the per-device JWT.

**Past example**: Early implementation used shared anon key with `USING (true)` RLS policies → any device could read any other device's data. Required migration to per-device JWT with `jwt_pc_id()` function.

**How to catch**: Ask "Does this code access device-scoped data?" If yes → it MUST use per-device JWT, not anon key.

---

## Testing subscriptions with the seller account

**Pattern**: Trying to test MercadoPago subscriptions using the same account that owns the plan.

**Past example**: Developer tried to subscribe to their own plan → "Confirmar" button grayed out on MercadoPago checkout page. MP blocks sellers from subscribing to their own plans.

**How to catch**: If testing payment flows → always use MercadoPago test accounts, never the seller account.

---

## Forgetting to update app_version table after release

**Pattern**: Publishing a new desktop app version to GitHub Releases but forgetting to update the `app_version` table in Supabase.

**Past example**: New version was published but no installed apps received the update notification because `app_version` table still had the old version URL.

**How to catch**: Ask "Is this a release/publish task?" If yes → update `app_version` table with new version, download URL, and changelog.
