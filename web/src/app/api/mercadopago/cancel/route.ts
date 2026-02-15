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

  // No subscription in DB — nothing to cancel
  if (!sub) {
    return NextResponse.json({ success: true, message: "Nenhuma assinatura encontrada." });
  }

  // Has MP subscription — cancel on MercadoPago first
  if (sub.mp_subscription_id) {
    try {
      const client = getMercadoPagoClient();
      const preApprovalApi = new PreApproval(client);

      await preApprovalApi.update({
        id: sub.mp_subscription_id,
        body: { status: "cancelled" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[mp-cancel] Error cancelling on MercadoPago:", message);
      return NextResponse.json({ error: "Erro ao cancelar no Mercado Pago. Tente novamente." }, { status: 500 });
    }
  }

  // Update local DB
  await upsertSubscription(userId, {
    status: "canceled",
    cancel_at_period_end: true,
  });

  return NextResponse.json({ success: true });
}
