import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getUserSubscription } from "@/lib/subscription";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const payerEmail = user?.emailAddresses?.[0]?.emailAddress;
  if (!payerEmail) {
    return NextResponse.json({ error: "E-mail não encontrado na sua conta." }, { status: 400 });
  }

  const existing = await getUserSubscription(userId);
  if (existing && (existing.status === "active" || existing.status === "authorized")) {
    return NextResponse.json({ error: "Você já possui uma assinatura ativa." }, { status: 400 });
  }

  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kidspc.com.br";

  try {
    const subscription = await preApproval.create({
      body: {
        reason: "KidsPC — Plano Mensal",
        external_reference: userId,
        payer_email: payerEmail,
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
      console.error("[mp-checkout] MercadoPago did not return init_point", JSON.stringify(subscription));
      return NextResponse.json(
        { error: "MercadoPago não retornou URL de pagamento. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: subscription.init_point });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mp-checkout] Error creating subscription:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
