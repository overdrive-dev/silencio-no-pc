import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
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
import { HeroScene, StepsScene } from "@/components/landing/parallax-illustrations";

const features = [
  {
    name: "Limite de Tempo sem Briga",
    description:
      "Você define quanto tempo seu filho pode usar o computador por dia. Quando acabar, a tela bloqueia sozinha — sem discussão, sem estresse.",
    icon: ClockIcon,
    color: "bg-[#EDF2FF] text-[#4A7AFF]",
  },
  {
    name: "Quando Gritaria é Demais",
    description:
      "Sabe quando seu filho grita jogando e incomoda a casa toda? O KidsPC percebe o barulho e avisa. Se continuar, perde tempo de tela. Ele aprende sozinho a se controlar.",
    icon: SpeakerWaveIcon,
    color: "bg-[#FFE0E0] text-[#FF6B6B]",
  },
  {
    name: "Controle pelo Celular",
    description:
      "Não precisa ir até o computador. Do seu celular, você libera mais tempo, bloqueia a tela ou vê o que está acontecendo — esteja onde estiver.",
    icon: GlobeAltIcon,
    color: "bg-[#D6F5E0] text-[#51CF66]",
  },
  {
    name: "Horários Certos",
    description:
      "Computador só funciona nos horários que você escolher. À noite, fim de semana, hora de estudar — você decide e o KidsPC cuida do resto.",
    icon: CalendarDaysIcon,
    color: "bg-[#FFF3D6] text-[#FFA94D]",
  },
  {
    name: "Bloqueio de Apps & Sites",
    description:
      "Escolha quais jogos, apps e sites seu filho pode acessar. Bloqueie o que não é adequado e fique tranquilo.",
    icon: NoSymbolIcon,
    badge: "Novo",
    color: "bg-[#F3E8FF] text-[#9775FA]",
  },
  {
    name: "Criança Não Desliga",
    description:
      "Seu filho não consegue fechar o programa, mudar as regras ou desinstalar. Tudo é protegido por uma senha que só você sabe.",
    icon: LockClosedIcon,
    color: "bg-[#EDF2FF] text-[#4A7AFF]",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "É rapidinho — só nome e e-mail. Não precisa instalar nada no seu celular.",
    icon: ShieldCheckIcon,
    color: "bg-[#4A7AFF]",
  },
  {
    number: "02",
    title: "Instale no computador do seu filho",
    description: "Baixe um arquivo, abra no computador da criança e digite o código que aparece na tela. Pronto!",
    icon: BoltIcon,
    color: "bg-[#FF6B6B]",
  },
  {
    number: "03",
    title: "Pronto! Agora é com você",
    description: "Pelo celular ou computador, acompanhe o uso, ajuste os limites e tenha mais tranquilidade no dia a dia.",
    icon: GlobeAltIcon,
    color: "bg-[#51CF66]",
  },
];

const testimonials = [
  {
    body: "Meu filho ficava no computador até de madrugada e eu não sabia como resolver. Agora defino o horário e o limite de tempo — quando acaba, a tela desliga sozinha. Acabaram as brigas na hora de dormir.",
    author: { name: "Carla M.", role: "Mãe de 2 filhos" },
    accent: "bg-[#EDF2FF] text-[#4A7AFF]",
  },
  {
    body: "A parte do barulho mudou a nossa rotina. Meu filho gritava jogando e acordava o bebê. Depois que começou a perder tempo de tela por gritar, ele mesmo aprendeu a falar mais baixo. Eu nem preciso ficar brigando.",
    author: { name: "Ricardo S.", role: "Pai de 2 filhos" },
    accent: "bg-[#FFE0E0] text-[#FF6B6B]",
  },
  {
    body: "Quando meu filho se comporta bem, libero mais uns minutinhos pelo celular. Ele adora e eu uso como incentivo. E na hora do jantar, bloqueio a tela de onde eu estiver. É muito prático.",
    author: { name: "Fernanda L.", role: "Mãe de 3 filhos" },
    accent: "bg-[#D6F5E0] text-[#51CF66]",
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
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
            {/* Text — 5 cols */}
            <div className="lg:col-span-5 relative z-10">
              <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 rounded-full bg-[#EDF2FF] px-4 py-1.5 text-sm font-medium text-[#4A7AFF] mb-8">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4A7AFF] opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#4A7AFF]" />
                </span>
                v2.1.0 — Bloqueio de apps &amp; sites
              </div>

              <h1 className="animate-fade-in-up delay-1 font-display text-4xl tracking-tight text-[#1a1a2e] sm:text-5xl lg:text-6xl leading-[1.1]">
                Menos tela,
                <br />
                <span className="text-[#4A7AFF]">mais infância</span>
              </h1>
              <p className="animate-fade-in-up delay-2 mt-6 text-lg leading-8 text-gray-500 max-w-lg">
                Seu filho passa tempo demais no computador e você não sabe como controlar?
                O KidsPC limita o tempo de tela, avisa quando tem barulho demais e você
                gerencia tudo pelo celular.
              </p>

              <div className="animate-fade-in-up delay-3 mt-10 flex items-center gap-4 flex-wrap">
                <SignUpButton mode="modal">
                  <button className="btn-pill btn-pill-primary">
                    Quero experimentar
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </SignUpButton>
                <a href="#features" className="btn-pill btn-pill-outline">
                  Como funciona?
                </a>
              </div>

              <div className="animate-fade-in-up delay-4 mt-10 flex items-center gap-x-6 gap-y-2 flex-wrap text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="size-4 text-[#4A7AFF]" />
                  <span>Até 2 dispositivos</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="size-4 text-[#4A7AFF]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 5.548l7.065-0.966v6.829H3V5.548zm0 12.904l7.065 0.966v-6.829H3v5.863zM11.065 4.38L22 2.75v8.661h-10.935V4.38zm0 15.24L22 21.25v-8.661h-10.935v7.031z" />
                  </svg>
                  <span>Windows 10/11</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#D6F5E0] px-3 py-1">
                  <span className="text-[#51CF66] font-medium text-xs">Android em breve</span>
                </div>
              </div>
            </div>

            {/* Illustration — 7 cols, boxed container */}
            <div className="lg:col-span-7 hidden lg:block relative animate-fade-in-up delay-2">
              <HeroScene className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#4A7AFF]">O que o KidsPC faz</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
              Tudo que você precisa pra ficar tranquilo
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Você não precisa entender de tecnologia. O KidsPC cuida de tudo — você só escolhe as regras.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="card-flat p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="size-5" />
                  </div>
                  {"badge" in feature && feature.badge && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4A7AFF] text-white">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-2">{feature.name}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 bg-[#EDF2FF]/40 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#FF6B6B]">Super fácil</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
                Funciona em 3 passinhos
              </h2>
              <p className="mt-4 text-base text-gray-500 max-w-md">
                Mesmo que você não manje de tecnologia, você consegue. Leva menos de 5 minutos.
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
              Pais que já recuperaram a paz em casa
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
                  Quero experimentar
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
              Que tal menos briga e mais tranquilidade?
            </h2>
            <p className="mt-5 text-lg text-gray-500 max-w-lg mx-auto">
              Você merece não precisar gritar pra seu filho sair do computador.
              Comece agora e sinta a diferença já no primeiro dia.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
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
