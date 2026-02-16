"use client";

import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";

function Banner({ icon, title, description, buttonText, buttonHref, variant }: {
  icon: string;
  title: string;
  description: React.ReactNode;
  buttonText: string;
  buttonHref: string;
  variant: "info" | "warning" | "danger";
}) {
  const colors = variant === "danger"
    ? "border-red-200 bg-red-50 text-red-800"
    : variant === "info"
    ? "border-[#DAE5FF] bg-[#EDF2FF]/60 text-slate-700"
    : "border-amber-200 bg-amber-50 text-amber-800";
  const btnColors = variant === "danger"
    ? "bg-red-600 hover:bg-red-500 shadow-red-600/10"
    : variant === "info"
    ? "bg-[#4A7AFF] hover:bg-[#3A6AEF] shadow-[#4A7AFF]/10"
    : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/10";

  return (
    <div className={`rounded-xl border ${colors} p-4`}>
      <div className="flex items-center gap-3">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-sm opacity-80">{description}</p>
        </div>
        <Link
          href={buttonHref}
          className={`shrink-0 rounded-lg ${btnColors} px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentBanner() {
  const { isActive, isInGracePeriod, isPastDue, daysUntilBlock, hasAccess, subscription } = useSubscription();

  if (isActive && !isPastDue) return null;

  if (!subscription || subscription.status === "inactive") {
    return (
      <Banner
        icon="�"
        title="Assine para liberar o controle remoto"
        description="Com a assinatura você acompanha e gerencia os dispositivos do seu filho."
        buttonText="Ver planos"
        buttonHref="/pricing"
        variant="info"
      />
    );
  }

  if (isPastDue) {
    return (
      <Banner
        icon="⚠️"
        title="Pagamento pendente"
        description={<>Seu pagamento falhou.{daysUntilBlock !== null && <strong> Bloqueio em {daysUntilBlock}d.</strong>}</>}
        buttonText="Atualizar"
        buttonHref="/pricing"
        variant="danger"
      />
    );
  }

  if (isInGracePeriod) {
    return (
      <Banner
        icon="⏳"
        title="Assinatura expirada"
        description={<>Renove para continuar usando.{daysUntilBlock !== null && <strong> Desativação em {daysUntilBlock}d.</strong>}</>}
        buttonText="Renovar"
        buttonHref="/pricing"
        variant="warning"
      />
    );
  }

  if (!hasAccess) {
    return (
      <Banner
        icon="🚫"
        title="Acesso bloqueado"
        description="Sua assinatura expirou há mais de 7 dias. Renove para restaurar o controle."
        buttonText="Renovar agora"
        buttonHref="/pricing"
        variant="danger"
      />
    );
  }

  return null;
}
