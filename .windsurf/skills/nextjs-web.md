# Next.js Web Dashboard Skill

Reference guide for the KidsPC web dashboard (`web/`). Use when modifying pages, API routes, components, or integrations.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** (PostCSS plugin, no `tailwind.config.js` — uses CSS-first config in `globals.css`)
- **Clerk** (auth), **Supabase** (database), **MercadoPago** (payments)
- **@heroicons/react** (primary icons), **lucide-react** (secondary icons)
- **@headlessui/react** (accessible UI primitives), **recharts** (charts)
- **Fonts**: Outfit (display/headings, `--font-display`) + Plus Jakarta Sans (body, `--font-body`)

## Route Map

### Pages

| Route | File | Auth | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Landing page (redirects to `/dispositivos` if logged in) |
| `/dispositivos` | `app/dispositivos/page.tsx` | Required | Device list |
| `/dispositivo/[id]` | `app/dispositivo/[id]/page.tsx` | Required | Device dashboard (tabs: history, events, activity, controls) |
| `/dispositivo/[id]/settings` | `app/dispositivo/[id]/settings/page.tsx` | Required | Device settings |
| `/dispositivo/[id]/events` | `app/dispositivo/[id]/events/page.tsx` | Required | Full events view |
| `/dispositivo/[id]/history` | `app/dispositivo/[id]/history/page.tsx` | Required | Full history view |
| `/settings` | `app/settings/page.tsx` | Required | User settings hub |
| `/settings/billing` | `app/settings/billing/page.tsx` | Required | Subscription management |
| `/settings/security` | `app/settings/security/page.tsx` | Required | Security settings |
| `/settings/notifications` | `app/settings/notifications/page.tsx` | Required | Notification preferences |
| `/billing` | `app/billing/page.tsx` | Required | Billing page |
| `/pricing` | `app/pricing/page.tsx` | Public | Pricing page |
| `/download` | `app/download/page.tsx` | Public | App download page |
| `/politica-privacidade` | `app/politica-privacidade/page.tsx` | Public | Privacy policy |
| `/dicas-atividades` | `app/dicas-atividades/page.tsx` | Public | Activity ideas to replace screen time (by age group) |
| `/sobre` | `app/sobre/page.tsx` | Public | About us — mission, values, story |

### API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/dispositivos` | GET, POST | List user's PCs, create new PC |
| `/api/dispositivos/claim` | POST | Claim sync token (pairing flow) |
| `/api/dispositivo/[id]` | GET, DELETE | Get/remove single PC |
| `/api/dispositivo/[id]/settings` | GET, PUT | Read/update PC settings |
| `/api/dispositivo/[id]/commands` | POST | Send command to PC |
| `/api/dispositivo/[id]/events` | GET | Paginated events (query: `limit`, `offset`, `type`) |
| `/api/dispositivo/[id]/history` | GET | Daily usage (query: `days`) |
| `/api/dispositivo/[id]/token` | POST | Generate new sync token |
| `/api/dispositivo/[id]/activity` | GET | App usage + site visits (query: `days`, `date`) |
| `/api/dispositivo/[id]/blocked-apps` | GET, POST, DELETE | Manage blocked apps |
| `/api/dispositivo/[id]/blocked-sites` | GET, POST, DELETE | Manage blocked sites |
| `/api/pairing` | POST | Validate pairing code |
| `/api/mercadopago/checkout` | POST | Create MercadoPago checkout |
| `/api/mercadopago/webhook` | POST | MercadoPago webhook handler |
| `/api/mercadopago/status` | GET | Check subscription status |
| `/api/mercadopago/sync` | POST | Force-sync subscription state |
| `/api/mercadopago/cancel` | POST | Cancel subscription |

## Auth Pattern

### Middleware (`src/proxy.ts`)
```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
```
Runs on all routes except static files. **Never use deprecated `authMiddleware()`**.

### API Route Auth
```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... proceed with supabase admin
}
```

### Client-Side Auth
- `<ClerkProvider>` wraps the entire app in `layout.tsx`
- Use `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` from `@clerk/nextjs`
- Auth routes: standard Clerk modal (no custom sign-in/sign-up pages)

## Supabase Access

### Two Clients

| Client | File | Key | Use Case |
|---|---|---|---|
| `supabase-client.ts` | `lib/supabase-client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side (rare, limited by RLS) |
| `supabase-server.ts` | `lib/supabase-server.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Server-side API routes (bypasses RLS) |

**Always use `getSupabaseAdmin()`** in API routes — it uses `service_role` key which bypasses RLS. This is necessary because our RLS policies are permissive (TRUE for all), and real filtering is done in application code using `userId` and `pc_id`.

### Ownership Verification Pattern
API routes that operate on a specific device should verify the requesting user owns it:
```typescript
const supabase = getSupabaseAdmin();
const { data: pc } = await supabase.from("pcs").select("*").eq("id", id).eq("user_id", userId).single();
if (!pc) return NextResponse.json({ error: "Not found" }, { status: 404 });
```

## Subscription System (MercadoPago)

### Flow
1. User clicks "Assinar agora" on `/pricing` → `POST /api/mercadopago/checkout` creates a pending PreApproval
2. API returns MercadoPago `init_point` URL → user is **redirected to MercadoPago's page** to pay
3. After payment, MercadoPago redirects back to `/dispositivos?subscribed=true`
4. Webhook `POST /api/mercadopago/webhook` handles `subscription_preapproval`, `subscription_authorized_payment`, and `payment` events → upserts `subscriptions` table
5. Client checks access via `useSubscription()` hook → `GET /api/mercadopago/status`

> **No CardPayment brick / client-side SDK** — all payment happens on MercadoPago's hosted page. `@mercadopago/sdk-react` is still a dependency but not used for checkout.

### Plan
- Single plan: **R$ 19,90/mês** (defined in `lib/mercadopago.ts`)
- Features: unlimited devices, all remote commands, full history

### Hook Usage
```typescript
const { hasAccess, loading } = useSubscription();
// hasAccess = true if status is "active" or within 7-day grace period
```
Actions (commands, settings changes) are disabled when `!hasAccess`.

### Caching
- `useSubscription` caches **only positive states** (subscribed=true) in sessionStorage
- Inactive/no-subscription states are never cached to prevent stale data after account migration
- Call `clearSubscriptionCache()` before any redirect after subscription state change

### Subscribe Button Pattern
- `/settings/billing` "Assinar" button → redirects to `/pricing`
- `/pricing` "Assinar agora" → calls checkout API → redirects to MercadoPago
- `PaymentBanner` "Assinar" → links to `/pricing`

## Device Management

### Danger Zone (device settings page)
- **Desvincular**: Sends `unpair` command → desktop app clears local config → shows PairingDialog. History is kept.
- **Excluir**: `DELETE /api/dispositivo/[id]` → removes PC + all related data. Desktop auto-detects on next heartbeat (3 consecutive orphan checks).
- Both actions have confirmation modals.

## Type System (`lib/types.ts`)

Interfaces mirror Supabase tables exactly:
- `PC` — matches `pcs` table
- `PCSettings` — matches `pc_settings` table
- `AppEvent` — matches `events` table
- `DailyUsage` — matches `daily_usage` table
- `AppUsage` — matches `app_usage` table
- `SiteVisit` — matches `site_visits` table
- `Command` — matches `commands` table
- `UsageSession` — matches `usage_sessions` table
- `PairingCode` — matches `pairing_codes` table
- `WeekSchedule` / `DaySchedule` — schedule JSONB structure

When adding columns to Supabase, **always update the corresponding interface** in `types.ts`.

## Component Conventions

### Layout
- `layout.tsx`: ClerkProvider → html → body → NavBar + MainWrapper + children
- `NavBar` (`components/nav-bar.tsx`): Top navigation with auth state
- `MainWrapper` (`components/main-wrapper.tsx`): Content container
- `PaymentBanner` (`components/payment-banner.tsx`): Shown on device dashboard when no subscription

### Design Tokens (Current)
- **Primary**: teal-600 (not indigo — despite some dashboard elements using indigo-600)
- **Background**: stone-50 (sections alternate with white)
- **Text**: slate-900 (headings), slate-500/600 (body), slate-400 (muted)
- **Cards**: stone-50/80 bg + stone-200/80 ring, hover → white + teal-200/60 ring + shadow
- **Dark sections**: slate-900 bg (testimonials, final CTA)
- **Grain texture**: `bg-grain` class in hero section
- **Radial gradients**: Used for ambient light effects on hero/dark sections
- **Animations**: `animate-fade-in-up` with `delay-N` classes for staggered reveals

### Dashboard Design
- Device dashboard uses indigo-600 accents (buttons, active tabs, links)
- Cards: white bg + gray-200 border + shadow-sm
- Status badges: colored rounded-full with dot indicator
- Quick action buttons: colored grid (green for add, amber for remove, red for lock, blue for unlock)

## Landing Page Structure

1. **Hero** — gradient bg, animated badge, CTA buttons, feature pills
2. **Features** — 7 cards in 3-column grid with icons
3. **How it Works** — 3 steps with timeline line
4. **Testimonials** — 3 cards on dark bg with star ratings
5. **Saúde Digital** — 6 article cards linking to Brazilian health sources
6. **Changelog** — Timeline of versions with bullet lists
7. **FAQ** — Accordion (FaqSection component)
8. **Final CTA** — Dark bg, sign-up buttons
9. **Footer** — Links to sections + privacy policy

## Anti-Patterns

- **Don't use `authMiddleware()`** — deprecated, use `clerkMiddleware()`
- **Don't use `supabase-client.ts` in API routes** — use `getSupabaseAdmin()` for server-side
- **Don't forget ownership checks** — always verify `user_id` matches `userId` from Clerk
- **Don't hardcode API keys** — use `process.env` (server) or `NEXT_PUBLIC_` (client)
- **Don't mix design systems** — landing uses teal/stone, dashboard uses indigo/gray. Keep consistent within each area.
- **Don't create pages router files** — this is App Router only (no `_app.tsx`, no `pages/`)
- **Don't import server modules in client components** — `auth()`, `getSupabaseAdmin()` are server-only
- **Don't forget `"use client"` directive** — required for components using hooks/state/effects (e.g., device dashboard)
