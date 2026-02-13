"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { PLANS } from "@/lib/stripe";
import { CheckIcon } from "@heroicons/react/20/solid";
import { clearSubscriptionCache } from "@/hooks/use-subscription";

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState<{
    subscribed: boolean;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  } | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/stripe/status")
        .then((r) => r.json())
        .then(setSubStatus)
        .catch(() => {});
    }
  }, [isSignedIn]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        clearSubscriptionCache();
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Erro ao criar checkout:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        clearSubscriptionCache();
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Erro ao abrir portal:", err);
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
              onClick={handleManage}
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {loading ? "Abrindo..." : "Gerenciar assinatura"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? "Redirecionando..." : "Assinar agora"}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Cancele a qualquer momento. Sem compromisso.
      </p>
    </div>
  );
}
