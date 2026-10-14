import type { Metadata } from "next";
import Link from "next/link";

// Política de privacidade da T9 ADS Company. A Meta pede este endereço para publicar o app
// "T9 Painel" (modo Ao vivo), que lê as contas de anúncio e os leads de formulário dos clientes.

export const metadata: Metadata = {
  title: "Política de Privacidade | T9 ADS Company",
  description: "Como a T9 ADS Company trata os dados do site, do painel dos clientes e dos leads dos anúncios.",
};

const CONTATO = "painel@t9company.com.br";

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 text-white/80 sm:px-6">
      <Link href="/" className="text-sm text-white/50 hover:text-white">
        ← T9 ADS Company
      </Link>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-white sm:text-4xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-white/45">Atualizada em 14 de outubro de 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-extrabold text-white">Quem somos</h2>
          <p className="mt-2">
            A T9 ADS Company é uma agência de tráfego pago. Este documento explica quais dados tratamos no site t9company.com.br, no painel dos
            nossos clientes e no aplicativo &ldquo;T9 Painel&rdquo;, que conecta o painel às contas de anúncio da Meta (Facebook e Instagram).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-extrabold text-white">Que dados tratamos</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Contato pelo site:</strong> nome, e-mail, WhatsApp e as respostas que você envia no formulário de
              agendamento, para retornarmos o contato.
            </li>
            <li>
              <strong className="text-white">Painel dos clientes:</strong> nome e e-mail de quem acessa o painel, para o login por link enviado
              por e-mail.
            </li>
            <li>
              <strong className="text-white">Dados dos anúncios:</strong> investimento, alcance, cliques, resultados e criativos das contas de
              anúncio que nossos clientes nos autorizaram a gerenciar.
            </li>
            <li>
              <strong className="text-white">Leads dos anúncios:</strong> quando alguém preenche um formulário em um anúncio de um cliente nosso,
              recebemos as respostas desse formulário (por exemplo nome, telefone, e-mail e as perguntas do anunciante).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-extrabold text-white">Para que usamos</h2>
          <p className="mt-2">
            Os leads de um anúncio pertencem ao anunciante (nosso cliente). Nós só os usamos para entregá-los a ele: aparecem no painel dele e são
            enviados para o WhatsApp que ele indicou, para que ele atenda a pessoa. Os dados dos anúncios servem para os relatórios e a gestão das
            campanhas. Não vendemos, não alugamos e não usamos esses dados para outros fins.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-extrabold text-white">Com quem compartilhamos</h2>
          <p className="mt-2">
            Apenas com o anunciante dono do lead e com os serviços que fazem o painel funcionar: hospedagem (Vercel), banco de dados (Neon), envio
            de e-mails (Resend) e o próprio WhatsApp, para a entrega da mensagem.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-extrabold text-white">Por quanto tempo guardamos</h2>
          <p className="mt-2">
            Enquanto durar o contrato com o anunciante. Ao fim dele, ou a pedido, os dados daquele cliente são apagados.
          </p>
        </section>

        <section id="exclusao">
          <h2 className="font-display text-xl font-extrabold text-white">Seus direitos e exclusão de dados</h2>
          <p className="mt-2">
            Você pode pedir para ver, corrigir ou apagar os seus dados, conforme a LGPD. Escreva para{" "}
            <a href={`mailto:${CONTATO}`} className="text-[#ff8a90] hover:underline">
              {CONTATO}
            </a>{" "}
            informando o nome e o telefone ou e-mail usados no formulário. Respondemos em até 15 dias e confirmamos quando a exclusão for feita.
          </p>
        </section>
      </div>
    </main>
  );
}
