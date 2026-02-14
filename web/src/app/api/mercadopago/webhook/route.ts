import { NextRequest, NextResponse } from "next/server";
import { PreApproval, Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { upsertSubscription } from "@/lib/subscription";

// Map MercadoPago subscription status to our internal status
function mapStatus(mpStatus: string): string {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
      return "canceled";
    case "pending":
      return "pending";
    default:
      return mpStatus;
  }
}

const SUBSCRIPTION_TYPES = new Set([
  "subscription_preapproval",
  "subscription_authorized_payment",
  "subscription_preapproval_plan",
]);

async function handleSubscriptionNotification(id: string) {
  const client = getMercadoPagoClient();
  const preApprovalApi = new PreApproval(client);

  const preapproval = await preApprovalApi.get({ id });

  const externalRef = preapproval.external_reference;
  if (!externalRef) {
    console.warn("[mp-webhook] No external_reference on preapproval", id);
    return;
  }

  const userId = externalRef;
  const status = mapStatus(preapproval.status || "pending");
  const now = new Date().toISOString();

  await upsertSubscription(userId, {
    mp_subscription_id: preapproval.id,
    mp_payer_id: preapproval.payer_id?.toString() || null,
    plan: "monthly",
    status,
    current_period_start: preapproval.date_created
      ? new Date(preapproval.date_created).toISOString()
      : now,
    current_period_end: preapproval.next_payment_date
      ? new Date(preapproval.next_payment_date).toISOString()
      : now,
    cancel_at_period_end: status === "canceled",
  });

  console.log(`[mp-webhook] Subscription updated for user ${userId}: ${status}`);
}

async function handlePaymentNotification(id: string) {
  const client = getMercadoPagoClient();
  const paymentApi = new Payment(client);

  const payment = await paymentApi.get({ id });

  // Only care about payments linked to a preapproval (subscription)
  const preapprovalId = (payment as unknown as Record<string, unknown>).preapproval_id as string | undefined;
  if (!preapprovalId) return;

  // Fetch the parent subscription to update status
  const preApprovalApi = new PreApproval(client);
  const preapproval = await preApprovalApi.get({ id: preapprovalId });

  const externalRef = preapproval.external_reference;
  if (!externalRef) return;

  const userId = externalRef;
  const status = mapStatus(preapproval.status || "pending");
  const now = new Date().toISOString();

  await upsertSubscription(userId, {
    mp_subscription_id: preapproval.id,
    mp_payer_id: preapproval.payer_id?.toString() || null,
    plan: "monthly",
    status,
    current_period_start: preapproval.date_created
      ? new Date(preapproval.date_created).toISOString()
      : now,
    current_period_end: preapproval.next_payment_date
      ? new Date(preapproval.next_payment_date).toISOString()
      : now,
    cancel_at_period_end: status === "canceled",
  });

  console.log(`[mp-webhook] Payment ${id} → subscription updated for user ${userId}: ${status}`);
}

export async function POST(request: NextRequest) {
  let body: { data: { id: string }; type: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[mp-webhook] Received: type=${body.type} id=${body.data?.id}`);

  try {
    if (SUBSCRIPTION_TYPES.has(body.type)) {
      await handleSubscriptionNotification(body.data.id);
    } else if (body.type === "payment") {
      await handlePaymentNotification(body.data.id);
    }
  } catch (err) {
    console.error(`[mp-webhook] Error processing ${body.type}:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
