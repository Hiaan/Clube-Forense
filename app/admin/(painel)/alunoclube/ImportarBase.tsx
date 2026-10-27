"use client";

// Subir a base de alunos (CSV exportado da Eduzz).
//
// A planilha é lida AQUI, no navegador: o arquivo não é enviado inteiro. Só
// três colunas seguem para o servidor — CPF, código e nome do produto — e só
// das vendas pagas. O servidor guarda o HMAC do CPF, nunca o número.
//
// As colunas são reconhecidas pelo nome do cabeçalho, mas dá para trocar na
// mão antes de enviar: exportações diferentes da Eduzz chamam a mesma coisa de
// jeitos diferentes.

import { useMemo, useState, useTransition } from "react";

import { importarBaseAcao, type LinhaBase } from "./acoes";

const LOTE = 1500;

function sem(v: string) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** CSV com aspas, separador ; ou , (o que aparecer mais no cabeçalho). */
function lerCsv(texto: string): string[][] {
  const t = texto.replace(/^﻿/, "");
  const primeira = t.slice(0, t.indexOf("\n") >>> 0 || t.length);
  const sep =
    (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      linha.push(campo);
      campo = "";
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
  return linhas;
}

function adivinhar(cab: string[]) {
  const n = cab.map(sem);
  const achar = (re: RegExp, nao?: RegExp) =>
    n.findIndex((h) => re.test(h) && !(nao && nao.test(h)));
  return {
    // Do nome mais certeiro para o mais vago: a exportação da Eduzz tem
    // "Cliente / Documento", mas também "Tipo Documento" e "Valor Faturado
    // Documento Fiscal", que não são o CPF.
    cpf:
      [/cpf/, /cliente.*documento/, /documento|\bdoc\b|taxnumber/]
        .map((re) => achar(re, /tipo|valor|fiscal|nota/))
        .find((i) => i >= 0) ?? -1,
    produtoId: achar(
      /(cod|codigo|id).*(produto|product|conteudo)|(produto|product|conteudo).*(cod|codigo|\bid\b)/,
    ),
    produto: achar(
      /produto|product|conteudo|curso|nome do item/,
      /(cod|codigo|\bid\b)/,
    ),
    status: achar(/status|situacao|situação/),
  };
}

const PAGO = /pag|aprov|conclu|finaliz|paid|complet/;
const NAO_PAGO =
  /cancel|estorn|reembol|chargeback|devol|recus|expir|aguard|abert|pend|nao pag|não pag|atras/;

export default function ImportarBase() {
  const [linhas, setLinhas] = useState<string[][] | null>(null);
  const [arquivo, setArquivo] = useState("");
  const [cols, setCols] = useState({
    cpf: -1,
    produtoId: -1,
    produto: -1,
    status: -1,
  });
  const [enviando, iniciar] = useTransition();
  const [progresso, setProgresso] = useState<string | null>(null);

  async function abrir(f: File) {
    const buf = await f.arrayBuffer();
    // Exportação antiga da Eduzz vem em Windows-1252; a nova, em UTF-8.
    let texto = new TextDecoder("utf-8").decode(buf);
    if (texto.includes("�"))
      texto = new TextDecoder("windows-1252").decode(buf);
    const l = lerCsv(texto);
    setArquivo(f.name);
    setLinhas(l);
    setCols(adivinhar(l[0] ?? []));
    setProgresso(null);
  }

  const cab = linhas?.[0] ?? [];
  const corpo = useMemo(() => linhas?.slice(1) ?? [], [linhas]);

  // O que vai ser enviado, com o filtro de vendas pagas aplicado.
  const previa = useMemo(() => {
    if (cols.cpf < 0) return null;
    let pagas = 0;
    let ignoradas = 0;
    const porProduto = new Map<string, number>();
    const saida: LinhaBase[] = [];
    for (const r of corpo) {
      const st = cols.status >= 0 ? sem(r[cols.status] ?? "") : "";
      if (cols.status >= 0 && (NAO_PAGO.test(st) || !PAGO.test(st))) {
        ignoradas++;
        continue;
      }
      const cpf = (r[cols.cpf] ?? "").replace(/\D/g, "");
      if (cpf.length !== 11) {
        ignoradas++;
        continue;
      }
      pagas++;
      const nome = cols.produto >= 0 ? (r[cols.produto] ?? "").trim() : "";
      const idTxt =
        cols.produtoId >= 0 ? (r[cols.produtoId] ?? "").replace(/\D/g, "") : "";
      saida.push([cpf, idTxt ? Number(idTxt) : null, nome || null]);
      porProduto.set(
        nome || "(sem nome)",
        (porProduto.get(nome || "(sem nome)") ?? 0) + 1,
      );
    }
    return {
      saida,
      pagas,
      ignoradas,
      cpfs: new Set(saida.map((s) => s[0])).size,
      porProduto: [...porProduto.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [corpo, cols]);

  function enviar() {
    if (!previa) return;
    iniciar(async () => {
      let gravadas = 0;
      let invalidas = 0;
      for (let i = 0; i < previa.saida.length || i === 0; i += LOTE) {
        setProgresso(
          `Enviando ${Math.min(i + LOTE, previa.saida.length)} de ${previa.saida.length}…`,
        );
        const r = await importarBaseAcao(
          previa.saida.slice(i, i + LOTE),
          i === 0,
        );
        if (!r.ok) {
          setProgresso(
            `Parou: ${r.mensagem ?? "erro"}. Nada foi perdido — envie de novo.`,
          );
          return;
        }
        gravadas += r.gravadas;
        invalidas += r.invalidas;
        if (previa.saida.length === 0) break;
      }
      setProgresso(
        `Pronto: ${gravadas} compras de ${previa.cpfs} CPFs gravadas` +
          (invalidas ? ` (${invalidas} CPFs inválidos ignorados)` : "") +
          ". Recarregue a página para ver o resumo.",
      );
    });
  }

  const seletor = (
    chave: keyof typeof cols,
    rotulo: string,
    opcional = false,
  ) => (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
      {rotulo}
      <select
        value={cols[chave]}
        onChange={(e) => setCols({ ...cols, [chave]: Number(e.target.value) })}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
      >
        <option value={-1}>{opcional ? "(não usar)" : "(escolha)"}</option>
        {cab.map((c, i) => (
          <option key={i} value={i}>
            {c || `coluna ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-600">
        Exporte as vendas da Eduzz em CSV e escolha o arquivo abaixo. Ele é lido
        aqui no navegador; só CPF e produto das vendas pagas vão para o
        servidor, que guarda uma impressão irreversível do CPF. Subir de novo
        substitui a base anterior.
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && abrir(e.target.files[0])}
        className="mt-4 block text-sm"
      />

      {linhas && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-gray-700">
            <strong>{arquivo}</strong>: {corpo.length} linhas, {cab.length}{" "}
            colunas.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            {seletor("cpf", "Coluna do CPF")}
            {seletor("produto", "Nome do produto", true)}
            {seletor("produtoId", "Código do produto", true)}
            {seletor("status", "Status da venda", true)}
          </div>

          {!previa ? (
            <p className="text-sm text-amber-700">Escolha a coluna do CPF.</p>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                <strong>{previa.pagas}</strong> compras pagas de{" "}
                <strong>{previa.cpfs}</strong> CPFs serão enviadas ·{" "}
                {previa.ignoradas} linhas ignoradas (não pagas ou sem CPF).
                {cols.status < 0 &&
                  " Sem coluna de status: todas as linhas contam como pagas."}
              </p>
              <div className="max-h-64 overflow-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-gray-100">
                    {previa.porProduto.map(([nome, n]) => (
                      <tr key={nome}>
                        <td className="px-3 py-1.5">{nome}</td>
                        <td className="px-3 py-1.5 text-right">{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={enviar}
                disabled={enviando || previa.pagas === 0}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {enviando
                  ? "Enviando…"
                  : "Substituir a base pelos dados desta planilha"}
              </button>
            </>
          )}
          {progresso && (
            <p className="text-sm font-semibold text-gray-800">{progresso}</p>
          )}
        </div>
      )}
    </div>
  );
}
