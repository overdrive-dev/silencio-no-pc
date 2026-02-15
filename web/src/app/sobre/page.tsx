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
    color: "bg-[#FFE0E0] text-[#FF6B6B]",
  },
  {
    icon: ShieldCheckIcon,
    title: "Tecnologia a favor dos pais",
    description:
      "Tecnologia não precisa ser complicada. Criamos o KidsPC pra ser tão simples que qualquer pai ou mãe consiga usar, mesmo sem entender de computador.",
    color: "bg-[#EDF2FF] text-[#4A7AFF]",
  },
  {
    icon: LightBulbIcon,
    title: "Limite com amor, não com briga",
    description:
      "Acreditamos que limites são atos de cuidado. O KidsPC tira o peso de ser \"o vilão\" dos seus ombros — as regras são automáticas e a criança entende.",
    color: "bg-[#FFF3D6] text-[#FFA94D]",
  },
  {
    icon: UserGroupIcon,
    title: "Feito por pais, pra pais",
    description:
      "O KidsPC nasceu de uma necessidade real: a dificuldade de controlar o tempo de tela dos nossos próprios filhos. Cada funcionalidade resolve um problema que vivemos na pele.",
    color: "bg-[#D6F5E0] text-[#51CF66]",
  },
];

export default function SobrePage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute top-10 -right-20 w-64 h-64 blob-yellow opacity-30 animate-float-slow" />
        <div className="absolute bottom-10 left-0 w-48 h-48 blob-blue opacity-20 animate-float" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-[#4A7AFF] mb-4">
            Sobre nós
          </p>
          <h1 className="font-display text-4xl tracking-tight text-[#1a1a2e] sm:text-5xl lg:text-6xl">
            Nascemos de uma{" "}
            <span className="text-[#4A7AFF]">briga por causa do computador</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Assim como você, a gente já perdeu a paciência mandando filho sair do
            computador. E pensamos: &ldquo;tem que ter um jeito melhor&rdquo;. O KidsPC é esse jeito.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="card-flat p-8 sm:p-12">
            <h2 className="font-display text-2xl text-[#1a1a2e] mb-6">
              Nossa história
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-gray-600">
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
            <p className="text-sm font-semibold tracking-widest uppercase text-[#FF6B6B]">
              No que acreditamos
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
              Nossos valores
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="card-flat p-7"
              >
                <div className={`flex size-10 items-center justify-center rounded-xl ${value.color} mb-4`}>
                  <value.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
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
          <div className="rounded-2xl bg-[#EDF2FF] border border-[#DAE5FF] p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl text-[#1a1a2e] mb-4">
              Nossa missão
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
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
        <div className="absolute top-10 -left-10 w-40 h-40 blob-coral opacity-20" />
        <div className="absolute bottom-10 right-10 w-48 h-48 blob-mint opacity-20" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl tracking-tight text-[#1a1a2e] sm:text-4xl">
            Vem com a gente
          </h2>
          <p className="mt-5 text-lg text-gray-500">
            Junte-se a milhares de famílias que já transformaram a rotina em casa.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="btn-pill btn-pill-primary">
                Quero experimentar o KidsPC
              </button>
            </SignUpButton>
            <Link
              href="/dicas-atividades"
              className="btn-pill btn-pill-outline"
            >
              Ver dicas de atividades
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
