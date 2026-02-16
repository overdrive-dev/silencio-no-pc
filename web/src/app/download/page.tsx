import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

export default function DownloadPage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute top-10 right-0 w-72 h-72 rounded-full bg-[#DAE5FF] opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#FFE0E0] opacity-20 blur-2xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EDF2FF] px-4 py-1.5 text-sm font-medium text-[#4A7AFF] mb-8">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </div>

          <h1 className="font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-5xl leading-[1.1]">
            Instale o KidsPC no<br />
            <span className="text-[#4A7AFF]">computador do seu filho</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto">
            Baixe o instalador, vincule com sua conta e pronto. Leva menos de 5 minutos.
          </p>
        </div>
      </section>

      {/* ── Platform cards ── */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Windows — available */}
            <div className="relative rounded-2xl border-2 border-[#4A7AFF]/30 bg-white p-8 shadow-lg shadow-[#4A7AFF]/5 flex flex-col items-center text-center">
              <div className="absolute -top-3 right-4 rounded-full bg-[#4A7AFF] px-3 py-0.5 text-[11px] font-bold text-white">
                Disponível
              </div>
              <div className="flex items-center justify-center size-16 rounded-2xl bg-[#EDF2FF] border border-[#DAE5FF] mb-5">
                <svg className="size-8 text-[#4A7AFF]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
                </svg>
              </div>
              <h2 className="text-lg font-display font-bold text-[#1a1a2e] mb-1">Windows</h2>
              <p className="text-sm text-gray-400 mb-6">Windows 10/11 &middot; ~45 MB</p>
              <a
                href="https://github.com/overdrive-dev/silencio-no-pc/releases/latest/download/KidsPC_Setup.exe"
                className="btn-pill btn-pill-primary w-full justify-center"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Baixar instalador
              </a>
            </div>

            {/* Android — coming soon */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 flex flex-col items-center text-center opacity-60">
              <div className="flex items-center justify-center size-16 rounded-2xl bg-gray-100 border border-gray-200 mb-5">
                <svg className="size-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.237a.625.625 0 0 0-.886 0L14.87 3.993a8.628 8.628 0 0 0-5.746 0L7.363 2.237a.625.625 0 1 0-.886.886l1.5 1.5A8.57 8.57 0 0 0 3.5 11.5v.5h17v-.5a8.57 8.57 0 0 0-4.477-6.877l1.5-1.5a.625.625 0 0 0 0-.886ZM8.75 9.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm6.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM3.5 13v5.5A3.5 3.5 0 0 0 7 22h10a3.5 3.5 0 0 0 3.5-3.5V13h-17Z" />
                </svg>
              </div>
              <h2 className="text-lg font-display font-bold text-gray-400 mb-1">Android</h2>
              <p className="text-sm text-gray-400 mb-6">Tablets e celulares</p>
              <div className="rounded-full bg-gray-100 border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-400 w-full">
                Em breve
              </div>
            </div>

            {/* Apple — coming soon */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 flex flex-col items-center text-center opacity-60">
              <div className="flex items-center justify-center size-16 rounded-2xl bg-gray-100 border border-gray-200 mb-5">
                <svg className="size-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17.02 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.75 5.74 12.55 5.74C13.33 5.74 14.77 4.62 16.35 4.8C17.02 4.83 18.77 5.07 19.87 6.72C19.78 6.78 17.5 8.12 17.53 10.88C17.56 14.19 20.43 15.28 20.47 15.3C20.44 15.39 19.99 16.93 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
              </div>
              <h2 className="text-lg font-display font-bold text-gray-400 mb-1">Apple</h2>
              <p className="text-sm text-gray-400 mb-6">iPhone, iPad e Mac</p>
              <div className="rounded-full bg-gray-100 border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-400 w-full">
                Em breve
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How to install ── */}
      <section className="py-16 sm:py-24 bg-[#EDF2FF]/40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-2xl tracking-tight text-[#1a1a2e] sm:text-3xl">
              Como instalar
            </h2>
            <p className="mt-3 text-gray-500">
              3 passos simples. Não precisa entender de tecnologia.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-5 items-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#4A7AFF] text-white text-sm font-bold shadow-lg">
                01
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex-1">
                <h3 className="font-semibold text-[#1a1a2e] mb-1">Baixe o instalador</h3>
                <p className="text-sm text-gray-500">
                  Clique no botão acima para baixar o arquivo <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">KidsPC_Setup.exe</code>. Execute no computador da criança.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FF6B6B] text-white text-sm font-bold shadow-lg">
                02
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex-1">
                <h3 className="font-semibold text-[#1a1a2e] mb-1">Gere um código de vinculação</h3>
                <p className="text-sm text-gray-500">
                  Acesse seu <Link href="/dispositivos" className="text-[#4A7AFF] font-medium hover:underline">painel de dispositivos</Link>, clique em <strong>Adicionar</strong> e copie o código de 6 dígitos.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#51CF66] text-white text-sm font-bold shadow-lg">
                03
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex-1">
                <h3 className="font-semibold text-[#1a1a2e] mb-1">Cole o código no app</h3>
                <p className="text-sm text-gray-500">
                  No computador do seu filho, o KidsPC vai pedir o código. Digite, confirme e pronto — tudo vinculado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Requirements ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                <svg className="size-5 text-[#4A7AFF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>
                Requisitos do sistema
              </h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Windows 10 ou 11 (64-bit)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Conexão com a internet
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  ~45 MB de espaço em disco
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Conta KidsPC ativa
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                <svg className="size-5 text-[#4A7AFF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                Segurança
              </h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Protegido contra desinstalação
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Atualizações automáticas
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Dados criptografados
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-4 text-[#51CF66] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Senha de proteção exclusiva
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 bg-[#EDF2FF]/40">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-2xl tracking-tight text-[#1a1a2e] sm:text-3xl">
            Ainda não tem conta?
          </h2>
          <p className="mt-3 text-gray-500">
            Crie sua conta em segundos e comece a configurar os limites para o computador do seu filho.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="btn-pill btn-pill-primary">
                Criar conta — R$&nbsp;19,90/mês
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </SignUpButton>
            <Link href="/" className="btn-pill btn-pill-outline">
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer (minimal) ── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-[#4A7AFF]">
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1a1a2e]">KidsPC</span>
          <span className="text-sm text-gray-400">&middot; Menos tela, mais infância</span>
        </div>
      </footer>
    </div>
  );
}
