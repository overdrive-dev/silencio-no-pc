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
    <div className="min-h-screen flex flex-col">
      {/* Hero area */}
      <div className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="relative max-w-lg mx-auto px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-400 mb-3">Preços</p>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white sm:text-5xl">
            Plano KidsPC
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Controle o tempo e barulho do seu filho remotamente.
          </p>
        </div>
      </div>

      {/* Pricing card */}
      <div className="flex-1 max-w-lg mx-auto px-6 -mt-4 pb-20 w-full">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-8 glow-violet relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="text-5xl font-display font-bold text-white">
                {plan.price}
                <span className="text-lg text-zinc-500 font-normal">/{plan.interval}</span>
              </div>
              <div className="text-sm text-zinc-400 mt-1">{plan.name}</div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckIcon className="size-5 text-violet-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {!isLoaded ? (
              <div className="text-center text-zinc-500 text-sm">Carregando...</div>
            ) : !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all hover:shadow-xl hover:shadow-violet-500/30">
                  Entrar para assinar
                </button>
              </SignInButton>
            ) : subStatus?.subscribed ? (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
                    <CheckIcon className="mr-1.5 size-4" />
                    Assinatura ativa
                  </span>
                  {subStatus.cancel_at_period_end && (
                    <p className="text-amber-400 text-sm mt-2">
                      Cancela em{" "}
                      {new Date(subStatus.current_period_end!).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold text-zinc-300 border border-white/[0.1] hover:border-white/[0.2] hover:text-white disabled:opacity-50 transition-all"
                >
                  {loading ? "Cancelando..." : "Cancelar assinatura"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 disabled:opacity-50 transition-all hover:shadow-xl hover:shadow-violet-500/30"
              >
                {loading ? "Redirecionando para o Mercado Pago..." : "Assinar agora"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Pagamentos processados com segurança pelo Mercado Pago. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
}
