import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { upsertSubscription } from "@/lib/subscription";
import type Stripe from "stripe";

// Stripe API may return timestamps as numbers (unix) or strings (ISO)
function toISO(val: unknown): string {
  if (typeof val === "number") return new Date(val * 1000).toISOString();
  if (typeof val === "string") return new Date(val).toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.clerk_user_id;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const raw = subscription as unknown as Record<string, unknown>;
        await upsertSubscription(userId, {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan: "monthly",
          status: subscription.status,
          current_period_start: toISO(raw.current_period_start),
          current_period_end: toISO(raw.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const raw = subscription as unknown as Record<string, unknown>;
      const customerId = subscription.customer as string;

      // Find user by stripe_customer_id
      const { getSupabaseAdmin } = await import("@/lib/supabase-server");
      const supabase = getSupabaseAdmin();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        await upsertSubscription(sub.user_id, {
          status: subscription.status,
          current_period_start: toISO(raw.current_period_start),
          current_period_end: toISO(raw.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { getSupabaseAdmin } = await import("@/lib/supabase-server");
      const supabase = getSupabaseAdmin();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub) {
        await upsertSubscription(sub.user_id, { status: "past_due" });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
