// Vendas dos infoprodutos, espelhadas da Eduzz.

import Barras from "../../graficos/Barras";
import { Cartao, Numero } from "../../graficos/Cartao";
import { eduzzConfigurada } from "../../../lib/eduzzApi";
import { listarVendas, resumoVendas, vendasPorDia } from "../../../lib/vendasRepo";

export const dynamic = "force-dynamic";

/** Quantos produtos entram no ranking. */
const TOP_PRODUTOS = 6;

const REAIS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function moeda(v: number): string {
  return REAIS.format(v);
}

function quando(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      {children}
    </div>
  );
}

export default async function PainelVendas() {
  const [vendas, resumo, porDia] = await Promise.all([
    listarVendas(),
    resumoVendas(),
    vendasPorDia(30),
  ]);

  if (vendas === null || resumo === null) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <Aviso>
          Banco indisponível. Confira a variável <code>DATABASE_URL</code> do
          projeto na Vercel.
        </Aviso>
      </>
    );
  }

  // O melhor dia serve de referência para as barras da série: sem ele, um mês
  // inteiro de barras cheias sugeriria que todo dia vendeu igual.
  const melhorDia = Math.max(1, ...(porDia ?? []).map((d) => d.faturamento));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Espelho das faturas da Eduzz. A fonte da verdade continua sendo o
          painel dela; aqui é a série histórica, que sobrevive à janela de
          consulta e cabe junto do resto do Clube.{" "}
          {resumo.atualizadoEm && `Última atualização: ${quando(resumo.atualizadoEm)}.`}
        </p>
      </header>

      {!eduzzConfigurada() && (
        <Aviso>
          Credenciais da Eduzz ausentes. Defina <code>EDUZZ_PUBLIC_KEY</code> e{" "}
          <code>EDUZZ_API_KEY</code> na Vercel para a sincronização diária
          funcionar — o webhook, esse depende de <code>EDUZZ_WEBHOOK_TOKEN</code>.
        </Aviso>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Numero
          rotulo="Faturamento"
          valor={moeda(resumo.faturamento)}
          rodape="Líquido do produtor, somando as faturas pagas"
          icone="dinheiro"
          destaque
        />
        <Numero
          rotulo="Últimos 30 dias"
          valor={moeda(resumo.faturamento30)}
          rodape="Pelo dia do pagamento"
          icone="relogio"
        />
        <Numero
          rotulo="Vendas pagas"
          valor={resumo.pagas}
          rodape={`de ${resumo.total} fatura(s) registrada(s)`}
          icone="estrela"
        />
        <Numero
          rotulo="Ticket médio"
          valor={moeda(resumo.pagas > 0 ? resumo.faturamento / resumo.pagas : 0)}
          rodape="Faturamento dividido pelas vendas pagas"
          icone="painel"
        />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Cartao titulo="Por produto" descricao="Faturamento líquido das vendas pagas">
          <Barras
            vazio="Nenhuma venda paga registrada ainda."
            barras={resumo.porProduto.slice(0, TOP_PRODUTOS).map((p) => ({
              chave: p.produto,
              rotulo: `${p.produto} · ${p.vendas} venda(s)`,
              // A barra mede dinheiro, mas o número exibido pelo componente é
              // cru; por isso o valor em reais vai no rótulo e aqui fica a
              // contagem, que se lê sozinha.
              valor: p.vendas,
              cor: "#a67c00",
            }))}
          />
        </Cartao>

        <Cartao titulo="Últimos 30 dias" descricao="Faturamento por dia de pagamento">
          {porDia === null || porDia.every((d) => d.faturamento === 0) ? (
            <p className="py-8 text-center text-sm text-gray-400">Sem vendas no período.</p>
          ) : (
            <ol className="flex h-40 items-end gap-[3px]">
              {porDia.map((d) => (
                <li
                  key={d.dia}
                  className="flex-1 rounded-t bg-[#a67c00]/80"
                  style={{ height: `${Math.max(2, (d.faturamento / melhorDia) * 100)}%` }}
                  title={`${d.dia.split("-").reverse().join("/")}: ${moeda(d.faturamento)} em ${d.vendas} venda(s)`}
                />
              ))}
            </ol>
          )}
        </Cartao>
      </div>

      {vendas.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Produto</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Líquido</th>
                <th className="px-4 py-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{v.clienteNome ?? "—"}</span>
                    {v.clienteEmail && (
                      <span className="block text-xs text-gray-500">{v.clienteEmail}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.produto ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        v.paga ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {v.statusNome || (v.paga ? "Paga" : `Status ${v.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {moeda(v.valorLiquido)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{quando(v.pagaEm ?? v.criadaEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vendas.length === 0 && (
        <Cartao>
          <p className="py-8 text-center text-sm text-gray-400">
            Nenhuma venda espelhada ainda. Rode a sincronização em{" "}
            <code>/api/cron/eduzz?dias=730</code> para trazer o histórico.
          </p>
        </Cartao>
      )}
    </>
  );
}
