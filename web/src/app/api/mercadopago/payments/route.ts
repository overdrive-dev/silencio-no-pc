import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getMercadoPagoClient();
    const paymentApi = new Payment(client);

    const results = await paymentApi.search({
      options: {
        external_reference: userId,
        sort: "date_created",
        criteria: "desc",
        limit: 12,
      },
    });

    const payments = (results.results || []).map((p) => ({
      id: p.id,
      date: p.date_created || p.date_approved,
      amount: p.transaction_amount,
      currency: p.currency_id,
      status: p.status,
      status_detail: p.status_detail,
      payment_method: p.payment_method_id,
      payment_type: p.payment_type_id,
      description: p.description,
    }));

    return NextResponse.json({ payments });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mp-payments] Error:", message);
    return NextResponse.json({ payments: [], error: message }, { status: 500 });
  }
}
