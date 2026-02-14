"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import type { ICardPaymentFormData, ICardPaymentBrickPayer } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";
import { PLANS } from "@/lib/mercadopago";
import { CheckIcon } from "@heroicons/react/20/solid";
import { clearSubscriptionCache } from "@/hooks/use-subscription";

// Initialize MercadoPago client-side SDK
if (typeof window !== "undefined") {
  initMercadoPago(process.env.NEXT_PUBLIC_MELI_PUBLIC_KEY || "", { locale: "pt-BR" });
}

export default function PricingPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showBrick, setShowBrick] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<{
    subscribed: boolean;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  } | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/mercadopago/status")
        .then((r) => r.json())
        .then(setSubStatus)
        .catch(() => {});
    }
  }, [isSignedIn]);

  const handleCardSubmit = async (formData: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_token_id: formData.token,
          payer_email: formData.payer?.email || user?.primaryEmailAddress?.emailAddress || "",
        }),
      });
      const data = await res.json();

      if (data.success) {
        clearSubscriptionCache();
        window.location.href = "/dispositivos?subscribed=true";
      } else if (data.url) {
        // Fallback redirect mode
        clearSubscriptionCache();
        window.location.href = data.url;
      } else {
        setError(data.error || "Erro ao processar assinatura. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao criar assinatura:", err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mercadopago/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        clearSubscriptionCache();
        window.location.reload();
      }
    } catch (err) {
      console.error("Erro ao cancelar assinatura:", err);
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS.monthly;

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Plano KidsPC
        </h1>
        <p className="mt-2 text-gray-500">
          Controle o tempo e barulho do seu filho remotamente.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-gray-900">
            {plan.price}
            <span className="text-lg text-gray-500 font-normal">/{plan.interval}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{plan.name}</div>
        </div>

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <CheckIcon className="size-5 text-indigo-600 shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {!isLoaded ? (
          <div className="text-center text-gray-400 text-sm">Carregando...</div>
        ) : !isSignedIn ? (
          <SignInButton mode="modal">
            <button className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition">
              Entrar para assinar
            </button>
          </SignInButton>
        ) : subStatus?.subscribed ? (
          <div className="space-y-3">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckIcon className="mr-1.5 size-4" />
                Assinatura ativa
              </span>
              {subStatus.cancel_at_period_end && (
                <p className="text-amber-600 text-sm mt-2">
                  Cancela em{" "}
                  {new Date(subStatus.current_period_end!).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {loading ? "Cancelando..." : "Cancelar assinatura"}
            </button>
          </div>
        ) : showBrick ? (
          <div>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <CardPayment
              initialization={{ amount: 19.9 }}
              onSubmit={handleCardSubmit}
              onError={(err: unknown) => {
                console.error("Brick error:", err);
                setError("Erro no formulário de pagamento.");
              }}
            />
            <button
              onClick={() => setShowBrick(false)}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Voltar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowBrick(true)}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            Assinar agora
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Pagamentos processados com segurança pelo Mercado Pago. Cancele a qualquer momento.
      </p>
    </div>
  );
}
