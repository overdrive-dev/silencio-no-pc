"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { PLANS } from "@/lib/mercadopago";
import { CheckIcon } from "@heroicons/react/20/solid";
import { clearSubscriptionCache } from "@/hooks/use-subscription";

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
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

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mercadopago/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        clearSubscriptionCache();
        window.location.href = data.url;
      } else {
        setError(data.error || "Erro ao criar checkout. Tente novamente.");
      }
    } catch {
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-display tracking-tight text-[#1a1a2e] sm:text-4xl">
          Plano KidsPC
        </h1>
        <p className="mt-2 text-gray-500">
          Controle o tempo e barulho do seu filho remotamente.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="card-flat p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 blob-blue opacity-30" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="text-5xl font-display text-[#1a1a2e]">
                {plan.price}
                <span className="text-lg text-gray-400 font-sans font-normal">/{plan.interval}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">{plan.name}</div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckIcon className="size-5 text-[#4A7AFF] shrink-0 mt-0.5" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!isLoaded ? (
              <div className="text-center text-gray-400 text-sm">Carregando...</div>
            ) : !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="btn-pill btn-pill-primary w-full justify-center">
                  Entrar para assinar
                </button>
              </SignInButton>
            ) : subStatus?.subscribed ? (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-600">
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
                  className="btn-pill btn-pill-outline w-full justify-center hover:border-[#FF6B6B] hover:text-[#FF6B6B] disabled:opacity-50"
                >
                  {loading ? "Cancelando..." : "Cancelar assinatura"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn-pill btn-pill-primary w-full justify-center disabled:opacity-50"
              >
                {loading ? "Redirecionando para o Mercado Pago..." : "Assinar agora"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pagamentos processados com segurança pelo Mercado Pago. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
}
