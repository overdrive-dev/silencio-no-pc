import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ClockIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BoltIcon,
  NoSymbolIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import FaqSection from "@/components/landing/faq-section";
import HeroScene from "@/components/landing/hero-scene";

const features = [
  {
    name: "Controle de Tempo",
    description:
      "Defina limites diários de uso por dispositivo. Avisos automáticos aos 15 e 5 minutos restantes. Bloqueio total quando o tempo acabar.",
    icon: ClockIcon,
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  {
    name: "Monitor de Barulho",
    description:
      "Detecta barulho excessivo pelo microfone. Sistema de strikes com avisos visuais e penalidades de tempo configuráveis.",
    icon: SpeakerWaveIcon,
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    name: "Painel Remoto",
    description:
      "Adicione tempo, bloqueie a tela, reinicie strikes e controle o dispositivo remotamente — do celular ou de qualquer navegador.",
    icon: GlobeAltIcon,
    gradient: "from-violet-500/20 to-cyan-600/5",
  },
  {
    name: "Horários Personalizados",
    description:
      "Configure horários permitidos para cada dia da semana. Fora do horário, o dispositivo bloqueia automaticamente.",
    icon: CalendarDaysIcon,
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    name: "Bloqueio de Apps & Sites",
    description:
      "Bloqueie aplicativos e sites específicos ou permita apenas os aprovados. Regras sincronizadas remotamente.",
    icon: NoSymbolIcon,
    badge: "Novo",
    gradient: "from-rose-500/20 to-rose-600/5",
  },
  {
    name: "Proteção por Senha",
    description:
      "Todas as ações sensíveis exigem senha. Configurações, adicionar tempo e fechar o app são protegidos.",
    icon: LockClosedIcon,
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Registre-se gratuitamente no painel web em segundos.",
    icon: ShieldCheckIcon,
  },
  {
    number: "02",
    title: "Instale no dispositivo",
    description: "Baixe o instalador, rode no PC da criança e insira o código de pareamento.",
    icon: BoltIcon,
  },
  {
    number: "03",
    title: "Controle de qualquer lugar",
    description: "Monitore o uso, ajuste limites e envie comandos direto do seu celular.",
    icon: GlobeAltIcon,
  },
];

const testimonials = [
  {
    body: "Meu filho ficava no PC até 3h da manhã. Com o KidsPC, defini o limite de 2h por dia e horário até 22h. Agora ele dorme cedo e reclama menos porque sabe que é automático.",
    author: { name: "Carla M.", role: "Mãe de 2 filhos" },
  },
  {
    body: "O monitor de barulho é genial. Meu filho gritava jogando online e incomodava a casa toda. Depois de perder tempo por causa dos strikes, ele aprendeu a controlar o volume sozinho.",
    author: { name: "Ricardo S.", role: "Pai de 1 filho" },
  },
  {
    body: "Adoro poder adicionar tempo extra pelo celular quando ele se comporta bem. É como uma recompensa instantânea. E se precisa desligar pra jantar, bloqueio remotamente.",
    author: { name: "Fernanda L.", role: "Mãe de 3 filhos" },
  },
];

const planFeatures = [
  "Até 2 dispositivos inclusos",
  "Controle de tempo e horários",
  "Monitor de barulho com strikes",
  "Bloqueio de apps e sites",
  "Comandos remotos em tempo real",
  "Histórico completo de uso",
  "Atualizações automáticas",
];

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dispositivos");
  }

  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden min-h-[90vh] flex items-center bg-grain">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <HeroScene />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 sm:py-40 text-center">
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 rounded-full bg-white/[0.06] backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-violet-300 border border-white/[0.08] mb-10">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
            </span>
            v2.1.0 — Bloqueio de apps &amp; sites
          </div>

          <h1 className="animate-fade-in-up delay-1 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95]">
            Controle parental
            <br />
            <span className="text-gradient">inteligente</span>
          </h1>
          <p className="animate-fade-in-up delay-2 mt-8 text-lg leading-8 text-zinc-400 max-w-2xl mx-auto sm:text-xl">
            Limite tempo de tela, monitore barulho e gerencie os dispositivos do seu filho
            remotamente. Sem complicação, sem briga.
          </p>

          <div className="animate-fade-in-up delay-3 mt-12 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="group relative rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30">
                Começar agora — R$&nbsp;19,90/mês
                <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </SignUpButton>
            <a
              href="#features"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-zinc-300 border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all"
            >
              Ver funcionalidades
            </a>
          </div>

          <div className="animate-fade-in-up delay-4 mt-16 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-violet-400" />
              <span>Até 2 dispositivos</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
              </svg>
              <span>Windows 10/11</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="size-4 text-zinc-500" />
              <span>Auto-update</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1">
              <span className="text-cyan-400 font-medium text-xs">Android em breve</span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Features — Bento Grid ── */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-400">Funcionalidades</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tudo que você precisa
            </p>
            <p className="mt-4 text-lg text-zinc-400">
              Do controle de tempo ao bloqueio de apps — tudo gerenciável remotamente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7 hover:bg-white/[0.06] hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] group-hover:border-violet-500/20 transition">
                      <feature.icon className="size-5 text-violet-400" />
                    </div>
                    {"badge" in feature && feature.badge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.06),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold tracking-widest uppercase text-cyan-400">Simples de configurar</p>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Funcionando em
                <br />3 passos
              </p>
              <p className="mt-4 text-base text-zinc-400">
                Do cadastro ao controle total em menos de 5 minutos.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent" />

              <div className="space-y-10">
                {steps.map((step) => (
                  <div key={step.number} className="relative flex gap-6">
                    <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface border border-white/[0.08]">
                      <step.icon className="size-5 text-violet-400" />
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-bold text-violet-400 tracking-widest uppercase">
                        Passo {step.number}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-400">Depoimentos</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              O que os pais dizem
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7 hover:border-violet-500/20 transition-all duration-300"
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-zinc-300">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.author.name}</p>
                    <p className="text-xs text-zinc-500">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(6,182,212,0.08),transparent)]" />
        <div className="relative mx-auto max-w-lg px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-cyan-400">Preços</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simples e transparente
            </p>
            <p className="mt-4 text-lg text-zinc-400">
              Um plano completo. Sem surpresas.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8 glow-violet relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="text-center mb-8">
                <div className="text-5xl font-display font-bold text-white">
                  R$&nbsp;19,90
                  <span className="text-lg text-zinc-500 font-normal">/mês</span>
                </div>
                <p className="text-sm text-zinc-400 mt-2">Plano Completo</p>
              </div>

              <ul className="space-y-3 mb-8">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="size-5 text-violet-400 shrink-0" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <SignUpButton mode="modal">
                <button className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all hover:shadow-xl hover:shadow-violet-500/30">
                  Começar agora
                </button>
              </SignUpButton>

              <p className="text-center text-xs text-zinc-500 mt-4">
                Pagamentos via Mercado Pago. Cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Final CTA ── */}
      <section className="relative isolate py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(139,92,246,0.12),transparent)]" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pronto para ter paz em casa?
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Crie sua conta em segundos e comece a gerenciar os dispositivos do seu filho hoje.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Começar agora — R$&nbsp;19,90/mês
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-xl px-8 py-3.5 text-sm font-semibold text-zinc-300 border border-white/[0.1] hover:border-white/[0.2] hover:text-white transition-all">
                Já tenho conta
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/20">
              <svg className="size-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-300">KidsPC</span>
            <span className="text-sm text-zinc-600">&middot; Controle parental inteligente</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-zinc-300 transition">Funcionalidades</a>
            <a href="#testimonials" className="hover:text-zinc-300 transition">Depoimentos</a>
            <a href="#pricing" className="hover:text-zinc-300 transition">Preços</a>
            <a href="#faq" className="hover:text-zinc-300 transition">FAQ</a>
            <a href="/politica-privacidade" className="hover:text-zinc-300 transition">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
