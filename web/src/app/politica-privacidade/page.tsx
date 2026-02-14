export const metadata = {
  title: "Política de Privacidade — KidsPC",
  description: "Política de privacidade do KidsPC",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 font-[family-name:var(--font-body)]">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-900 mb-2">
        Política de Privacidade
      </h1>
      <p className="text-sm text-slate-500 mb-10">
        Última atualização: 14 de fevereiro de 2026
      </p>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Introdução</h2>
          <p>
            O <strong>KidsPC</strong> (&quot;nós&quot;, &quot;nosso&quot;) é um software de controle parental
            desenvolvido pela <strong>Overdrive Dev</strong>. Esta política descreve como coletamos,
            usamos e protegemos as informações dos usuários do nosso serviço, incluindo o
            aplicativo desktop, o painel web e futuros aplicativos móveis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Dados que coletamos</h2>
          <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Dados de conta:</strong> endereço de e-mail e nome, fornecidos durante
              o cadastro via Clerk (nosso provedor de autenticação).
            </li>
            <li>
              <strong>Dados de uso do computador:</strong> tempo de uso diário, sessões de
              atividade, eventos de barulho (nível em decibéis) e status de strikes.
            </li>
            <li>
              <strong>Dados de configuração:</strong> limites de tempo, horários permitidos,
              listas de apps/sites bloqueados e preferências do dispositivo.
            </li>
            <li>
              <strong>Dados de assinatura:</strong> ID de cliente Stripe e status da assinatura.
              Não armazenamos dados de cartão de crédito — estes são gerenciados
              exclusivamente pelo Stripe.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Como usamos os dados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer as funcionalidades de controle parental (limites de tempo, monitoramento de barulho, bloqueio de apps/sites).</li>
            <li>Sincronizar configurações e status entre o aplicativo desktop e o painel web.</li>
            <li>Exibir histórico de uso e eventos no painel do responsável.</li>
            <li>Processar pagamentos e gerenciar assinaturas.</li>
            <li>Enviar notificações relacionadas ao serviço (alertas, atualizações).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Armazenamento e segurança</h2>
          <p>
            Os dados são armazenados no <strong>Supabase</strong> (infraestrutura na nuvem com
            criptografia em trânsito e em repouso). A autenticação é gerenciada pelo{" "}
            <strong>Clerk</strong>, e os pagamentos pelo <strong>Stripe</strong> — ambos
            provedores com certificações de segurança reconhecidas (SOC 2, PCI DSS).
          </p>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros
            para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Monitoramento de áudio</h2>
          <p>
            O KidsPC utiliza o microfone do computador exclusivamente para medir o{" "}
            <strong>nível de volume ambiente em decibéis (dB)</strong>. Importante:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Não gravamos áudio.</strong> Nenhuma conversa, voz ou som é gravado ou armazenado.</li>
            <li>Apenas o valor numérico do nível de ruído (ex: &quot;72 dB&quot;) é processado e, opcionalmente, sincronizado.</li>
            <li>O processamento de áudio é feito localmente no dispositivo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Bloqueio de apps e sites</h2>
          <p>
            As listas de aplicativos e sites bloqueados são configuradas pelo responsável
            através do painel web e sincronizadas com o dispositivo. O bloqueio de sites
            é feito via arquivo hosts do sistema operacional. Nenhum tráfego de rede é
            interceptado ou monitorado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Dados de menores</h2>
          <p>
            O KidsPC é um software de controle parental. O cadastro e gerenciamento da
            conta é feito pelo <strong>responsável legal</strong> (maior de 18 anos). O menor
            utiliza o computador monitorado, mas não possui conta própria no serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">8. Seus direitos</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar os dados pessoais que temos sobre você.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão dos seus dados pessoais.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail:{" "}
            <a href="mailto:contato@kidspc.com.br" className="text-indigo-600 hover:text-indigo-500 underline">
              contato@kidspc.com.br
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">9. Retenção de dados</h2>
          <p>
            Os dados de uso (sessões, eventos) são mantidos enquanto a conta estiver ativa.
            Ao cancelar a assinatura e solicitar exclusão da conta, todos os dados
            associados serão removidos em até 30 dias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">10. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Alterações significativas serão
            comunicadas por e-mail ou aviso no painel web. O uso continuado do serviço
            após alterações constitui aceitação da política atualizada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">11. Contato</h2>
          <p>
            Para dúvidas sobre esta política de privacidade ou sobre o tratamento dos
            seus dados, entre em contato:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>E-mail:</strong>{" "}
              <a href="mailto:contato@kidspc.com.br" className="text-indigo-600 hover:text-indigo-500 underline">
                contato@kidspc.com.br
              </a>
            </li>
            <li><strong>Empresa:</strong> Overdrive Dev</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
