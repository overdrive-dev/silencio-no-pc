# Component Registry

Catalog of all shared/reusable React components in the KidsPC web project. Check here **before** creating a new component — it may already exist.

> **Convention**: Shared components live in `web/src/components/`. Feature-specific components in `components/device/` and `components/landing/`. Hooks in `web/src/hooks/`.

---

## Layout Components (`components/`)

| Component | Path | Props | Notes |
|---|---|---|---|
| **NavBar** | `nav-bar.tsx` | — | Sticky top nav. Landing vs dashboard mode. Clerk auth buttons. Mobile hamburger. |
| **MainWrapper** | `main-wrapper.tsx` | `children` | Wraps page content with appropriate bg. Detects landing vs dashboard routes. |
| **PaymentBanner** | `payment-banner.tsx` | — | Banner for subscription warnings (grace period, past due). |

## Landing Components (`components/landing/`)

| Component | Path | Props | Notes |
|---|---|---|---|
| **HeroIllustration** | `landing/illustrations.tsx` | — | Flat SVG illustration of parent with phone + child with computer. |
| **ParentPhoneIllustration** | `landing/illustrations.tsx` | — | SVG of parent holding phone with dashboard. |
| **FamilyIllustration** | `landing/illustrations.tsx` | — | SVG of family scene. |
| **FaqSection** | `landing/faq-section.tsx` | — | Accordion FAQ with card-flat items. |

## Device Components (`components/device/`)

| Component | Path | Props | Notes |
|---|---|---|---|
| **DeviceCard** | `device/device-card.tsx` | `device` | Device summary card with platform icon, online status, usage. |
| **UsageChart** | `device/usage-chart.tsx` | `data` | Recharts bar chart for daily usage. |
| **StrikesList** | `device/strikes-list.tsx` | `strikes` | List of strike events with timestamps. |
| **ControlsTab** | `device/controls-tab.tsx` | `deviceId` | Blocked apps/sites management with mode toggle. |
| **SettingsTab** | `device/settings-tab.tsx` | `deviceId`, `settings` | Device settings form (limits, schedule, volume). |

---

## Hooks (`hooks/`)

| Hook | Path | Returns | Notes |
|---|---|---|---|
| **useSubscription** | `hooks/use-subscription.ts` | `{ hasAccess, isInGracePeriod, isPastDue, daysUntilBlock, canAddDevice, maxDevices, deviceCount, invalidate }` | Fetches `/api/mercadopago/status`. Caches with SWR-like pattern. |

---

## Pages (`app/`)

| Page | Route | Auth | Notes |
|---|---|---|---|
| Landing | `/` | Public | Hero, features, testimonials, pricing, FAQ |
| Dispositivos | `/dispositivos` | Clerk | Device list, add device |
| Dispositivo | `/dispositivo/[id]` | Clerk | Device dashboard with tabs (uso, controles, configurações) |
| Download | `/download` | Public | Desktop app download with steps |
| Pricing | `/pricing` | Public | Subscription plans |
| Settings | `/settings` | Clerk | Profile, billing, notifications |
| Sobre | `/sobre` | Public | About page |
| Dicas | `/dicas-atividades` | Public | Activity tips for parents |
| Política | `/politica-privacidade` | Public | Privacy policy |
| Billing | `/billing` | Clerk | Redirect to MercadoPago |

---

## When to Create a New Component

Create a new shared component when:
1. The same UI pattern appears in **3+ pages** with identical structure
2. The component has **configurable props** (not just copy-paste)
3. It doesn't already exist in this registry

**Before creating**: Search this file first. If a similar component exists, extend it with new props rather than creating a duplicate.
