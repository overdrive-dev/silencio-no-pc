import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MELI_ACCESS_TOKEN?.trim();
    if (!token) {
      throw new Error("Missing MELI_ACCESS_TOKEN env var");
    }
    _client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 8000 },
    });
  }
  return _client;
}

export function mapMpStatus(mpStatus: string): string {
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

// Pricing constants (in BRL)
export const BASE_PRICE = 19.9; // R$19,90/month — includes 2 devices
export const EXTRA_DEVICE_PRICE = 14.9; // R$14,90/month per extra device
export const BASE_DEVICES = 2;

/** Calculate the total monthly amount for a given number of max devices */
export function calculateSubscriptionAmount(maxDevices: number): number {
  const extras = Math.max(0, maxDevices - BASE_DEVICES);
  return Math.round((BASE_PRICE + extras * EXTRA_DEVICE_PRICE) * 100) / 100;
}

// Plan ID cache (in-memory, per cold start)
let _planId: string | null = null;

/** Get or create MercadoPago preapproval_plan with boleto + pix + credit_card enabled */
export async function getOrCreatePlan(): Promise<string> {
  // Return cached plan ID
  if (_planId) return _planId;

  // Check env var first
  if (process.env.MP_PLAN_ID) {
    _planId = process.env.MP_PLAN_ID;
    return _planId;
  }

  const client = getMercadoPagoClient();
  const planApi = new PreApprovalPlan(client);

  // Search for existing plan
  try {
    const results = await planApi.search({
      options: { status: "active", q: "KidsPC", limit: 1 },
    });
    const existing = results.results as Array<{ id?: string }> | undefined;
    if (existing && existing.length > 0 && existing[0].id) {
      _planId = existing[0].id;
      console.log("[mp-plan] Using existing plan:", _planId);
      return _planId;
    }
  } catch (err) {
    console.warn("[mp-plan] Search failed, will create new plan:", err instanceof Error ? err.message : err);
  }

  // Create new plan with all payment methods enabled
  const plan = await planApi.create({
    body: {
      reason: "KidsPC — Plano Mensal",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: BASE_PRICE,
        currency_id: "BRL",
      },
      payment_methods_allowed: {
        payment_types: [
          { id: "credit_card" },
          { id: "ticket" },
          { id: "bank_transfer" },
        ],
      },
      back_url: (process.env.NEXT_PUBLIC_APP_URL || "https://kidspc.com.br").trim() + "/dispositivos?subscribed=true",
    },
  });

  if (!plan.id) {
    throw new Error("Failed to create MercadoPago plan — no ID returned");
  }

  _planId = plan.id;
  console.log("[mp-plan] Created new plan:", _planId);
  return _planId;
}

export const PLANS = {
  monthly: {
    name: "Mensal",
    price: "R$ 19,90",
    interval: "mês",
    base_devices: BASE_DEVICES,
    extra_device_price: "R$ 14,90",
    features: [
      "Monitoramento de barulho em tempo real",
      "Controle de tempo de uso",
      "Comandos remotos (bloquear, desbloquear, +tempo)",
      "Histórico de uso e eventos",
      "Configurações remotas",
      "Bloqueio de apps e sites",
      `${BASE_DEVICES} dispositivos inclusos`,
      "Dispositivos extras por R$ 14,90/mês cada",
    ],
  },
} as const;
