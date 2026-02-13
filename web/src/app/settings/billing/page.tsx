"use client";

import { useState } from "react";
import { useSubscription, clearSubscriptionCache } from "@/hooks/use-subscription";
import { CheckIcon } from "@heroicons/react/20/solid";

export default function SettingsBillingPage() {
  const { subscription, loading, isActive, isInGracePeriod, isPastDue, isCanceled, daysUntilBlock } = useSubscription();
  const [actionLoading, setActionLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const handleManagePortal = async () => {
    setActionLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        clearSubscriptionCache();
        window.location.href = data.url;
      } else {
        console.error("Portal response:", data);
        setPortalError(data.error || "Erro ao abrir portal de pagamento. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao abrir portal:", err);
      setPortalError("Erro de conexão. Tente novamente em alguns segundos.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {portalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{portalError}</p>
            <button
              onClick={handleManagePortal}
              className="mt-2 text-sm font-semibold text-red-700 hover:text-red-600 underline"
            >
              Tentar novamente
            </button>
          </div>
          <button onClick={() => setPortalError(null)} className="text-red-400 hover:text-red-600 text-lg">×</button>
        </div>
      )}

      {/* Subscription status */}
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900">Assinatura</h2>
        <p className="mt-1 text-sm/6 text-gray-500">
          Gerencie seu plano e método de pagamento.
        </p>

        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Status</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div>
                {isActive && !isPastDue && !isCanceled && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    <CheckIcon className="mr-1.5 size-4" />
                    Ativa
                  </span>
                )}
                {isPastDue && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                    Pagamento pendente
                  </span>
                )}
                {isCanceled && isActive && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                    Cancelada (ativa até o fim do período)
                  </span>
                )}
                {isInGracePeriod && !isActive && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                    Expirada — {daysUntilBlock}d restantes
                  </span>
                )}
                {!isActive && !isInGracePeriod && !subscription?.stripe_subscription_id && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    Sem assinatura
                  </span>
                )}
              </div>
              {(isActive || isInGracePeriod) && (
                <button
                  type="button"
                  onClick={handleManagePortal}
                  disabled={actionLoading}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  {actionLoading ? "Abrindo..." : "Gerenciar"}
                </button>
              )}
            </dd>
          </div>
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Plano</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">
                {isActive || isInGracePeriod ? "Mensal — R$ 19,90/mês" : "Nenhum"}
              </div>
            </dd>
          </div>
          {subscription?.current_period_start && (
            <div className="py-6 sm:flex">
              <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Início do período</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900">
                  {new Date(subscription.current_period_start).toLocaleDateString("pt-BR")}
                </div>
              </dd>
            </div>
          )}
          {subscription?.current_period_end && (
            <div className="py-6 sm:flex">
              <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                {isCanceled ? "Acesso até" : "Próxima cobrança"}
              </dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900">
                  {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Action */}
      {!isActive && !isInGracePeriod && (
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900">Assinar</h2>
          <p className="mt-1 text-sm/6 text-gray-500">
            Assine para adicionar PCs e controlar remotamente.
          </p>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              onClick={handleSubscribe}
              disabled={actionLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {actionLoading ? "Redirecionando..." : "Assinar agora — R$ 19,90/mês"}
            </button>
            <p className="mt-3 text-xs text-gray-400">
              Pagamentos processados com segurança pelo Stripe. Cancele a qualquer momento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
