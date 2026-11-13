import Link from "next/link";
import { PLANOS, usuarioAtual } from "@/lib/placar/conta";
import Marca from "./_ui/Marca";
import { botao, botaoSec, cartao } from "./_ui/estilo";

const BENEFICIOS = [
  {
    titulo: "Relatório no WhatsApp, sozinho",
    texto: "Escolha o dia, o horário e as métricas. O resultado chega no WhatsApp do seu cliente, saindo do seu número, com um comentário em linguagem simples.",
  },
  { titulo: "Alertas antes do problema", texto: "Pagamento recusado, saldo acabando ou custo por lead subindo: você fica sabendo na hora e pode avisar o cliente." },
  { titulo: "Painel com a sua marca", texto: "Cada cliente tem um link com o seu logo e as suas cores para ver os números quando quiser, sem login." },
];

export default async function Inicio() {
  const logado = await usuarioAtual();
  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Marca />
          <nav aria-label="Conta" className="flex items-center gap-3">
            {logado ? (
              <Link href="/placar/app" className={botao}>
                Abrir o Placar
              </Link>
            ) : (
              <>
                <Link href="/placar/entrar" className="px-2 text-[15px] font-medium text-gray-700 hover:text-gray-900">
                  Entrar
                </Link>
                <Link href="/placar/cadastro" className={botao}>
                  Testar grátis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center sm:pt-24">
          <p className="text-sm font-semibold tracking-wide text-[#2F5BEA] uppercase">Para agências e gestores de tráfego</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">O resultado dos anúncios chega sozinho no WhatsApp do seu cliente</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            Conecte o Facebook e o seu WhatsApp uma vez. O Placar manda os relatórios, avisa quando o saldo vai acabar e mostra um painel bonito com a sua marca.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/placar/cadastro" className={`${botao} min-h-[52px] px-7 text-base`}>
              Começar 7 dias grátis
            </Link>
            <a href="#planos" className={`${botaoSec} min-h-[52px] px-7 text-base`}>
              Ver planos
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-500">Sem cartão para testar. Cancele quando quiser.</p>
        </section>

        <section aria-label="O que o Placar faz" className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className={`${cartao} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900">{b.titulo}</h2>
              <p className="mt-2 leading-relaxed text-gray-600">{b.texto}</p>
            </div>
          ))}
        </section>

        <section id="planos" aria-labelledby="t-planos" className="border-t border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 id="t-planos" className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Planos
            </h2>
            <p className="mt-2 text-center text-gray-600">Todos com relatórios, alertas e painel com a sua marca. Muda só o número de clientes.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PLANOS.map((p, i) => (
                <div key={p.id} className={`${cartao} p-6 ${i === 1 ? "border-2 border-[#2F5BEA]" : ""}`}>
                  {i === 1 && <p className="text-xs font-semibold tracking-wide text-[#2F5BEA] uppercase">Mais escolhido</p>}
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">{p.nome}</h3>
                  <p className="mt-1 text-gray-600">{p.resumo}</p>
                  <p className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
                    R$ {p.preco}
                    <span className="text-base font-medium text-gray-500">/mês</span>
                  </p>
                  <Link href="/placar/cadastro" className={`${i === 1 ? botao : botaoSec} mt-6 w-full`}>
                    Testar 7 dias grátis
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">Pagamento mensal por PIX, boleto ou cartão.</p>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">Placar · um produto T9 ADS Company</footer>
    </>
  );
}
