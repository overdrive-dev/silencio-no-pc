import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ClockIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BoltIcon,
  NoSymbolIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import FaqSection from "@/components/landing/faq-section";
import { StepsScene } from "@/components/landing/parallax-illustrations";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Rápido e simples — só nome e e-mail. Você já pode configurar tudo pelo navegador.",
    icon: ShieldCheckIcon,
    color: "bg-[#4A7AFF]",
  },
  {
    number: "02",
    title: "Instale no computador do seu filho",
    description: "Baixe o app, abra no computador da criança e vincule com o código que aparece na tela.",
    icon: BoltIcon,
    color: "bg-[#FF6B6B]",
  },
  {
    number: "03",
    title: "Tudo pronto!",
    description: "Acompanhe o uso, ajuste os limites e veja seu filho desenvolvendo uma rotina mais equilibrada.",
    icon: GlobeAltIcon,
    color: "bg-[#51CF66]",
  },
];

const testimonials = [
  {
    body: "Agora meu filho tem uma rotina certinha. Ele já sabe que tem um tempo pra jogar e quando acaba, vai fazer outra coisa naturalmente. A noite ficou muito mais tranquila.",
    author: { name: "Carla M.", role: "Mãe de 2 filhos" },
    accent: "bg-[#EDF2FF] text-[#4A7AFF]",
  },
  {
    body: "O sensor de barulho fez meu filho aprender a controlar o volume sozinho. Hoje ele joga de boa, sem incomodar ninguém. Foi uma mudança gradual e bem natural.",
    author: { name: "Ricardo S.", role: "Pai de 2 filhos" },
    accent: "bg-[#FFE0E0] text-[#FF6B6B]",
  },
  {
    body: "Consigo acompanhar tudo pelo celular e ajustar quando preciso. Às vezes libero mais um tempinho como incentivo. Meu filho entende as regras e a convivência melhorou muito.",
    author: { name: "Fernanda L.", role: "Mãe de 3 filhos" },
    accent: "bg-[#D6F5E0] text-[#51CF66]",
  },
];

const planFeatures = [
  "Funciona em até 2 computadores",
  "Limite de tempo diário e horários",
  "Sensor de barulho inteligente",
  "Bloqueio de jogos, apps e sites",
  "Acompanhamento pelo celular ou navegador",
  "Relatório de uso diário",
  "Atualizações automáticas incluídas",
];

export default function Home() {
  return (
    <div className="bg-background overflow-hidden">
      {/* ── Hero — Centered ── */}
      <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 rounded-full bg-[#EDF2FF] px-4 py-1.5 text-sm font-medium text-[#4A7AFF] mb-8">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4A7AFF] opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-[#4A7AFF]" />
            </span>
            v2.1.0 — Bloqueio de apps &amp; sites
          </div>

          <h1 className="animate-fade-in-up delay-1 font-display text-4xl tracking-tight text-[#1a1a2e] sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1]">
            Controle inteligente para
            <br />
            o computador do seu filho
          </h1>
          <p className="animate-fade-in-up delay-2 mt-6 text-lg leading-8 text-gray-500 max-w-2xl mx-auto">
            Limite de tempo, controle de barulho e acompanhamento em tempo real.
            Tudo pelo celular — e sem complicação.
          </p>

          <div className="animate-fade-in-up delay-3 mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-pill btn-pill-primary">
                  Começar agora — R$&nbsp;19,90/mês
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </SignUpButton>
              <a href="#features" className="btn-pill btn-pill-outline">
                Conhecer mais
              </a>
            </SignedOut>
            <SignedIn>
              <Link href="/dispositivos" className="btn-pill btn-pill-primary">
                Meu painel
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/download" className="btn-pill btn-pill-outline flex items-center gap-2">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar o app
              </Link>
            </SignedIn>
          </div>

          {/* Platform availability bar */}
          <div className="animate-fade-in-up delay-4 mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/download" className="flex items-center gap-2.5 rounded-xl bg-white border border-[#DAE5FF] shadow-sm px-4 py-2.5 hover:shadow-md hover:border-[#4A7AFF]/40 transition-all group">
              <svg className="size-5 text-[#4A7AFF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#1a1a2e] leading-tight">Windows</span>
                <span className="text-[10px] text-[#4A7AFF] font-medium">Baixar agora</span>
              </div>
              <svg className="size-4 text-[#4A7AFF] opacity-50 group-hover:opacity-100 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </Link>
            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 opacity-60">
              <svg className="size-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2.237a.625.625 0 0 0-.886 0L14.87 3.993a8.628 8.628 0 0 0-5.746 0L7.363 2.237a.625.625 0 1 0-.886.886l1.5 1.5A8.57 8.57 0 0 0 3.5 11.5v.5h17v-.5a8.57 8.57 0 0 0-4.477-6.877l1.5-1.5a.625.625 0 0 0 0-.886ZM8.75 9.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm6.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM3.5 13v5.5A3.5 3.5 0 0 0 7 22h10a3.5 3.5 0 0 0 3.5-3.5V13h-17Z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-400 leading-tight">Android</span>
                <span className="text-[10px] text-gray-400 font-medium">Em breve</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 opacity-60">
              <svg className="size-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17.02 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.75 5.74 12.55 5.74C13.33 5.74 14.77 4.62 16.35 4.8C17.02 4.83 18.77 5.07 19.87 6.72C19.78 6.78 17.5 8.12 17.53 10.88C17.56 14.19 20.43 15.28 20.47 15.3C20.44 15.39 19.99 16.93 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-400 leading-tight">Apple</span>
                <span className="text-[10px] text-gray-400 font-medium">Em breve</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid — Feature Showcase ── */}
      <section id="features" className="pb-20 sm:pb-28 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in-up delay-5">
            {/* ── Large card: Photo + floating UI ── */}
            <div className="lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[420px]">
              {/* Background photo */}
              <Image
                src="/images/hero-child-2.jpg"
                alt="Criança usando o computador com o KidsPC"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />

              {/* Dashboard card overlay */}
              <div className="relative z-10 p-5 sm:p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#e8e0d8] px-4 py-3 max-w-[260px]">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#EDF2FF]">
                      <svg className="size-4 text-[#4A7AFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1a1a2e] leading-tight">PC da Maria</p>
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[#51CF66]" />
                        <span className="text-[10px] text-gray-400">Online agora</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Tempo usado</span>
                      <span className="font-semibold text-[#1a1a2e]">1h 24min / 2h</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EDF2FF] overflow-hidden">
                      <div className="h-full rounded-full bg-[#4A7AFF]" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right card: Feature highlight ── */}
            <div className="lg:col-span-2 rounded-3xl bg-[#1a1a2e] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl text-white leading-snug">
                  Acompanhe tudo em tempo real
                </h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  Veja o uso do computador, controle apps e sites, e ajuste limites — de qualquer lugar.
                </p>
              </div>

              {/* Mini stats card */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="size-4 text-[#4A7AFF]" />
                  <span className="text-xs font-semibold text-white">Tempo de tela da semana</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-display text-white">8h 30m</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Total da semana</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display text-[#4A7AFF]">1h 13m</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Média por dia</p>
                  </div>
                </div>
                <div className="mt-4 flex items-end gap-2" style={{ height: 56 }}>
                  {[{ h: 40, label: "S" }, { h: 65, label: "T" }, { h: 55, label: "Q" }, { h: 80, label: "Q" }, { h: 45, label: "S" }, { h: 70, label: "S" }, { h: 30, label: "D" }].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full rounded-md bg-[#4A7AFF]"
                        style={{ height: `${bar.h}%` }}
                      />
                      <span className="text-[10px] text-gray-500 font-medium">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating badges row ── */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-5">
            <div className="card-flat px-4 py-3.5 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFE0E0]">
                <SpeakerWaveIcon className="size-4 text-[#FF6B6B]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1a1a2e]">Volume alto</p>
                <p className="text-[10px] text-gray-400">Aviso enviado</p>
              </div>
            </div>
            <div className="card-flat px-4 py-3.5 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#D6F5E0]">
                <ClockIcon className="size-4 text-[#51CF66]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1a1a2e]">Tempo restante</p>
                <p className="text-[10px] text-[#51CF66] font-medium">36 min</p>
              </div>
            </div>
            <div className="card-flat px-4 py-3.5 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F3E8FF]">
                <NoSymbolIcon className="size-4 text-[#9775FA]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1a1a2e]">App bloqueado</p>
                <p className="text-[10px] text-gray-400">Discord</p>
              </div>
            </div>
            <div className="card-flat px-4 py-3.5 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D6]">
                <CalendarDaysIcon className="size-4 text-[#FFA94D]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1a1a2e]">Horário ativo</p>
                <p className="text-[10px] text-gray-400">14h — 18h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 bg-[#EDF2FF]/40 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#FF6B6B]">Simples de configurar</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
                Pronto em 3 passos
              </h2>
              <p className="mt-4 text-base text-gray-500 max-w-md">
                Não precisa entender de tecnologia. Em menos de 5 minutos tudo está funcionando.
              </p>

              <div className="mt-10 space-y-8">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-5">
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${step.color} text-white text-sm font-bold shadow-lg`}>
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#1a1a2e]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Giant tilted phone with floating cards — 7 cols */}
            <div className="lg:col-span-7 hidden lg:flex items-center justify-center">
              <StepsScene className="w-full max-w-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#4A7AFF]">Famílias reais</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
              Rotinas mais leves, crianças mais felizes
            </h2>
          </div>

          <div className="mx-auto mt-14 max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-flat p-7 flex flex-col">
                <div className="flex gap-1 text-[#FFA94D] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-[#F0EBE5] pt-5">
                  <div className={`flex size-10 items-center justify-center rounded-full ${testimonial.accent} text-sm font-bold`}>
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{testimonial.author.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28 bg-[#EDF2FF]/40 relative">
        <div className="relative mx-auto max-w-lg px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#FF6B6B]">Quanto custa</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
              Um preço justo, sem pegadinha
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Tudo incluso num único plano. Cancele quando quiser, sem multa.
            </p>
          </div>

          <div className="card-flat p-8 relative">
            <div className="absolute top-0 right-0 w-28 h-28 blob-blue opacity-30" />
            <div className="relative">
              <div className="text-center mb-8">
                <div className="text-5xl font-display text-[#1a1a2e]">
                  R$&nbsp;19,90
                  <span className="text-lg text-gray-400 font-sans font-normal">/mês</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Tudo incluso, sem surpresas</p>
              </div>

              <ul className="space-y-3 mb-8">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="size-5 text-[#4A7AFF] shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <SignUpButton mode="modal">
                <button className="btn-pill btn-pill-primary w-full justify-center">
                  Começar agora
                </button>
              </SignUpButton>

              <p className="text-center text-xs text-gray-400 mt-4">
                Pagamento seguro pelo Mercado Pago. Cancele a qualquer momento, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Final CTA ── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-10 -left-10 w-48 h-48 blob-yellow opacity-30" />
        <div className="absolute bottom-10 right-10 w-40 h-40 blob-blue opacity-30" />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-5xl">
              Uma casa mais tranquila começa aqui
            </h2>
            <p className="mt-5 text-lg text-gray-500 max-w-lg mx-auto">
              Seu filho com uma rotina mais organizada, usando o computador de forma saudável.
              E você acompanhando tudo com facilidade.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="btn-pill btn-pill-primary text-base px-8 py-4">
                    Quero começar agora — R$&nbsp;19,90/mês
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="btn-pill btn-pill-outline">
                    Já tenho conta
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dispositivos" className="btn-pill btn-pill-primary text-base px-8 py-4">
                  Meu painel
                </Link>
                <Link href="/download" className="btn-pill btn-pill-outline flex items-center gap-2">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar o app
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
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
          <div className="flex gap-6 text-sm text-gray-400 flex-wrap justify-center sm:justify-end">
            <a href="#features" className="hover:text-[#4A7AFF] transition">Funcionalidades</a>
            <a href="#pricing" className="hover:text-[#4A7AFF] transition">Preços</a>
            <a href="/dicas-atividades" className="hover:text-[#4A7AFF] transition">Dicas de Atividades</a>
            <a href="/sobre" className="hover:text-[#4A7AFF] transition">Sobre</a>
            <a href="/politica-privacidade" className="hover:text-[#4A7AFF] transition">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
