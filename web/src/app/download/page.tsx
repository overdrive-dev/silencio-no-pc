"use client";

import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";

export default function DownloadPage() {
  const { hasAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-zinc-500">
          <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 sm:text-3xl">
          Download
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Baixe e instale o KidsPC nos dispositivos do seu filho.
        </p>
      </div>

      {/* Windows download card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full" />
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 border border-violet-200">
            <svg className="size-8 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              KidsPC — Windows
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Windows 10/11 &middot; ~45 MB
            </p>
          </div>

          <a
            href="https://github.com/seu-usuario/kidspc/releases/latest/download/KidsPC_Setup.exe"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Baixar Instalador
          </a>

          {!hasAccess && (
            <p className="text-sm text-amber-600">
              Assinatura necessária para vincular.{" "}
              <Link href="/pricing" className="underline font-medium text-violet-600 hover:text-violet-500 transition">Assinar</Link>
            </p>
          )}

          {/* Steps */}
          <div className="w-full max-w-md text-left pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Como instalar</h3>
            <ol className="space-y-3 text-sm text-slate-500">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">1</span>
                <span>Baixe e execute o instalador no dispositivo do seu filho</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-xs font-bold text-pink-600">2</span>
                <span>Vá em <strong className="text-slate-700">Dispositivos</strong> e clique em <strong className="text-slate-700">Adicionar</strong> para gerar um código</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-xs font-bold text-cyan-600">3</span>
                <span>Digite o código no app. Pronto!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Mobile — Coming Soon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm opacity-70">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-100">
              <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Android</h3>
              <span className="text-xs font-semibold text-emerald-600">Em breve</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Controle parental para tablets e celulares Android.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm opacity-70">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-blue-100">
              <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">iOS (iPhone/iPad)</h3>
              <span className="text-xs font-semibold text-blue-600">Em breve</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Controle parental para iPhones e iPads.
          </p>
        </div>
      </div>
    </div>
  );
}
