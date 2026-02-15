import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getUserSubscription } from "@/lib/subscription";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    // 1. Get email from Clerk
    const user = await currentUser();
    const payerEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!payerEmail) {
      console.error("[mp-checkout] No email found for user", userId);
      return NextResponse.json({ error: "E-mail não encontrado na sua conta." }, { status: 400 });
    }
    console.log("[mp-checkout] Creating subscription for", userId, payerEmail);

    // 2. Check existing subscription
    const existing = await getUserSubscription(userId);
    if (existing && (existing.status === "active" || existing.status === "authorized")) {
      return NextResponse.json({ error: "Você já possui uma assinatura ativa." }, { status: 400 });
    }

    // 3. Verify access token exists
    if (!process.env.MELI_ACCESS_TOKEN) {
      console.error("[mp-checkout] MELI_ACCESS_TOKEN is not set");
      return NextResponse.json({ error: "Configuração do Mercado Pago ausente. Contate o suporte." }, { status: 500 });
    }

    // 4. Create MercadoPago PreApproval
    const client = getMercadoPagoClient();
    const preApproval = new PreApproval(client);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kidspc.com.br";

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
      console.error("[mp-checkout] No init_point returned", JSON.stringify(subscription));
      return NextResponse.json(
        { error: "MercadoPago não retornou URL de pagamento. Tente novamente." },
        { status: 502 }
      );
    }

    console.log("[mp-checkout] Success, redirecting to", subscription.init_point);
    return NextResponse.json({ url: subscription.init_point });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = (err as { status?: number })?.status || 500;
    console.error("[mp-checkout] Error:", status, message, JSON.stringify(err));
    return NextResponse.json(
      { error: `Erro ao criar assinatura: ${message}` },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
