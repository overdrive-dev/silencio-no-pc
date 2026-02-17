"use client";

import { useState, useEffect } from "react";
import { useSubscription, clearSubscriptionCache } from "@/hooks/use-subscription";
import { CheckIcon, ExclamationTriangleIcon, ComputerDesktopIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { BASE_PRICE, EXTRA_DEVICE_PRICE, BASE_DEVICES, calculateSubscriptionAmount } from "@/lib/mercadopago";

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatPaymentMethod(type: string | null, method: string | null): string {
  const methods: Record<string, string> = {
    credit_card: "Cartão de crédito",
    debit_card: "Cartão de débito",
    ticket: "Boleto",
    bank_transfer: "Pix",
    account_money: "Saldo MP",
  };
  return methods[type || ""] || methods[method || ""] || method || type || "—";
}

function formatPaymentStatus(status: string | null): string {
  const statuses: Record<string, string> = {
    approved: "Aprovado",
    pending: "Pendente",
    in_process: "Processando",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Estornado",
  };
  return statuses[status || ""] || status || "—";
}

interface PaymentRecord {
  id: string;
  date: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  payment_method: string | null;
  payment_type: string | null;
  description: string | null;
}

export default function SettingsBillingPage() {
  const { subscription, loading, isActive, isInGracePeriod, isPastDue, isCanceled, daysUntilBlock, maxDevices, deviceCount } = useSubscription();
  const [actionLoading, setActionLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Payment history
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (!isActive && !isInGracePeriod) return;
    setPaymentsLoading(true);
    fetch("/api/mercadopago/payments")
      .then((r) => r.json())
      .then((data) => setPayments(data.payments || []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [isActive, isInGracePeriod]);

  const handleCancel = async () => {
    setActionLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/mercadopago/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        clearSubscriptionCache();
        window.location.reload();
      } else {
        console.error("Cancel response:", data);
        setPortalError(data.error || "Erro ao cancelar assinatura. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      setPortalError("Erro de conexão. Tente novamente em alguns segundos.");
    } finally {
      setActionLoading(false);
      setShowCancelModal(false);
    }
  };

  const handleSubscribe = () => {
    window.location.href = "/pricing";
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
              onClick={handleCancel}
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
                {!isActive && !isInGracePeriod && !subscription?.mp_subscription_id && !subscription?.stripe_subscription_id && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    Sem assinatura
                  </span>
                )}
              </div>
              {(isActive || isInGracePeriod) && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  Cancelar assinatura
                </button>
              )}
            </dd>
          </div>
          <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Plano</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">
                {isActive || isInGracePeriod ? (
                  <>
                    <span>Mensal — {formatBRL(calculateSubscriptionAmount(maxDevices))}/mês</span>
                    {maxDevices > BASE_DEVICES && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({BASE_DEVICES} base + {maxDevices - BASE_DEVICES} extra{maxDevices - BASE_DEVICES > 1 ? "s" : ""})
                      </span>
                    )}
                  </>
                ) : "Nenhum"}
              </div>
            </dd>
          </div>
          {(isActive || isInGracePeriod) && (
            <div className="py-6 sm:flex">
              <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Dispositivos</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <ComputerDesktopIcon className="size-4 text-gray-400" />
                    <span className="text-gray-900">{deviceCount} de {maxDevices}</span>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        deviceCount >= maxDevices ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, (deviceCount / maxDevices) * 100)}%` }}
                    />
                  </div>
                  {maxDevices > BASE_DEVICES && (
                    <span className="text-xs text-gray-400">
                      +{formatBRL(EXTRA_DEVICE_PRICE)}/mês por extra
                    </span>
                  )}
                </div>
              </dd>
            </div>
          )}
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
          {(isActive || isInGracePeriod) && subscription?.mp_subscription_id && (
            <div className="py-6 sm:flex">
              <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Pagamento</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <a
                  href="https://www.mercadopago.com.br/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
                >
                  Gerenciar no Mercado Pago
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </a>
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
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              Assinar agora — {formatBRL(BASE_PRICE)}/mês
            </button>
            <p className="mt-3 text-xs text-gray-400">
              Pagamentos processados com segurança pelo Mercado Pago. Cancele a qualquer momento.
            </p>
          </div>
        </div>
      )}
      {/* Payment history */}
      {(isActive || isInGracePeriod) && (
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900">Histórico de pagamentos</h2>
          <p className="mt-1 text-sm/6 text-gray-500">
            Últimos pagamentos da sua assinatura.
          </p>
          <div className="mt-6 border-t border-gray-200">
            {paymentsLoading ? (
              <p className="py-6 text-sm text-gray-400">Carregando...</p>
            ) : payments.length === 0 ? (
              <p className="py-6 text-sm text-gray-400">Nenhum pagamento encontrado.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 pr-4 text-left font-medium text-gray-500">Data</th>
                    <th className="py-3 pr-4 text-left font-medium text-gray-500">Valor</th>
                    <th className="py-3 pr-4 text-left font-medium text-gray-500">Método</th>
                    <th className="py-3 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 text-gray-900">
                        {p.date ? new Date(p.date).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-900">
                        {p.amount != null ? formatBRL(p.amount) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 capitalize">
                        {formatPaymentMethod(p.payment_type, p.payment_method)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "approved" ? "bg-green-100 text-green-700" :
                          p.status === "pending" || p.status === "in_process" ? "bg-amber-100 text-amber-700" :
                          p.status === "rejected" || p.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {formatPaymentStatus(p.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-900/50 transition-opacity"
            onClick={() => !actionLoading && setShowCancelModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="size-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cancelar assinatura?
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Tem certeza que deseja cancelar sua assinatura do plano KidsPC?
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• Você perderá o acesso ao monitoramento remoto</li>
              <li>• Seus dispositivos não poderão ser controlados</li>
              <li>• O acesso continua até o fim do período atual</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Manter assinatura
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition"
              >
                {actionLoading ? "Cancelando..." : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
