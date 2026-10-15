// Publicações entregues pela pesquisa de editais na AWS (serviço pesquisa-editais da Clarear).
//
// A função da AWS faz a parte lenta — os diários oficiais com busca automática
// e o Google Notícias — e entrega em /api/vigia. Aqui elas ficam guardadas, e a
// coleta do site (coletor.ts) lê como mais uma fonte, com o mesmo filtro de
// cargo e de estágio das outras. Assim a pauta do blog e o e-mail de novidade
// valem também para o que saiu no diário oficial.

import { normalizar } from "../monitor/lib/estados";
import { bancoConfigurado, garantirEsquema, sql } from "./db";

export interface PublicacaoVigia {
  uf: string;
  /** "diario" | "noticia" */
  canal: string;
  fonte: string;
  titulo: string;
  resumo: string;
  link: string;
  data: string | null;
}

function chaveDa(p: PublicacaoVigia): string {
  return `${p.uf}|${normalizar(p.titulo).replace(/\s+/g, " ").trim().slice(0, 200)}`;
}

/** Grava o que ainda não existia. Devolve quantas eram novas; `null` sem banco. */
export async function gravarPublicacoes(lista: PublicacaoVigia[]): Promise<number | null> {
  if (!bancoConfigurado()) return null;
  await garantirEsquema();
  const s = sql();
  let novas = 0;
  for (const p of lista) {
    const linhas = (await s.query(
      `insert into vigia_publicacoes (chave, uf, canal, fonte, titulo, resumo, link, data)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (chave) do nothing
       returning chave`,
      [chaveDa(p), p.uf, p.canal, p.fonte, p.titulo, p.resumo.slice(0, 1000), p.link, p.data],
    )) as unknown[];
    if (linhas.length) novas++;
  }
  return novas;
}

/** As publicações dos últimos `dias`, mais nova primeiro. Nunca lança. */
export async function lerPublicacoesVigia(dias = 730): Promise<PublicacaoVigia[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select * from vigia_publicacoes
        where coalesce(data, visto_em) > now() - ($1 || ' days')::interval
        order by coalesce(data, visto_em) desc`,
      [String(dias)],
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({
      uf: String(l.uf),
      canal: String(l.canal),
      fonte: String(l.fonte),
      titulo: String(l.titulo),
      resumo: String(l.resumo ?? ""),
      link: String(l.link),
      data: new Date(String(l.data ?? l.visto_em)).toISOString(),
    }));
  } catch (e) {
    console.error("Falha ao ler o vigia:", e instanceof Error ? e.message : e);
    return [];
  }
}
