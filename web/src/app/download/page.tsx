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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(6,182,212,0.1),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-cyan-400 mb-3">Download</p>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white sm:text-5xl">
            Instale o KidsPC
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Baixe e instale nos dispositivos do seu filho.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-6">
        {/* Windows download card */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full" />
          <div className="relative flex flex-col items-center text-center space-y-6">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
              <svg className="size-8 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-white">
                KidsPC — Windows
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Windows 10/11 &middot; ~45 MB
              </p>
            </div>

            <a
              href="https://github.com/seu-usuario/kidspc/releases/latest/download/KidsPC_Setup.exe"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Baixar Instalador
            </a>

            {!hasAccess && (
              <p className="text-sm text-amber-400">
                Assinatura necessária para vincular.{" "}
                <Link href="/pricing" className="underline font-medium text-violet-400 hover:text-violet-300 transition">Assinar</Link>
              </p>
            )}

            {/* Steps */}
            <div className="w-full max-w-md text-left pt-6 border-t border-white/[0.06]">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Como instalar</h3>
              <ol className="space-y-3 text-sm text-zinc-400">
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-400">1</span>
                  <span>Baixe e execute o instalador no dispositivo do seu filho</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-400">2</span>
                  <span>Vá em <strong className="text-zinc-200">Dispositivos</strong> e clique em <strong className="text-zinc-200">Adicionar</strong> para gerar um código</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-400">3</span>
                  <span>Digite o código no app. Pronto!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Mobile — Coming Soon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <svg className="size-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">Android</h3>
                <span className="text-xs font-medium text-cyan-400">Em breve</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500">
              Controle parental para tablets e celulares Android.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <svg className="size-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">iOS (iPhone/iPad)</h3>
                <span className="text-xs font-medium text-cyan-400">Em breve</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500">
              Controle parental para iPhones e iPads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
