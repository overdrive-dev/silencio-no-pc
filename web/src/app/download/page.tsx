"use client";

import { useSubscription } from "@/hooks/use-subscription";
import PaymentBanner from "@/components/payment-banner";
import Link from "next/link";

export default function DownloadPage() {
  const { hasAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Download
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Baixe e instale o KidsPC nos dispositivos do seu filho.
        </p>
      </div>

      <PaymentBanner />

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="rounded-full bg-indigo-100 p-4">
            <svg className="size-12 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              KidsPC — Windows
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Versão 2.0.0 &middot; Windows 10/11 &middot; ~45 MB
            </p>
          </div>

          <a
            href="https://github.com/seu-usuario/kidspc/releases/latest/download/KidsPC_Setup.exe"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <svg className="mr-2 -ml-1 size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Baixar Instalador
          </a>

          {!hasAccess && (
            <p className="text-sm text-amber-600">
              Você precisará de uma assinatura ativa para vincular o app ao painel.{" "}
              <Link href="/pricing" className="underline font-medium">Assinar agora</Link>
            </p>
          )}

          <div className="mt-8 w-full max-w-md text-left space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Como instalar
            </h3>
            <ol className="space-y-3 text-sm text-gray-500">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">1</span>
                <span>Baixe e execute o instalador no dispositivo do seu filho</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">2</span>
                <span>Vá em <strong className="text-gray-700">Dispositivos</strong> e clique em <strong className="text-gray-700">Adicionar Dispositivo</strong> para gerar um código</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">3</span>
                <span>Digite o código no app. Pronto, o dispositivo estará vinculado!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      {/* Mobile — Coming Soon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm opacity-75">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-green-100 p-2.5">
              <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Android</h3>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Em breve
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Controle parental para tablets e celulares Android. Em desenvolvimento.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm opacity-75">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-blue-100 p-2.5">
              <svg className="size-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">iOS (iPhone/iPad)</h3>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Em breve
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Controle parental para iPhones e iPads. Em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
}
