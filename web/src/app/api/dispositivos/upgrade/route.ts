import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient, calculateSubscriptionAmount, BASE_DEVICES } from "@/lib/mercadopago";
import { getUserSubscription, upsertSubscription } from "@/lib/subscription";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(userId);
  if (!sub || (sub.status !== "active" && sub.status !== "authorized")) {
    return NextResponse.json(
      { error: "Assinatura ativa necessária.", code: "NO_SUBSCRIPTION" },
      { status: 403 }
    );
  }

  const currentMax = sub.max_devices ?? BASE_DEVICES;
  const newMax = currentMax + 1;
  const newAmount = calculateSubscriptionAmount(newMax);

  // Update MercadoPago subscription amount
  if (sub.mp_subscription_id) {
    try {
      const client = getMercadoPagoClient();
      const preApprovalApi = new PreApproval(client);

      await preApprovalApi.update({
        id: sub.mp_subscription_id,
        body: {
          auto_recurring: {
            transaction_amount: newAmount,
            currency_id: "BRL",
          },
          reason: `KidsPC — Plano Mensal (${newMax} dispositivos)`,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[upgrade] Error updating MercadoPago subscription:", message);
      return NextResponse.json(
        { error: "Erro ao atualizar assinatura no Mercado Pago. Tente novamente." },
        { status: 500 }
      );
    }
  }

  // Update local DB
  await upsertSubscription(userId, { max_devices: newMax });

  return NextResponse.json({
    success: true,
    max_devices: newMax,
    new_amount: newAmount,
    new_amount_display: `R$ ${newAmount.toFixed(2).replace(".", ",")}`,
  });
}
