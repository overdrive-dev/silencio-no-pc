# Next.js API Routes Architecture

## Route Map

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/dispositivos` | GET | Clerk | List user's devices |
| `/api/dispositivos` | POST | Clerk | Add new device (checks subscription + device limit) |
| `/api/dispositivos/claim` | POST | Clerk | Claim device via 6-digit token, sign device JWT |
| `/api/dispositivos/upgrade` | POST | Clerk | Add extra device slot (+R$14,90/mês) |
| `/api/dispositivo/[id]` | GET | Clerk | Device details |
| `/api/dispositivo/[id]` | DELETE | Clerk | Delete device and all data |
| `/api/dispositivo/[id]/blocked-apps` | GET/POST/DELETE | Clerk | Manage blocked apps |
| `/api/dispositivo/[id]/blocked-sites` | GET/POST/DELETE | Clerk | Manage blocked sites |
| `/api/mercadopago/checkout` | POST | Clerk | Create subscription via plan-based preapproval |
| `/api/mercadopago/status` | GET | Clerk | Subscription status, max_devices, device_count |
| `/api/mercadopago/webhook` | POST | None | MercadoPago IPN notifications |
| `/api/pairing/generate` | POST | Device JWT | Desktop app generates pairing token |

## Auth Pattern (Clerk)

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... use userId to scope queries
}
```

**NEVER** use deprecated `authMiddleware()`, `withAuth`, or pages router patterns.

## Supabase Access (server-side)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role for API routes
);
```

- **API routes**: Use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS, scopes by userId from Clerk)
- **Device access**: Per-device JWT via `signDeviceJwt()` from `lib/device-jwt.ts`
- **NEVER** expose service role key to client

## Device JWT

```typescript
// web/src/lib/device-jwt.ts
import jwt from "jsonwebtoken";

export function signDeviceJwt(pcId: string, userId: string): string {
  return jwt.sign(
    { pc_id: pcId, user_id: userId, role: "anon" },
    process.env.NEXT_PRIVATE_SUPABASE_JWT_SECRET!,
    { expiresIn: "1y" }
  );
}
```

- JWT lifetime: 1 year, device must re-pair on expiry
- SQL function `jwt_pc_id()` extracts `pc_id` from `request.jwt.claims`
- All RLS policies use `pc_id = jwt_pc_id()`

## MercadoPago Integration

- **Plan-based model**: `getOrCreatePlan()` lazily creates a `preapproval_plan`, caches plan ID
- **Payment methods**: credit_card, ticket (boleto), bank_transfer (pix)
- **Pricing**: R$19,90/mês base (2 devices) + R$14,90/mês per extra device
- **Webhook**: `subscription_preapproval` = user subscription, `subscription_preapproval_plan` = plan-level (ACK only)
- **Upgrade**: `PreApproval.update()` with new `transaction_amount` in `auto_recurring`
- **Env vars**: `MP_ACCESS_TOKEN`, `MP_PLAN_ID` (optional cache)

## Error Response Pattern

```typescript
return Response.json(
  { error: "DEVICE_LIMIT_REACHED", message: "Limite de dispositivos atingido" },
  { status: 403 }
);
```

Use uppercase error codes: `NO_SUBSCRIPTION`, `DEVICE_LIMIT_REACHED`, `INVALID_TOKEN`, `NOT_FOUND`

## Middleware (proxy.ts)

Clerk middleware lives at `web/src/proxy.ts`:
```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
```
