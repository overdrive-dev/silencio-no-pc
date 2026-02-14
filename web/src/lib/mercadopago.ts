import { MercadoPagoConfig } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MELI_ACCESS_TOKEN;
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

export const PLANS = {
  monthly: {
    name: "Mensal",
    price: "R$ 19,90",
    interval: "mês",
    features: [
      "Monitoramento de barulho em tempo real",
      "Controle de tempo de uso",
      "Comandos remotos (bloquear, desbloquear, +tempo)",
      "Histórico de uso e eventos",
      "Configurações remotas",
      "Dispositivos ilimitados",
    ],
  },
} as const;
