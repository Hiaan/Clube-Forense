// Vendas dos infoprodutos, espelhadas da Eduzz.
//
// O recorte vive na URL (?de=&ate=&produto=), e não em estado do navegador: um
// relatório de agosto que você quer mandar para alguém precisa ser um link, e
// recarregar a página não pode reabrir o mês errado.

import Link from "next/link";

import { Cartao, Numero } from "../../graficos/Cartao";
import { eduzzConfigurada } from "../../../lib/eduzzApi";
import {
  listarProdutos,
  listarVendas,
  rankingProdutos,
  resumoVendas,
  vendasPorDia,
  type Filtro,
} from "../../../lib/vendasRepo";

export const dynamic = "force-dynamic";

const REAIS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const REAIS_CURTO = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const moeda = (v: number) => REAIS.format(v);
const moedaCurta = (v: number) => REAIS_CURTO.format(v);

/** AAAA-MM-DD no fuso de Brasília, que é o fuso em que o painel conta os dias. */
function hojeBr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function diasAtras(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function dataBr(iso: string): string {
  return iso.split("-").reverse().join("/");
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

/** Só aceita AAAA-MM-DD: a data entra na consulta e vem da barra de endereços. */
function dataValida(v: string | undefined): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

const PERIODOS = [
  { rotulo: "7 dias", dias: 7 },
  { rotulo: "30 dias", dias: 30 },
  { rotulo: "90 dias", dias: 90 },
  { rotulo: "12 meses", dias: 365 },
];

const CAMPO =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none";

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      {children}
    </div>
  );
}

export default async function PainelVendas({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const texto = (c: string) => (Array.isArray(q[c]) ? q[c][0] : q[c]);

  // Padrão: últimos 30 dias. "tudo" apaga as duas pontas — é assim que o
  // histórico inteiro se pede.
  const tudo = texto("periodo") === "tudo";
  const de = tudo ? null : (dataValida(texto("de")) ?? diasAtras(29));
  const ate = tudo ? null : (dataValida(texto("ate")) ?? hojeBr());
  const produtoId = Number(texto("produto")) || null;

  const filtro: Filtro = { de, ate, produtoId };

  const [resumo, ranking, porDia, vendas, produtos] = await Promise.all([
    resumoVendas(filtro),
    rankingProdutos(filtro),
    vendasPorDia(filtro),
    listarVendas(filtro),
    listarProdutos(),
  ]);

  if (resumo === null || ranking === null || vendas === null) {
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

  const serie = porDia ?? [];
  const melhorDia = Math.max(1, ...serie.map((d) => d.faturamento));
  const linkPeriodo = (dias: number) =>
    `/admin/vendas?de=${diasAtras(dias - 1)}&ate=${hojeBr()}${produtoId ? `&produto=${produtoId}` : ""}`;
  const periodoAtivo = (dias: number) => !tudo && de === diasAtras(dias - 1) && ate === hojeBr();

  // O link do CSV carrega o mesmo recorte: baixar "o que está na tela" só é
  // verdade se a rota souber qual é a tela.
  const consulta = new URLSearchParams();
  if (de) consulta.set("de", de);
  if (ate) consulta.set("ate", ate);
  if (produtoId) consulta.set("produto", String(produtoId));

  const conversao = resumo.faturas > 0 ? (resumo.pagas / resumo.faturas) * 100 : 0;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Espelho das faturas da Eduzz, com o período e o produto que você
          escolher. A fonte da verdade continua sendo o painel dela; aqui a série
          fica guardada e cabe junto do resto do Clube.{" "}
          {resumo.atualizadoEm && `Sincronizado até ${quando(resumo.atualizadoEm)}.`}
        </p>
      </header>

      {!eduzzConfigurada() && (
        <Aviso>
          Credenciais da Eduzz ausentes. Defina <code>EDUZZ_PUBLIC_KEY</code> e{" "}
          <code>EDUZZ_API_KEY</code> na Vercel para a sincronização funcionar — o
          webhook depende de <code>EDUZZ_WEBHOOK_TOKEN</code>.
        </Aviso>
      )}

      <Cartao className="mb-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {PERIODOS.map((p) => (
            <Link
              key={p.dias}
              href={linkPeriodo(p.dias)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                periodoAtivo(p.dias)
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.rotulo}
            </Link>
          ))}
          <Link
            href={`/admin/vendas?periodo=tudo${produtoId ? `&produto=${produtoId}` : ""}`}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              tudo
                ? "bg-gray-900 text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tudo
          </Link>
        </div>

        {/* Formulário GET: o recorte vira endereço, sem JavaScript nenhum. */}
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-gray-500">
            De
            <input type="date" name="de" defaultValue={de ?? ""} className={`mt-1 block ${CAMPO}`} />
          </label>
          <label className="text-xs font-medium text-gray-500">
            Até
            <input type="date" name="ate" defaultValue={ate ?? ""} className={`mt-1 block ${CAMPO}`} />
          </label>
          <label className="text-xs font-medium text-gray-500">
            Produto
            <select name="produto" defaultValue={produtoId ?? ""} className={`mt-1 block ${CAMPO}`}>
              <option value="">Todos</option>
              {(produtos ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Filtrar
          </button>
          {vendas.length > 0 && (
            <a
              href={`/api/admin/vendas?${consulta}`}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Baixar CSV
            </a>
          )}
        </form>
      </Cartao>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Numero
          rotulo="Faturamento"
          valor={moedaCurta(resumo.faturamento)}
          rodape={
            tudo
              ? "Líquido do produtor, todo o histórico"
              : `Líquido do produtor, de ${dataBr(de!)} a ${dataBr(ate!)}`
          }
          icone="dinheiro"
          destaque
        />
        <Numero
          rotulo="Vendas pagas"
          valor={resumo.pagas}
          rodape={`de ${resumo.faturas} fatura(s) emitida(s) · ${conversao.toFixed(0)}% pagas`}
          icone="estrela"
        />
        <Numero
          rotulo="Ticket médio"
          valor={moedaCurta(resumo.ticket)}
          rodape="Faturamento dividido pelas vendas pagas"
          icone="painel"
        />
        <Numero
          rotulo="Clientes"
          valor={resumo.clientes}
          rodape={
            resumo.pagas > resumo.clientes
              ? `${resumo.pagas - resumo.clientes} compra(s) de quem já era cliente`
              : "E-mails distintos no período"
          }
          icone="pessoas"
        />
      </div>

      <Cartao
        className="mb-6"
        titulo="Faturamento por dia"
        descricao={
          serie.length > 0
            ? `${dataBr(serie[0].dia)} a ${dataBr(serie[serie.length - 1].dia)} · pico de ${moedaCurta(melhorDia)}`
            : undefined
        }
      >
        {serie.every((d) => d.faturamento === 0) ? (
          <p className="py-8 text-center text-sm text-gray-400">Sem vendas no período.</p>
        ) : (
          <ol className="flex h-44 items-end gap-[2px]">
            {serie.map((d) => (
              <li
                key={d.dia}
                className="flex-1 rounded-t bg-[#a67c00]/80 transition hover:bg-[#a67c00]"
                style={{ height: `${Math.max(2, (d.faturamento / melhorDia) * 100)}%` }}
                title={`${dataBr(d.dia)}: ${moeda(d.faturamento)} em ${d.vendas} venda(s)`}
              />
            ))}
          </ol>
        )}
      </Cartao>

      <Cartao
        className="mb-6"
        titulo="Quais produtos vendem mais"
        descricao="Ordenado pelo que entrou no caixa, não pela quantidade"
      >
        {ranking.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Nenhuma venda paga no período.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ranking.map((p) => (
              <li key={p.produtoId ?? p.produto}>
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/admin/vendas?${p.produtoId ? `produto=${p.produtoId}&` : ""}${
                      tudo ? "periodo=tudo" : `de=${de}&ate=${ate}`
                    }`}
                    className="truncate text-sm text-gray-700 hover:underline"
                  >
                    {p.produto}
                  </Link>
                  <span
                    className="shrink-0 text-sm font-semibold text-gray-900"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {moeda(p.faturamento)}
                  </span>
                </div>
                <span className="mt-1.5 block h-2 w-full overflow-hidden rounded-[1px] bg-gray-100">
                  <span
                    className="block h-full rounded-r bg-[#a67c00] ring-1 ring-inset ring-black/10"
                    style={{ width: `${Math.max(2, p.fatia * 100)}%` }}
                  />
                </span>
                <p className="mt-1 text-xs text-gray-400">
                  {p.vendas} venda(s) · ticket {moeda(p.ticket)} ·{" "}
                  {(p.fatia * 100).toFixed(0)}% do faturamento
                </p>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      {vendas.length > 0 ? (
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
                  <td
                    className="px-4 py-3 text-gray-900"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {moeda(v.valorLiquido)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{quando(v.pagaEm ?? v.criadaEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Cartao>
          <p className="py-8 text-center text-sm text-gray-400">
            Nenhuma venda no recorte. Se o espelho ainda estiver vazio, rode{" "}
            <code>/api/cron/eduzz?dias=1095</code> para trazer o histórico.
          </p>
        </Cartao>
      )}
    </>
  );
}
