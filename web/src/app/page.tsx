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
    name: "Limite de Tempo sem Briga",
    description:
      "Você define quanto tempo seu filho pode usar o computador por dia. Quando acabar, a tela bloqueia sozinha — sem discussão, sem estresse.",
    icon: ClockIcon,
    color: "bg-violet-100 text-violet-600",
    border: "hover:border-violet-300",
  },
  {
    name: "Quando Gritaria é Demais",
    description:
      "Sabe quando seu filho grita jogando e incomoda a casa toda? O KidsPC percebe o barulho e avisa. Se continuar, perde tempo de tela. Ele aprende sozinho a se controlar.",
    icon: SpeakerWaveIcon,
    color: "bg-pink-100 text-pink-600",
    border: "hover:border-pink-300",
  },
  {
    name: "Controle pelo Celular",
    description:
      "Não precisa ir até o computador. Do seu celular, você libera mais tempo, bloqueia a tela ou vê o que está acontecendo — esteja onde estiver.",
    icon: GlobeAltIcon,
    color: "bg-cyan-100 text-cyan-600",
    border: "hover:border-cyan-300",
  },
  {
    name: "Horários Certos",
    description:
      "Computador só funciona nos horários que você escolher. À noite, fim de semana, hora de estudar — você decide e o KidsPC cuida do resto.",
    icon: CalendarDaysIcon,
    color: "bg-amber-100 text-amber-600",
    border: "hover:border-amber-300",
  },
  {
    name: "Bloqueio de Apps & Sites",
    description:
      "Escolha quais jogos, apps e sites seu filho pode acessar. Bloqueie o que não é adequado e fique tranquilo.",
    icon: NoSymbolIcon,
    badge: "Novo",
    color: "bg-rose-100 text-rose-600",
    border: "hover:border-rose-300",
  },
  {
    name: "Criança Não Desliga",
    description:
      "Seu filho não consegue fechar o programa, mudar as regras ou desinstalar. Tudo é protegido por uma senha que só você sabe.",
    icon: LockClosedIcon,
    color: "bg-emerald-100 text-emerald-600",
    border: "hover:border-emerald-300",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "É rapidinho — só nome e e-mail. Não precisa instalar nada no seu celular.",
    icon: ShieldCheckIcon,
    color: "from-violet-500 to-purple-600",
  },
  {
    number: "02",
    title: "Instale no computador do seu filho",
    description: "Baixe um arquivo, abra no computador da criança e digite o código que aparece na tela. Pronto!",
    icon: BoltIcon,
    color: "from-pink-500 to-rose-600",
  },
  {
    number: "03",
    title: "Pronto! Agora é com você",
    description: "Pelo celular ou computador, acompanhe o uso, ajuste os limites e tenha mais tranquilidade no dia a dia.",
    icon: GlobeAltIcon,
    color: "from-cyan-500 to-blue-600",
  },
];

const testimonials = [
  {
    body: "Meu filho ficava no computador até de madrugada e eu não sabia como resolver. Agora defino o horário e o limite de tempo — quando acaba, a tela desliga sozinha. Acabaram as brigas na hora de dormir.",
    author: { name: "Carla M.", role: "Mãe de 2 filhos" },
    accent: "bg-violet-100 text-violet-600",
  },
  {
    body: "A parte do barulho mudou a nossa rotina. Meu filho gritava jogando e acordava o bebê. Depois que começou a perder tempo de tela por gritar, ele mesmo aprendeu a falar mais baixo. Eu nem preciso ficar brigando.",
    author: { name: "Ricardo S.", role: "Pai de 2 filhos" },
    accent: "bg-pink-100 text-pink-600",
  },
  {
    body: "Quando meu filho se comporta bem, libero mais uns minutinhos pelo celular. Ele adora e eu uso como incentivo. E na hora do jantar, bloqueio a tela de onde eu estiver. É muito prático.",
    author: { name: "Fernanda L.", role: "Mãe de 3 filhos" },
    accent: "bg-cyan-100 text-cyan-600",
  },
];

const planFeatures = [
  "Funciona em até 2 computadores",
  "Limite de tempo diário e horários",
  "Aviso e penalidade por barulho",
  "Bloqueio de jogos, apps e sites",
  "Controle pelo celular ou navegador",
  "Veja quanto seu filho usou cada dia",
  "Atualizações automáticas incluídas",
];

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dispositivos");
  }

  return (
    <div className="bg-background overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden min-h-[90vh] flex items-center bg-grain">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <HeroScene />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 sm:py-40 text-center">
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-violet-600 border border-violet-200 shadow-sm mb-10">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
            </span>
            v2.1.0 — Bloqueio de apps &amp; sites
          </div>

          <h1 className="animate-fade-in-up delay-1 font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl lg:text-8xl leading-[0.95]">
            Menos tela,
            <br />
            <span className="text-gradient">mais infância</span>
          </h1>
          <p className="animate-fade-in-up delay-2 mt-8 text-lg leading-8 text-slate-500 max-w-2xl mx-auto sm:text-xl">
            Seu filho passa tempo demais no computador e você não sabe como controlar?
            O KidsPC limita o tempo de tela, avisa quando tem barulho demais e você
            gerencia tudo pelo celular. Sem briga, sem estresse.
          </p>

          <div className="animate-fade-in-up delay-3 mt-12 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="group relative rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
                Quero experimentar — R$&nbsp;19,90/mês
              </button>
            </SignUpButton>
            <a
              href="#features"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-slate-600 border border-slate-300 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              Como funciona?
            </a>
          </div>

          <div className="animate-fade-in-up delay-4 mt-16 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-violet-500" />
              <span>Até 2 dispositivos</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
              </svg>
              <span>Windows 10/11</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="size-4 text-pink-500" />
              <span>Auto-update</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
              <span className="text-emerald-600 font-medium text-xs">Android em breve</span>
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
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-500">O que o KidsPC faz</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tudo que você precisa pra ficar tranquilo
            </p>
            <p className="mt-4 text-lg text-slate-500">
              Você não precisa entender de tecnologia. O KidsPC cuida de tudo — você só escolhe as regras.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className={`group relative rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-lg ${feature.border} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="size-5" />
                  </div>
                  {"badge" in feature && feature.badge && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(236,72,153,0.05),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold tracking-widest uppercase text-pink-500">Super fácil</p>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Funciona em
                <br />3 passinhos
              </p>
              <p className="mt-4 text-base text-slate-500">
                Mesmo que você não manje de tecnologia, você consegue. Leva menos de 5 minutos.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-violet-300 via-pink-300 to-cyan-300" />

              <div className="space-y-10">
                {steps.map((step) => (
                  <div key={step.number} className="relative flex gap-6">
                    <div className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                      <step.icon className="size-5 text-white" />
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                        Passo {step.number}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.description}</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.06),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-500">Famílias reais</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pais que já recuperaram a paz em casa
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className={`flex size-10 items-center justify-center rounded-full ${testimonial.accent} text-sm font-bold`}>
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{testimonial.author.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(236,72,153,0.06),transparent)]" />
        <div className="relative mx-auto max-w-lg px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-pink-500">Quanto custa</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Um preço justo, sem pegadinha
            </p>
            <p className="mt-4 text-lg text-slate-500">
              Tudo incluso num único plano. Cancele quando quiser, sem multa.
            </p>
          </div>

          <div className="card-gradient-border p-8 shadow-xl shadow-violet-500/5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="text-center mb-8">
                <div className="text-5xl font-display font-bold text-slate-900">
                  R$&nbsp;19,90
                  <span className="text-lg text-slate-400 font-normal">/mês</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Tudo incluso, sem surpresas</p>
              </div>

              <ul className="space-y-3 mb-8">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="size-5 text-violet-500 shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <SignUpButton mode="modal">
                <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all">
                  Quero experimentar
                </button>
              </SignUpButton>

              <p className="text-center text-xs text-slate-400 mt-4">
                Pagamento seguro pelo Mercado Pago. Cancele a qualquer momento, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Final CTA ── */}
      <section className="relative isolate py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Que tal menos briga e mais tranquilidade?
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            Você merece não precisar gritar pra seu filho sair do computador.
            Comece agora e sinta a diferença já no primeiro dia.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
                Quero começar agora — R$&nbsp;19,90/mês
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-xl px-8 py-3.5 text-sm font-semibold text-slate-600 border border-slate-300 hover:border-violet-300 hover:text-violet-600 transition-all">
                Já tenho conta
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-12 bg-white/50">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500">
              <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">KidsPC</span>
            <span className="text-sm text-slate-400">&middot; Menos tela, mais infância</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400 flex-wrap justify-center sm:justify-end">
            <a href="#features" className="hover:text-violet-600 transition">Funcionalidades</a>
            <a href="#pricing" className="hover:text-violet-600 transition">Preços</a>
            <a href="/dicas-atividades" className="hover:text-violet-600 transition">Dicas de Atividades</a>
            <a href="/sobre" className="hover:text-violet-600 transition">Sobre</a>
            <a href="/politica-privacidade" className="hover:text-violet-600 transition">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
