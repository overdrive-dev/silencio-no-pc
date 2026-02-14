import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getUserSubscription, upsertSubscription } from "@/lib/subscription";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(userId);
  if (!sub?.mp_subscription_id) {
    return NextResponse.json({ error: "No MercadoPago subscription found" }, { status: 404 });
  }

  try {
    const client = getMercadoPagoClient();
    const preApprovalApi = new PreApproval(client);

    await preApprovalApi.update({
      id: sub.mp_subscription_id,
      body: { status: "cancelled" },
    });

    await upsertSubscription(userId, {
      status: "canceled",
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mp-cancel] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
