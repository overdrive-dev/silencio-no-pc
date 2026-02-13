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
  ComputerDesktopIcon,
  ShieldCheckIcon,
  BoltIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import FaqSection from "@/components/landing/faq-section";

const features = [
  {
    name: "Controle de Tempo",
    description:
      "Defina limites diários de uso por dispositivo. Avisos automáticos aos 15 e 5 minutos restantes. Bloqueio total quando o tempo acabar.",
    icon: ClockIcon,
  },
  {
    name: "Monitor de Barulho",
    description:
      "Detecta barulho excessivo pelo microfone. Sistema de strikes com avisos visuais e penalidades de tempo configuráveis.",
    icon: SpeakerWaveIcon,
  },
  {
    name: "Painel Remoto",
    description:
      "Adicione tempo, bloqueie a tela, reinicie strikes e controle o dispositivo remotamente — do celular ou de qualquer navegador.",
    icon: GlobeAltIcon,
  },
  {
    name: "Horários Personalizados",
    description:
      "Configure horários permitidos para cada dia da semana. Fora do horário, o dispositivo bloqueia automaticamente.",
    icon: CalendarDaysIcon,
  },
  {
    name: "Atualizações Automáticas",
    description:
      "O app se atualiza sozinho. Novas versões são instaladas silenciosamente sem intervenção manual.",
    icon: ArrowPathIcon,
  },
  {
    name: "Proteção por Senha",
    description:
      "Todas as ações sensíveis exigem senha. Configurações, adicionar tempo e fechar o app são protegidos.",
    icon: LockClosedIcon,
  },
  {
    name: "Bloqueio de Apps & Sites",
    description:
      "Bloqueie aplicativos e sites específicos ou permita apenas os aprovados. Regras sincronizadas remotamente.",
    icon: NoSymbolIcon,
    badge: "Novo",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Registre-se no painel web e adicione um novo dispositivo.",
    icon: ShieldCheckIcon,
  },
  {
    number: "02",
    title: "Instale no dispositivo",
    description: "Baixe o instalador, rode no dispositivo da criança e insira o código de pareamento.",
    icon: ComputerDesktopIcon,
  },
  {
    number: "03",
    title: "Controle de qualquer lugar",
    description: "Monitore o uso, ajuste limites e envie comandos direto do seu celular.",
    icon: BoltIcon,
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

const changelog = [
  {
    version: "2.1.0",
    date: "13 Fev 2026",
    changes: [
      "Novo: Bloqueio de aplicativos (blacklist/whitelist)",
      "Novo: Bloqueio de sites via hosts file",
      "Histórico e eventos integrados ao dashboard",
      "Artigos brasileiros na seção Saúde Digital",
    ],
  },
  {
    version: "2.0.3",
    date: "13 Fev 2026",
    changes: [
      "Fix: desbloqueio imediato ao adicionar tempo",
      "Auto-updater agora usa instalador silencioso",
      "Schedule vazio não bloqueia mais o dispositivo",
    ],
  },
  {
    version: "2.0.2",
    date: "12 Fev 2026",
    changes: [
      "Auto-update via GitHub Releases",
      "Script de publicação automatizado",
    ],
  },
  {
    version: "2.0.1",
    date: "12 Fev 2026",
    changes: [
      "Painel flutuante compacto e discreto",
      "Tempo formatado em H:MM",
      "Removido medidor de dB do dashboard web",
    ],
  },
  {
    version: "2.0.0",
    date: "11 Fev 2026",
    changes: [
      "Redesign completo do painel web",
      "Sistema de pareamento por código",
      "Sincronização em tempo real via Supabase",
      "Novo sistema de strikes com penalidades",
    ],
  },
];

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dispositivos");
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50 bg-grain">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(20,184,166,0.08),transparent)]" />
        <div className="absolute top-20 -right-32 -z-10 w-[500px] h-[500px] rounded-full bg-teal-100/30 blur-[100px]" />
        <div className="absolute -top-20 -left-20 -z-10 w-[400px] h-[400px] rounded-full bg-amber-100/20 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-36 text-center">
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200/60 mb-10 shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-teal-600" />
            </span>
            v2.0.3 disponível — auto-update incluso
          </div>

          <h1 className="animate-fade-in-up delay-1 font-display text-5xl tracking-tight text-slate-900 sm:text-7xl lg:text-8xl leading-[0.95]">
            Controle parental{" "}
            <span className="text-teal-600">inteligente</span>
          </h1>
          <p className="animate-fade-in-up delay-2 mt-8 text-lg leading-8 text-slate-600 max-w-2xl mx-auto sm:text-xl">
            Limite tempo de tela, monitore barulho e gerencie os dispositivos do seu filho
            remotamente. Sem complicação, sem briga.
          </p>

          <div className="animate-fade-in-up delay-3 mt-12 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Assine por R$&nbsp;19,90/mês
              </button>
            </SignUpButton>
            <a
              href="#features"
              className="rounded-full px-8 py-3.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:ring-slate-400 hover:bg-white transition-all"
            >
              Ver funcionalidades
            </a>
          </div>

          <div className="animate-fade-in-up delay-4 mt-16 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-teal-600" />
              <span>Até 2 dispositivos</span>
            </div>
            <div className="flex items-center gap-2">
              <ComputerDesktopIcon className="size-5 text-slate-500" />
              <span>Windows 10/11</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="size-5 text-slate-500" />
              <span>Atualização automática</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 ring-1 ring-amber-200/60">
              <span className="text-base">📱</span>
              <span className="text-amber-700 font-medium text-xs">Android & iOS em breve</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-teal-600">Tudo que você precisa</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Funcionalidades completas
            </p>
            <p className="mt-4 text-lg text-slate-500">
              Do controle de tempo ao monitoramento de barulho — tudo gerenciável remotamente.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className={`animate-fade-in-up delay-${index} group relative rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:ring-teal-200/60 transition-all duration-300 hover:-translate-y-1`}
                >
                  <dt className="flex items-center gap-3 text-base font-semibold text-slate-900">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100 group-hover:bg-teal-100 transition-colors">
                      <feature.icon className="size-5 text-teal-600" />
                    </div>
                    {feature.name}
                    {"badge" in feature && feature.badge && (
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 ring-1 ring-teal-200">
                        {feature.badge}
                      </span>
                    )}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-slate-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 sm:py-32 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold tracking-widest uppercase text-teal-600">Simples de configurar</p>
              <p className="mt-3 font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                Funcionando em 3 passos
              </p>
              <p className="mt-4 text-base text-slate-500">
                Do cadastro ao controle total em menos de 5 minutos.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-teal-300 via-teal-200 to-transparent" />

              <div className="space-y-10">
                {steps.map((step, index) => (
                  <div key={step.number} className={`animate-fade-in-up delay-${index + 1} relative flex gap-6`}>
                    <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                      <step.icon className="size-6 text-teal-600" />
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-bold text-teal-600 tracking-widest uppercase">
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
      <section id="testimonials" className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.15),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest uppercase text-teal-400">Depoimentos</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-white sm:text-4xl">
              O que os pais dizem
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`animate-fade-in-up delay-${index + 1} flex flex-col rounded-2xl bg-white/[0.06] backdrop-blur-sm p-7 ring-1 ring-white/10 hover:ring-teal-400/30 transition-all duration-300`}
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.author.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Saúde Digital ── */}
      <section id="saude-digital" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-teal-600">Saúde Digital Infantil</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              O que a ciência diz sobre tempo de tela
            </p>
            <p className="mt-4 text-lg text-slate-500">
              Entender os impactos do uso excessivo de telas é o primeiro passo para proteger seu filho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <a
              href="https://g1.globo.com/bemestar/noticia/2024/09/29/por-que-exposicao-excessiva-a-telas-pode-provocar-crises-de-raiva-do-seu-filho.ghtml"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-100">G1 Bem Estar</span>
                <span className="text-xs text-slate-400">Set 2024</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                Por que exposição excessiva a telas pode provocar crises de raiva do seu filho
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tempo de tela gera menor controle emocional em crianças de até 4 anos, criando um ciclo vicioso que interfere na saúde mental, segundo especialistas.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>

            <a
              href="https://g1.globo.com/fantastico/noticia/2023/12/10/uso-prolongado-de-telas-por-criancas-e-adolescentes-preocupa-especialistas-veja-consequencias.ghtml"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 ring-1 ring-blue-100">G1 Fantástico</span>
                <span className="text-xs text-slate-400">Dez 2023</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                Uso prolongado de telas por crianças e adolescentes preocupa especialistas
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Dispositivos podem amplificar problemas de saúde mental em jovens vulneráveis. Reportagem mostra as consequências do uso excessivo.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>

            <a
              href="https://g1.globo.com/saude/noticia/2023/02/14/criancas-e-adolescentes-no-celular-uso-exagerado-afeta-o-cerebro-e-a-concentracao-veja-o-que-fazer.ghtml"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600 ring-1 ring-green-100">G1 Saúde</span>
                <span className="text-xs text-slate-400">Fev 2023</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                Uso exagerado do celular afeta o cérebro e a concentração de crianças
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Telas são fonte inesgotável de estímulos rápidos que liberam dopamina, prejudicando a capacidade de foco e atenção em atividades do mundo real.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>

            <a
              href="https://drauziovarella.uol.com.br/coluna-2/criancas-adolescentes-e-o-excesso-de-telas-coluna/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600 ring-1 ring-purple-100">Drauzio Varella</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                Crianças, adolescentes e o excesso de telas
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Coluna do portal Drauzio Varella aborda os riscos do tempo excessivo de tela para o desenvolvimento infantil e adolescente, com base em evidências científicas.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>

            <a
              href="https://g1.globo.com/pr/parana/especial-publicitario/educacao-adventista/educacao-adventista/noticia/2024/11/14/o-perigo-das-telas-para-criancas-e-adolescentes.ghtml"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 ring-1 ring-amber-100">G1 Educação</span>
                <span className="text-xs text-slate-400">Nov 2024</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                O perigo das telas para crianças e adolescentes
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Crianças passam em média mais de 7 horas por dia em telas. A OMS recomenda no máximo 2 horas para a faixa de 5 a 17 anos. Artigo detalha os riscos à saúde física e mental.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>

            <a
              href="https://autismoerealidade.org.br/2024/04/24/impacto-de-telas/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-stone-50/80 p-7 ring-1 ring-stone-200/80 space-y-3 hover:ring-teal-200/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-600 ring-1 ring-teal-100">Autismo e Realidade</span>
                <span className="text-xs text-slate-400">Abr 2024</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                Impacto do uso excessivo de telas por crianças e adolescentes
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Para crianças de 6 a 10 anos, o máximo indicado é de 2 horas por dia. Estudos mostram efeitos no desenvolvimento, sono e comportamento social.
              </p>
              <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-500 transition">
                Ler artigo &rarr;
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Changelog ── */}
      <section id="changelog" className="py-24 sm:py-32 bg-stone-50">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-teal-600">Changelog</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
              Atualizações recentes
            </p>
            <p className="mt-4 text-lg text-slate-500">
              O KidsPC está em constante evolução. Veja o que há de novo.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-teal-300 via-stone-200 to-transparent" />

            <div className="space-y-10">
              {changelog.map((release, index) => (
                <div key={release.version} className="relative pl-12">
                  <div className="absolute left-0 flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-stone-200 shadow-sm">
                    <div className={`size-2.5 rounded-full ${index === 0 ? "bg-teal-500" : "bg-stone-400"}`} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
                      v{release.version}
                    </span>
                    <span className="text-xs text-slate-400">{release.date}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white">
        <div className="px-6">
          <FaqSection />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative isolate py-24 sm:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(20,184,166,0.12),transparent)]" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Pronto para ter paz em casa?
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            Crie sua conta em segundos e comece a gerenciar os dispositivos do seu filho hoje.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-full bg-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Assine por R$&nbsp;19,90/mês
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-full px-8 py-3.5 text-sm font-semibold text-slate-300 ring-1 ring-white/20 hover:ring-white/40 hover:text-white transition-all">
                Já tenho conta
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ComputerDesktopIcon className="size-5 text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">KidsPC</span>
            <span className="text-sm text-slate-400">&middot; Controle parental inteligente</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-700 transition">Funcionalidades</a>
            <a href="#testimonials" className="hover:text-slate-700 transition">Depoimentos</a>
            <a href="#saude-digital" className="hover:text-slate-700 transition">Saúde Digital</a>
            <a href="#faq" className="hover:text-slate-700 transition">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
