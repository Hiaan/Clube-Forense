// Registro das bancas organizadoras e seus sites oficiais — onde os editais
// realmente são publicados. Usado como:
//   1. FONTE de coleta: os domínios entram nas buscas `site:` do coletor
//      (ver fontes.ts), trazendo páginas de concurso das próprias bancas.
//   2. LINK de verificação: o nome da banca vira link para o site oficial nos
//      blocos de histórico do monitor.
//
// URLs conferidas por busca web em jul/2026. Bancas extintas (Funcab, Fundação
// Universa) não entram — o nome aparece sem link, sem quebrar nada.

import { normalizar } from "./estados";

export interface Banca {
  chave: string;
  nome: string;
  url: string;
}

const REGISTRO: Record<string, { nome: string; url: string }> = {
  cebraspe: { nome: "Cebraspe", url: "https://www.cebraspe.org.br/concursos/" },
  fgv: { nome: "FGV", url: "https://conhecimento.fgv.br/concursos" },
  vunesp: { nome: "VUNESP", url: "https://www.vunesp.com.br/" },
  iades: { nome: "IADES", url: "https://www.iades.com.br/" },
  aocp: { nome: "Instituto AOCP", url: "https://www.institutoaocp.org.br/" },
  ibfc: { nome: "IBFC", url: "https://www.ibfc.org.br/" },
  fepese: { nome: "FEPESE", url: "https://www.fepese.org.br/" },
  fundatec: { nome: "FUNDATEC", url: "https://www.fundatec.org.br/" },
  idecan: { nome: "IDECAN", url: "https://www.idecan.org.br/" },
  fcc: { nome: "FCC", url: "https://www.concursosfcc.com.br/" },
  cesgranrio: { nome: "Cesgranrio", url: "https://www.cesgranrio.org.br/" },
  selecon: { nome: "SELECON", url: "https://selecon.org.br/" },
  ceperj: { nome: "CEPERJ", url: "https://www.ceperj.rj.gov.br/" },
  consulplan: { nome: "Instituto Consulplan", url: "https://www.institutoconsulplan.org.br/" },
  selecao: { nome: "Instituto Seleção", url: "https://institutoselecao.org.br/" },
  fadesp: { nome: "FADESP", url: "https://portalfadesp.org.br/" },
  fapec: { nome: "FAPEC", url: "https://fundacaofapec.org.br/" },
  quadrix: { nome: "Quadrix", url: "https://www.quadrix.org.br/" },
  ibade: { nome: "IBADE", url: "https://www.ibade.org.br/" },
};

// Trechos (normalizados) que apontam para cada banca, do mais específico ao mais
// curto — o coletor/UI resolvem o nome livre citado numa notícia ou no histórico.
const NECESSIDADES: { needle: string; chave: string }[] = [
  { needle: "instituto consulplan", chave: "consulplan" },
  { needle: "instituto selecao", chave: "selecao" },
  { needle: "instituto aocp", chave: "aocp" },
  { needle: "carlos chagas", chave: "fcc" },
  { needle: "cesgranrio", chave: "cesgranrio" },
  { needle: "cebraspe", chave: "cebraspe" },
  { needle: "cespe", chave: "cebraspe" },
  { needle: "fundatec", chave: "fundatec" },
  { needle: "consulplan", chave: "consulplan" },
  { needle: "quadrix", chave: "quadrix" },
  { needle: "selecon", chave: "selecon" },
  { needle: "fepese", chave: "fepese" },
  { needle: "vunesp", chave: "vunesp" },
  { needle: "idecan", chave: "idecan" },
  { needle: "ceperj", chave: "ceperj" },
  { needle: "fadesp", chave: "fadesp" },
  { needle: "fapec", chave: "fapec" },
  { needle: "ibade", chave: "ibade" },
  { needle: "iades", chave: "iades" },
  { needle: "aocp", chave: "aocp" },
  { needle: "ibfc", chave: "ibfc" },
  { needle: "fgv", chave: "fgv" },
  { needle: "fcc", chave: "fcc" },
].sort((a, b) => b.needle.length - a.needle.length);

/** Resolve um texto livre (ex.: "Instituto AOCP", "FGV") para a banca. */
export function resolverBanca(raw?: string | null): Banca | null {
  if (!raw) return null;
  const t = normalizar(raw);
  for (const { needle, chave } of NECESSIDADES) {
    if (t.includes(needle)) {
      return { chave, ...REGISTRO[chave] };
    }
  }
  return null;
}

/** Lista de bancas para exibição (ordenada por nome). */
export const BANCAS_LISTA: Banca[] = Object.entries(REGISTRO)
  .map(([chave, v]) => ({ chave, ...v }))
  .sort((a, b) => a.nome.localeCompare(b.nome));

/** Domínios das bancas (sem protocolo/www/caminho) para as buscas `site:`. */
export const BANCAS_DOMINIOS: string[] = BANCAS_LISTA.map((b) =>
  b.url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, ""),
);
