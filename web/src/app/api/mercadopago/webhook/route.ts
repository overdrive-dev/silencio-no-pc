import { NextRequest, NextResponse } from "next/server";
import { PreApproval, Payment } from "mercadopago";
import { getMercadoPagoClient, mapMpStatus } from "@/lib/mercadopago";
import { upsertSubscription } from "@/lib/subscription";
import crypto from "crypto";

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
  const status = mapMpStatus(preapproval.status || "pending");
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
  const status = mapMpStatus(preapproval.status || "pending");
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

function verifyWebhookSignature(request: NextRequest, dataId: string): boolean {
  const secret = process.env.MELI_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[mp-webhook] MELI_WEBHOOK_SECRET not set, skipping signature verification");
    return true;
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) {
    return false;
  }

  let ts: string | undefined;
  let hash: string | undefined;
  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key?.trim() === "ts") ts = value?.trim();
    else if (key?.trim() === "v1") hash = value?.trim();
  }

  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}

export async function POST(request: NextRequest) {
  let body: { data: { id: string }; type: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[mp-webhook] Received: type=${body.type} id=${body.data?.id}`);

  if (!verifyWebhookSignature(request, body.data?.id)) {
    console.warn("[mp-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

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
