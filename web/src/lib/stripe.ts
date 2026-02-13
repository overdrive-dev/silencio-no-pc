import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY env var");
    }
    _stripe = new Stripe(key, {
      timeout: 8000,
      maxNetworkRetries: 1,
    });
  }
  return _stripe;
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
