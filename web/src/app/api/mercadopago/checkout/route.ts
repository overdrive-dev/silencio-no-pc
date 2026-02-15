import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getUserSubscription, upsertSubscription } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getUserSubscription(userId);
  if (existing && (existing.status === "active" || existing.status === "authorized")) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  let body: { card_token_id?: string; payer_email?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is ok for redirect mode
  }

  const { card_token_id, payer_email } = body;

  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    if (card_token_id && payer_email) {
      // Bricks mode: create subscription with authorized payment (immediate)
      const subscription = await preApproval.create({
        body: {
          reason: "KidsPC — Plano Mensal",
          external_reference: userId,
          payer_email,
          card_token_id,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 19.9,
            currency_id: "BRL",
          },
          back_url: `${appUrl}/dispositivos?subscribed=true`,
          status: "authorized",
        },
      });

      // Subscription created immediately — save to DB
      const now = new Date().toISOString();
      await upsertSubscription(userId, {
        mp_subscription_id: subscription.id,
        mp_payer_id: subscription.payer_id?.toString() || null,
        plan: "monthly",
        status: "active",
        current_period_start: now,
        current_period_end: subscription.next_payment_date
          ? new Date(subscription.next_payment_date).toISOString()
          : now,
        cancel_at_period_end: false,
      });

      return NextResponse.json({ success: true, subscription_id: subscription.id });
    } else {
      // Fallback: redirect mode (pending payment)
      const subscription = await preApproval.create({
        body: {
          reason: "KidsPC — Plano Mensal",
          external_reference: userId,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 19.9,
            currency_id: "BRL",
          },
          back_url: `${appUrl}/dispositivos?subscribed=true`,
          status: "pending",
        },
      });

      if (!subscription.init_point) {
        console.error("[mp-checkout] MercadoPago did not return init_point", subscription);
        return NextResponse.json(
          { error: "MercadoPago não retornou URL de pagamento. Tente novamente." },
          { status: 502 }
        );
      }
      return NextResponse.json({ url: subscription.init_point });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mp-checkout] Error creating subscription:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
