import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { upsertSubscription, getUserSubscription } from "@/lib/subscription";
import type Stripe from "stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const existing = await getUserSubscription(userId);

    let customerId = existing?.stripe_customer_id;

    // If no customer ID stored, search Stripe by metadata
    if (!customerId) {
      const customers = await stripe.customers.search({
        query: `metadata["clerk_user_id"]:"${userId}"`,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json({ subscribed: false, status: "no_customer" });
    }

    // Fetch active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ subscribed: false, status: "no_subscription" });
    }

    const sub = subscriptions.data[0];

    // Stripe API may return timestamps as numbers (unix) or strings (ISO)
    const toISO = (val: unknown): string => {
      if (typeof val === "number") return new Date(val * 1000).toISOString();
      if (typeof val === "string") return new Date(val).toISOString();
      if (val instanceof Date) return val.toISOString();
      return new Date().toISOString();
    };

    const raw = sub as unknown as Record<string, unknown>;
    const periodStart = toISO(raw.current_period_start);
    const periodEnd = toISO(raw.current_period_end);

    await upsertSubscription(userId, {
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan: "monthly",
      status: sub.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
    });

    return NextResponse.json({
      subscribed: sub.status === "active" || sub.status === "trialing",
      status: sub.status,
      synced: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sync] Error:", message);
    return NextResponse.json({ subscribed: false, status: "sync_error", error: message }, { status: 500 });
  }
}
