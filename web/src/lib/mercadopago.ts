import { MercadoPagoConfig } from "mercadopago";

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
