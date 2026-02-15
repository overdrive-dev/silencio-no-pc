"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "O que é o KidsPC exatamente?",
    answer:
      "É um programinha que você instala no computador do seu filho. Ele controla o tempo de uso, avisa quando tem barulho demais e bloqueia a tela automaticamente. E o melhor: você gerencia tudo pelo celular, sem precisar estar perto do computador.",
  },
  {
    question: "Eu não entendo muito de tecnologia. Vou conseguir instalar?",
    answer:
      "Com certeza! Foi feito pensando em pais que não são experts em tecnologia. Você cria sua conta, baixa um arquivo e abre no computador do seu filho. Aparece um código na tela, você digita no painel e pronto. Leva menos de 5 minutos, de verdade.",
  },
  {
    question: "Funciona no celular também?",
    answer:
      "Por enquanto, o KidsPC funciona em computadores com Windows 10 ou 11. A versão para celulares Android está sendo desenvolvida e sai em breve! Enquanto isso, você controla tudo pelo navegador do seu celular — só o app do filho que precisa ser no computador.",
  },
  {
    question: "Tenho mais de um filho. Funciona em vários computadores?",
    answer:
      "Funciona sim! Com uma única assinatura, você controla até 2 computadores. Cada um tem suas próprias regras de tempo e horário, e você gerencia todos pelo mesmo painel.",
  },
  {
    question: "Meu filho é esperto com tecnologia. Ele vai conseguir desativar?",
    answer:
      "Pensamos nisso! O KidsPC é protegido por uma senha que só você sabe. Seu filho não consegue fechar o programa, mudar as regras ou desinstalar. Se ele tentar desbloquear a tela, ela trava de novo automaticamente.",
  },
  {
    question: "Como funciona a parte do barulho?",
    answer:
      "O KidsPC usa o microfone do computador pra perceber quando o barulho passa do limite. Primeiro, aparece um aviso na tela. Se seu filho continuar gritando, ele perde tempo de uso. É como um sistema de \"cartões\" — e funciona! A maioria das crianças aprende a se controlar sozinha.",
  },
  {
    question: "Precisa de internet?",
    answer:
      "O limite de tempo e o bloqueio de tela funcionam mesmo sem internet. Mas pra você controlar pelo celular e ver o que está acontecendo em tempo real, o computador do seu filho precisa estar conectado à internet.",
  },
  {
    question: "Quanto custa? Tem contrato?",
    answer:
      "Custa R$\u00A019,90 por mês e inclui tudo: controle de tempo, bloqueio de apps e sites, monitoramento de barulho, controle pelo celular e atualizações automáticas. Não tem contrato e nem fidelidade — você cancela quando quiser, sem multa e sem burocracia.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-widest uppercase text-violet-500">Dúvidas?</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A gente responde
          </p>
          <p className="mt-4 text-lg text-slate-500">
            As perguntas mais comuns de pais como você.
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
