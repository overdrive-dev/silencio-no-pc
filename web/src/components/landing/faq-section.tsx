"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "O que é o KidsPC?",
    answer:
      "O KidsPC é um sistema de controle parental que roda no dispositivo do seu filho e se conecta a um painel web. Você define limites de tempo, horários permitidos e monitora o barulho — tudo remotamente, do seu celular ou de qualquer navegador.",
  },
  {
    question: "Como instalo no dispositivo do meu filho?",
    answer:
      "Basta criar sua conta no painel, adicionar um novo dispositivo e seguir o processo de pareamento: baixe o instalador, rode no dispositivo da criança e insira o código de pareamento. Leva menos de 2 minutos.",
  },
  {
    question: "Funciona em Mac, Linux ou celular?",
    answer:
      "Atualmente o KidsPC funciona no Windows 10/11. Suporte para Android e iOS está em desenvolvimento e será lançado em breve. Mac e Linux estão sendo avaliados.",
  },
  {
    question: "Posso controlar mais de um dispositivo?",
    answer:
      "Sim! O plano inclui até 2 dispositivos com uma única assinatura. Cada dispositivo tem suas próprias configurações de tempo, horários e limites, tudo gerenciável pelo mesmo painel.",
  },
  {
    question: "A criança consegue desinstalar ou burlar?",
    answer:
      "O KidsPC é protegido por senha. Para acessar configurações, adicionar tempo ou fechar o programa, é necessário inserir a senha definida pelo responsável. O bloqueio de tela re-trava automaticamente se a criança tentar desbloquear.",
  },
  {
    question: "Como funciona o monitor de barulho?",
    answer:
      "O KidsPC usa o microfone do dispositivo para detectar níveis de som excessivos. Se o barulho ultrapassar o limite, o sistema emite avisos visuais. A cada 3 strikes, aplica uma penalidade de tempo. Os strikes acumulam ao longo do dia e tudo é configurável.",
  },
  {
    question: "Precisa de internet para funcionar?",
    answer:
      "O controle de tempo e bloqueio funcionam offline. A sincronização com o painel web (comandos remotos, status em tempo real) requer conexão com a internet.",
  },
  {
    question: "Quanto custa o KidsPC?",
    answer:
      "O KidsPC custa R$\u00A019,90/mês e inclui até 2 dispositivos, controle de tempo, monitoramento de barulho, comandos remotos, histórico de uso e atualizações automáticas. Você pode cancelar a qualquer momento. Pagamentos processados com segurança pelo Mercado Pago.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-500">FAQ</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Perguntas frequentes
          </p>
          <p className="mt-4 text-lg text-slate-500">
            Tudo que você precisa saber sobre o KidsPC.
          </p>
        </div>

        <dl className="space-y-3">
          {faqs.map((faq, index) => (
            <Disclosure key={index} as="div" className="rounded-xl bg-white border border-slate-200 hover:border-violet-200 shadow-sm transition-colors">
              {({ open }) => (
                <>
                  <DisclosureButton className="flex w-full items-center justify-between px-6 py-5 text-left">
                    <span className="text-base font-medium text-slate-800">{faq.question}</span>
                    <ChevronDownIcon
                      className={`size-5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="px-6 pb-5 text-sm leading-relaxed text-slate-500">
                    {faq.answer}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </dl>
      </div>
    </section>
  );
}
