import {
  HeartIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

const values = [
  {
    icon: HeartIcon,
    title: "Empatia com as famílias",
    description:
      "Sabemos que cada família é diferente. Não julgamos — oferecemos ferramentas pra você criar as regras que fazem sentido pra sua casa.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: ShieldCheckIcon,
    title: "Tecnologia a favor dos pais",
    description:
      "Tecnologia não precisa ser complicada. Criamos o KidsPC pra ser tão simples que qualquer pai ou mãe consiga usar, mesmo sem entender de computador.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: LightBulbIcon,
    title: "Limite com amor, não com briga",
    description:
      "Acreditamos que limites são atos de cuidado. O KidsPC tira o peso de ser \"o vilão\" dos seus ombros — as regras são automáticas e a criança entende.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: UserGroupIcon,
    title: "Feito por pais, pra pais",
    description:
      "O KidsPC nasceu de uma necessidade real: a dificuldade de controlar o tempo de tela dos nossos próprios filhos. Cada funcionalidade resolve um problema que vivemos na pele.",
    color: "bg-cyan-100 text-cyan-600",
  },
];

export default function SobrePage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-grain">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-500 mb-4">
            Sobre nós
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Nascemos de uma{" "}
            <span className="text-gradient">briga por causa do computador</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Assim como você, a gente já perdeu a paciência mandando filho sair do
            computador. E pensamos: &ldquo;tem que ter um jeito melhor&rdquo;. O KidsPC é esse jeito.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">
              Nossa história
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                Tudo começou com uma cena que provavelmente você conhece: uma criança grudada no
                computador, ignorando todos os pedidos pra parar, e um pai (ou mãe) cada vez mais
                frustrado. Gritar não funciona. Tirar o fio do computador causa uma guerra.
                Negociar &ldquo;mais 5 minutinhos&rdquo; vira uma hora.
              </p>
              <p>
                Procuramos soluções que já existiam e nenhuma era simples o suficiente. Ou eram
                complicadas demais, ou caras demais, ou não tinham as funcionalidades que
                realmente importavam no dia a dia de uma família brasileira.
              </p>
              <p>
                Então decidimos criar o KidsPC: um programa simples, em português, que qualquer
                pai ou mãe consiga configurar em minutos. Sem precisar ser &ldquo;bom com
                tecnologia&rdquo;. Sem termos complicados. Sem menus confusos.
              </p>
              <p>
                Hoje, o KidsPC ajuda famílias a ter mais tranquilidade na rotina. As crianças
                sabem que o limite existe e que é automático — então param de negociar. E os pais
                param de gritar. Todo mundo ganha.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-pink-500">
              No que acreditamos
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Nossos valores
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`flex size-10 items-center justify-center rounded-xl ${value.color} mb-4`}>
                  <value.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-200 p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">
              Nossa missão
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Ajudar famílias brasileiras a encontrar o equilíbrio entre tecnologia e infância. 
              Acreditamos que computador e videogame fazem parte da vida das crianças — mas que
              ter limites saudáveis é um ato de amor. Queremos que os pais tenham as ferramentas
              certas pra cuidar, sem precisar brigar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Vem com a gente
          </h2>
          <p className="mt-5 text-lg text-slate-500">
            Junte-se a milhares de famílias que já transformaram a rotina em casa.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
                Quero experimentar o KidsPC
              </button>
            </SignUpButton>
            <Link
              href="/dicas-atividades"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-slate-600 border border-slate-300 hover:border-violet-300 hover:text-violet-600 transition-all"
            >
              Ver dicas de atividades
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
