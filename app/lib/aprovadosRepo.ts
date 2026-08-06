// Alunos aprovados: leitura e gravação.
//
// Mesma regra dos outros repositórios: leitura devolve `null` em caso de falha
// e nunca lança, para o site cair na lista embutida em vez de quebrar.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

export interface Aprovado {
  id: number;
  uf: string;
  nome: string;
  titulo: string | null;
  orgao: string | null;
  ano: number | null;
  fotoUrl: string | null;
  ordem: number;
}

/** O que o formulário manda. Sem `id` é criação; com `id` é edição. */
export interface AprovadoEntrada {
  id?: number;
  uf: string;
  nome: string;
  titulo: string | null;
  orgao: string | null;
  ano: number | null;
  fotoUrl: string | null;
  ordem: number;
}

function daLinha(l: Record<string, unknown>): Aprovado {
  const texto = (v: unknown): string | null => (v == null ? null : String(v));
  return {
    id: Number(l.id),
    uf: String(l.uf),
    nome: String(l.nome),
    titulo: texto(l.titulo),
    orgao: texto(l.orgao),
    ano: l.ano == null ? null : Number(l.ano),
    fotoUrl: texto(l.foto_url),
    ordem: Number(l.ordem ?? 0),
  };
}

/** Todos os aprovados, agrupáveis por UF. `null` quando o banco não respondeu. */
export async function listarAprovados(): Promise<Aprovado[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select * from aprovados order by uf, ordem, id",
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao listar aprovados:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Cria ou atualiza. Lança em caso de erro — o painel mostra a mensagem. */
export async function salvarAprovado(a: AprovadoEntrada): Promise<void> {
  await garantirEsquema();
  const valores = [
    a.uf.toUpperCase(),
    a.nome.trim(),
    a.titulo,
    a.orgao,
    a.ano,
    a.fotoUrl,
    a.ordem,
  ];

  if (a.id) {
    await sql().query(
      `update aprovados set uf = $1, nome = $2, titulo = $3, orgao = $4,
              ano = $5, foto_url = $6, ordem = $7
        where id = $8`,
      [...valores, a.id],
    );
    return;
  }

  await sql().query(
    `insert into aprovados (uf, nome, titulo, orgao, ano, foto_url, ordem)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    valores,
  );
}

/**
 * Apaga o registro e devolve a foto que estava nele, para quem chamou remover o
 * arquivo do Blob. Sem isso a imagem ficaria órfã ocupando espaço para sempre.
 */
export async function apagarAprovado(id: number): Promise<string | null> {
  await garantirEsquema();
  const linhas = (await sql().query(
    "delete from aprovados where id = $1 returning foto_url",
    [id],
  )) as Record<string, unknown>[];
  const url = linhas[0]?.foto_url;
  return url == null ? null : String(url);
}
