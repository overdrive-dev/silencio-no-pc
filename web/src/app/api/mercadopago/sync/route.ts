import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient, mapMpStatus } from "@/lib/mercadopago";
import { upsertSubscription, getUserSubscription } from "@/lib/subscription";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await getUserSubscription(userId);

    // If user already has an active subscription (possibly grandfathered Stripe), skip MP sync
    if (existing && existing.status === "active" && existing.stripe_subscription_id && !existing.mp_subscription_id) {
      return NextResponse.json({
        subscribed: true,
        status: "active",
        synced: false,
        source: "stripe_grandfathered",
      });
    }

    const client = getMercadoPagoClient();
    const preApprovalApi = new PreApproval(client);

    // Search for subscriptions by external_reference (clerk userId)
    const results = await preApprovalApi.search({
      options: {
        external_reference: userId,
        sort: "date_created:desc",
        limit: 1,
      },
    });

    const subscriptions = results.results || [];
    if (subscriptions.length === 0) {
      return NextResponse.json({ subscribed: false, status: "no_subscription" });
    }

    const sub = subscriptions[0];
    const status = mapMpStatus(sub.status || "pending");

    const now = new Date().toISOString();
    const nextChargeDate = sub.next_payment_date
      ? new Date(sub.next_payment_date).toISOString()
      : null;
    const startDate = sub.date_created
      ? new Date(sub.date_created).toISOString()
      : now;

    await upsertSubscription(userId, {
      mp_subscription_id: sub.id,
      mp_payer_id: sub.payer_id?.toString() || null,
      plan: "monthly",
      status,
      current_period_start: startDate,
      current_period_end: nextChargeDate || startDate,
      cancel_at_period_end: status === "canceled",
    });

    return NextResponse.json({
      subscribed: status === "active",
      status,
      synced: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mp-sync] Error:", message);
    return NextResponse.json(
      { subscribed: false, status: "sync_error", error: message },
      { status: 500 }
    );
  }
}
