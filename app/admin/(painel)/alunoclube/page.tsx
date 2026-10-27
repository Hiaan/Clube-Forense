// A Black dos alunos (/alunoclube) vista do painel.
//
// Serve para duas coisas: montar as regras de cupom (quais produtos existem,
// com o código da Eduzz de cada um, e quantos compradores têm o CPF na venda —
// quem não tem CPF registrado não consegue se validar) e acompanhar quantos
// alunos já liberaram cada cupom.

import {
  resumoBase,
  resumoPorProduto,
  validacoesPorCupom,
} from "../../../lib/alunoClubeRepo";
import ImportarBase from "./ImportarBase";
import { REGRAS_CUPOM } from "../../../alunoclube/cupons";

export const dynamic = "force-dynamic";

const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default async function PainelAlunoClube() {
  const [produtos, validacoes, base] = await Promise.all([
    resumoPorProduto(),
    validacoesPorCupom(),
    resumoBase(),
  ]);

  const cupomDoProduto = new Map<number, string>();
  for (const r of REGRAS_CUPOM)
    for (const p of r.produtos)
      if (!cupomDoProduto.has(p)) cupomDoProduto.set(p, r.cupom);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Black dos alunos</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        A página{" "}
        <a
          className="underline"
          href="/alunoclube"
          target="_blank"
          rel="noreferrer"
        >
          /alunoclube
        </a>{" "}
        pede o CPF e procura uma compra paga com ele nas vendas da Eduzz. Cada
        produto abaixo pode dar um cupom; quem comprou mais de um recebe o da
        regra que vem primeiro.
      </p>

      <h2 className="mt-8 text-lg font-bold text-gray-900">Regras de cupom</h2>
      {REGRAS_CUPOM.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Nenhuma regra ainda. Enquanto estiver assim, a página avisa que a
          validação está sendo configurada. Defina quais produtos dão qual cupom
          e qual valor, e as regras entram em{" "}
          <code>app/alunoclube/cupons.ts</code>.
        </div>
      ) : (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Prioridade</th>
              <th>Regra</th>
              <th>Produtos</th>
              <th>Cupom</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {REGRAS_CUPOM.map((r, i) => (
              <tr key={r.cupom}>
                <td className="py-2">{i + 1}º</td>
                <td>{r.rotulo}</td>
                <td className="font-mono text-xs">{r.produtos.join(", ")}</td>
                <td className="font-mono">{r.cupom}</td>
                <td>{reais(r.preco)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-10 text-lg font-bold text-gray-900">
        Base de alunos (planilha)
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Complementa as vendas espelhadas (que começam em 2025) com o histórico
        completo da Eduzz.
      </p>
      <div className="mt-3">
        <ImportarBase />
      </div>
      {base && base.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Produto (planilha)</th>
              <th className="text-right">CPFs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {base.map((b) => (
              <tr key={b.produto}>
                <td className="py-1.5">{b.produto}</td>
                <td className="text-right">{b.cpfs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-10 text-lg font-bold text-gray-900">
        Produtos com venda paga
      </h2>
      {produtos === null ? (
        <p className="mt-3 text-sm text-amber-700">Banco indisponível.</p>
      ) : (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2">Código Eduzz</th>
              <th>Produto</th>
              <th className="text-right">Compradores</th>
              <th className="text-right">Com CPF na venda</th>
              <th>Cupom</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map((p) => (
              <tr key={p.produtoId}>
                <td className="py-2 font-mono text-xs">{p.produtoId}</td>
                <td>{p.produto}</td>
                <td className="text-right">{p.compradores}</td>
                <td
                  className={`text-right ${p.comCpf < p.compradores ? "text-amber-700" : ""}`}
                >
                  {p.comCpf}
                </td>
                <td className="font-mono text-xs">
                  {cupomDoProduto.get(p.produtoId) ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-10 text-lg font-bold text-gray-900">
        Cupons liberados
      </h2>
      {!validacoes || validacoes.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          Nenhum aluno validado ainda.
        </p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {validacoes.map((v) => (
            <li key={v.cupom}>
              <span className="font-mono">{v.cupom}</span>: {v.cpfs} CPF(s) ·
              último em {new Date(v.ultima).toLocaleString("pt-BR")}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
