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
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Registre-se gratuitamente no painel web e adicione um novo dispositivo.",
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
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-indigo-50/70 to-white" />
        <svg className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
          <defs><pattern id="hero-pattern" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse"><path d="M.5 200V.5H200" fill="none" /></pattern></defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)" />
        </svg>

        <div className="mx-auto max-w-4xl px-6 py-28 sm:py-36 lg:py-44 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 mb-8">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-indigo-600" />
            </span>
            v2.0.3 disponível — auto-update incluso
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            Controle parental{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              inteligente
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Limite tempo de tela, monitore barulho e gerencie os dispositivos do seu filho
            remotamente. Sem complicação, sem briga.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-all hover:-translate-y-0.5">
                Começar grátis
              </button>
            </SignUpButton>
            <a
              href="#features"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition"
            >
              Ver funcionalidades
            </a>
          </div>

          <div className="mt-14 flex items-center justify-center gap-x-8 gap-y-3 flex-wrap text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-green-600" />
              <span>Gratuito para uso pessoal</span>
            </div>
            <div className="flex items-center gap-2">
              <ComputerDesktopIcon className="size-5 text-indigo-600" />
              <span>Windows 10/11</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="size-5 text-purple-600" />
              <span>Atualização automática</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">📱</span>
              <span className="text-amber-600 font-medium">Android & iOS em breve</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">Tudo que você precisa</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Funcionalidades completas
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Do controle de tempo ao monitoramento de barulho — tudo gerenciável remotamente.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="relative rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-indigo-200 transition-all hover:-translate-y-0.5"
                >
                  <dt className="flex items-center gap-3 text-base font-semibold text-gray-900">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                      <feature.icon className="size-5 text-indigo-600" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">Simples de configurar</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Funcionando em 3 passos
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                  )}
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                    <step.icon className="size-7 text-indigo-600" />
                  </div>
                  <div className="mt-6">
                    <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
                      Passo {step.number}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 sm:py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">Depoimentos</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              O que os pais dizem
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.author.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.author.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Saúde Digital ── */}
      <section id="saude-digital" className="py-20 sm:py-28 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-base font-semibold text-indigo-600">Saúde Digital Infantil</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              O que a ciência diz sobre tempo de tela
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Entender os impactos do uso excessivo de telas é o primeiro passo para proteger seu filho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2.5">
                  <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">OMS — Organização Mundial da Saúde</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A OMS recomenda que crianças menores de 5 anos tenham no máximo 1 hora de tela por dia. O uso excessivo está associado a atrasos no desenvolvimento cognitivo, motor e emocional.
              </p>
              <a
                href="https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
              >
                Leia mais &rarr;
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2.5">
                  <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">AAP — Academia Americana de Pediatria</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A AAP orienta que crianças de 6 a 12 anos tenham limites consistentes de tempo de tela, priorizando sono, atividade física e interações presenciais. Telas não devem substituir brincadeiras.
              </p>
              <a
                href="https://www.aap.org/en/patient-care/media-and-children/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
              >
                Leia mais &rarr;
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2.5">
                  <svg className="size-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">SBP — Sociedade Brasileira de Pediatria</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A SBP recomenda que crianças de 6 a 10 anos usem telas por no máximo 1-2 horas por dia, sempre com supervisão. O excesso pode causar irritabilidade, problemas de sono e dificuldade de concentração.
              </p>
              <a
                href="https://www.sbp.com.br/especiais/pediatria-para-familias/cuidados-com-a-saude/tempo-de-tela/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
              >
                Leia mais &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Changelog ── */}
      <section id="changelog" className="py-20 sm:py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-base font-semibold text-indigo-600">Changelog</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Atualizações recentes
            </p>
            <p className="mt-4 text-lg text-gray-600">
              O KidsPC está em constante evolução. Veja o que há de novo.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-10">
              {changelog.map((release, index) => (
                <div key={release.version} className="relative pl-12">
                  <div className="absolute left-0 flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
                    <div className={`size-2.5 rounded-full ${index === 0 ? "bg-indigo-600" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                      v{release.version}
                    </span>
                    <span className="text-xs text-gray-500">{release.date}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gray-400" />
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
      <div className="px-6 bg-gray-50">
        <FaqSection />
      </div>

      {/* ── Final CTA ── */}
      <section className="relative isolate py-20 sm:py-28 px-6 bg-white">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-80 bg-gradient-to-t from-indigo-50/50 to-transparent" />
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pronto para ter paz em casa?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Crie sua conta em segundos e comece a gerenciar os dispositivos do seu filho hoje.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-500 transition-all hover:-translate-y-0.5">
                Criar conta grátis
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-xl px-8 py-3.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition">
                Já tenho conta
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} KidsPC. Controle parental inteligente.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition">Funcionalidades</a>
            <a href="#testimonials" className="hover:text-gray-900 transition">Depoimentos</a>
            <a href="#saude-digital" className="hover:text-gray-900 transition">Saúde Digital</a>
            <a href="#changelog" className="hover:text-gray-900 transition">Changelog</a>
            <a href="#faq" className="hover:text-gray-900 transition">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
