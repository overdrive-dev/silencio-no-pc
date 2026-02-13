"use client";

import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";

export default function PaymentBanner() {
  const { isActive, isInGracePeriod, isPastDue, daysUntilBlock, hasAccess, subscription } = useSubscription();

  if (isActive && !isPastDue) return null;

  // No subscription at all
  if (!subscription || subscription.status === "inactive") {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-center">
          <div className="shrink-0 text-lg">🔒</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Assinatura necessária
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Assine o plano para adicionar dispositivos e ter acesso ao controle remoto.
            </p>
          </div>
          <Link
            href="/pricing"
            className="ml-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 transition"
          >
            Assinar
          </Link>
        </div>
      </div>
    );
  }

  // Past due — payment failed
  if (isPastDue) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <div className="flex items-center">
          <div className="shrink-0 text-lg">⚠️</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Pagamento pendente
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Seu pagamento falhou. Atualize seu método de pagamento para manter o acesso.
              {daysUntilBlock !== null && (
                <span className="font-semibold"> Acesso será bloqueado em {daysUntilBlock} dia{daysUntilBlock !== 1 ? "s" : ""}.</span>
              )}
            </p>
          </div>
          <Link
            href="/pricing"
            className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
          >
            Atualizar pagamento
          </Link>
        </div>
      </div>
    );
  }

  // Grace period — expired but within 7 days
  if (isInGracePeriod) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-center">
          <div className="shrink-0 text-lg">⏳</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Assinatura expirada
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Sua assinatura expirou. Renove para continuar usando.
              {daysUntilBlock !== null && (
                <span className="font-semibold"> Controle será desativado em {daysUntilBlock} dia{daysUntilBlock !== 1 ? "s" : ""}.</span>
              )}
            </p>
          </div>
          <Link
            href="/pricing"
            className="ml-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 transition"
          >
            Renovar
          </Link>
        </div>
      </div>
    );
  }

  // Fully blocked — past grace period
  if (!hasAccess) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <div className="flex items-center">
          <div className="shrink-0 text-lg">🚫</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Acesso bloqueado
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Sua assinatura expirou há mais de 7 dias. Renove para restaurar o controle dos dispositivos.
            </p>
          </div>
          <Link
            href="/pricing"
            className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
          >
            Renovar agora
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
