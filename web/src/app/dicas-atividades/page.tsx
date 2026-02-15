import {
  PaintBrushIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  MusicalNoteIcon,
  SparklesIcon,
  HeartIcon,
  SunIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

const ageGroups = [
  {
    age: "3 a 5 anos",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    accent: "text-pink-600",
    activities: [
      {
        icon: PaintBrushIcon,
        title: "Pintar e desenhar",
        description:
          "Lápis de cor, giz de cera, tinta guache — qualquer coisa serve. Não precisa ser bonito, o importante é criar. Forre a mesa com jornal e deixe a imaginação rolar.",
      },
      {
        icon: PuzzlePieceIcon,
        title: "Massinha e blocos",
        description:
          "Massinha de modelar, blocos de montar, Lego Duplo. Atividades manuais desenvolvem a coordenação e mantêm as crianças entretidas por horas.",
      },
      {
        icon: BookOpenIcon,
        title: "Ler juntinhos",
        description:
          "Leia uma história antes de dormir ou no meio da tarde. Deixe seu filho escolher o livro. Esse momento fortalece o vínculo e incentiva o hábito de leitura.",
      },
      {
        icon: MusicalNoteIcon,
        title: "Cantar e dançar",
        description:
          "Coloque uma playlist animada e dancem juntos pela sala. Ou inventem músicas bobas. Rir junto é o melhor remédio pro estresse de todo mundo.",
      },
    ],
  },
  {
    age: "6 a 9 anos",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    accent: "text-violet-600",
    activities: [
      {
        icon: PuzzlePieceIcon,
        title: "Jogos de tabuleiro",
        description:
          "Uno, Banco Imobiliário, War, detetive, xadrez — jogos de tabuleiro ensinam a esperar a vez, lidar com frustração e pensar estrategicamente. E é diversão pra família toda.",
      },
      {
        icon: AcademicCapIcon,
        title: "Experiências de ciência",
        description:
          "Vulcão de bicarbonato, slime caseiro, plantar um feijão no algodão. A internet está cheia de experimentos simples e seguros que as crianças adoram.",
      },
      {
        icon: SunIcon,
        title: "Brincar na rua",
        description:
          "Bicicleta, pega-pega, esconde-esconde, pular corda. Brincar ao ar livre gasta energia, melhora o sono e diminui a ansiedade. Se possível, convide os amiguinhos.",
      },
      {
        icon: PaintBrushIcon,
        title: "Projetos criativos",
        description:
          "Construir um forte de almofadas, fazer um teatro de fantoches com meias velhas, criar um gibi desenhado à mão. Projetos que demoram vários dias são ótimos pra substituir telas.",
      },
    ],
  },
  {
    age: "10 a 13 anos",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    accent: "text-cyan-600",
    activities: [
      {
        icon: BookOpenIcon,
        title: "Ler por diversão",
        description:
          "Harry Potter, Diário de um Banana, Percy Jackson — se seu filho encontrar uma série que goste, vai trocar tela por livro sem você pedir. Leve na livraria e deixe escolher.",
      },
      {
        icon: SparklesIcon,
        title: "Aprender algo novo",
        description:
          "Culinária, violão, desenho, costura, marcenaria básica. Nessa idade, aprender uma habilidade nova é muito mais enriquecedor do que mais uma hora de jogo.",
      },
      {
        icon: HandRaisedIcon,
        title: "Esportes e atividades físicas",
        description:
          "Futebol, natação, judô, skate, dança. Atividade física regular melhora o humor, o foco na escola e reduz naturalmente a vontade de ficar no computador o dia todo.",
      },
      {
        icon: ChatBubbleLeftRightIcon,
        title: "Tempo de qualidade em família",
        description:
          "Cozinhar juntos, assistir um filme com pipoca, passear no parque, conversar sobre o dia. Às vezes, a criança só quer tela porque não tem o que fazer — e a companhia dos pais faz toda a diferença.",
      },
    ],
  },
];

const tips = [
  {
    icon: HeartIcon,
    title: "Não proíba — substitua",
    description:
      "Em vez de só tirar o computador, ofereça algo divertido no lugar. \"Vem, vamos fazer um bolo\" funciona melhor do que \"desliga isso agora\".",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Converse sobre o porquê",
    description:
      "Explique de forma simples por que o limite existe. \"Preciso que você descanse os olhos e o cérebro\" é mais eficaz do que \"porque eu mandei\".",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: SparklesIcon,
    title: "Dê o exemplo",
    description:
      "Se você fica no celular o dia todo, fica difícil cobrar. Mostre que você também tem limites. Momentos sem tela pra família toda fazem diferença.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: SunIcon,
    title: "Crie uma rotina",
    description:
      "Horário de tela, horário de brincar, horário de estudar. Quando vira rotina, a criança para de negociar porque sabe o que esperar.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: AcademicCapIcon,
    title: "Recompense sem tela",
    description:
      "Em vez de dar mais tempo de computador como prêmio, experimente: um passeio, escolher o jantar, dormir mais tarde no fim de semana.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: PuzzlePieceIcon,
    title: "Tenha um \"kit anti-tédio\"",
    description:
      "Uma caixa com jogos, livros, materiais de arte e ideias de atividades. Quando seu filho disser \"tô com tédio\", aponte pra caixa.",
    color: "bg-pink-100 text-pink-600",
  },
];

export default function DicasAtividadesPage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-grain">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-500 mb-4">
            Pra toda a família
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            O que fazer quando{" "}
            <span className="text-gradient">desliga a tela?</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Sabemos que limitar o tempo de tela é só metade do desafio. A outra metade é ter
            atividades legais pra substituir. Reunimos ideias práticas pra cada idade — 
            sem precisar de nada complicado.
          </p>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-pink-500">
              Antes de tudo
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              6 dicas que fazem diferença
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Pequenas mudanças de atitude que transformam a rotina da família.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`flex size-10 items-center justify-center rounded-xl ${tip.color} mb-4`}>
                  <tip.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-violet-500">
              Por faixa etária
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ideias de atividades pra cada idade
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Cada fase tem suas brincadeiras. Escolha a faixa etária do seu filho e inspire-se.
            </p>
          </div>

          <div className="space-y-16">
            {ageGroups.map((group) => (
              <div key={group.age}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${group.color} px-4 py-1.5 text-sm font-semibold text-white shadow-lg`}>
                    {group.age}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {group.activities.map((activity) => (
                    <div
                      key={activity.title}
                      className={`rounded-2xl ${group.bg} border ${group.border} p-7 hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <activity.icon className={`size-5 ${group.accent}`} />
                        <h3 className="text-base font-semibold text-slate-900">
                          {activity.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Atividades são ótimas. Mas o limite precisa existir.
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            O KidsPC te ajuda a garantir que o tempo de tela não passe do combinado — 
            pra sobrar tempo pra tudo isso que você acabou de ler.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
                Quero experimentar o KidsPC
              </button>
            </SignUpButton>
            <Link
              href="/"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-slate-600 border border-slate-300 hover:border-violet-300 hover:text-violet-600 transition-all"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
