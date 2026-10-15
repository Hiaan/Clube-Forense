// Como o blog recorta o que publica: por órgão, por estado e por tipo de
// conteúdo.
//
// Os três eixos existem porque a pessoa chega por caminhos diferentes. Quem
// estuda para a Politec-PE quer tudo da Politec-PE, e não "notícias de
// Pernambuco" — num estado pode haver certame da Polícia Civil e da Perícia ao
// mesmo tempo. Quem está escolhendo onde prestar quer o estado inteiro. E quem
// já passou da escolha quer conteúdo de medicina legal, de qualquer lugar.
//
// O eixo do órgão não é inventado aqui: sai de NOMES_CARGO_POR_UF, que já
// guarda o nome oficial de quem realiza o certame em cada estado, conferido no
// último edital. Duplicar essa lista criaria duas verdades que divergiriam na
// primeira renomeação.

import { ESTADOS } from "../../monitor/lib/estados";
import { NOMES_CARGO_POR_UF } from "../../monitor/lib/nomenclaturas";

/* ------------------------------------------------------------------ órgãos */

export interface Orgao {
  /** Pedaço da URL: 'politec-pe'. */
  slug: string;
  /** Como aparece no filtro: 'Politec-PE'. Curto, porque é um botão. */
  curto: string;
  /** Nome por extenso, para o título da página e o SEO. */
  completo: string;
  uf: string;
  /** Nome do estado, para o filtro poder ser procurado por ele também. */
  estado: string;
}

/**
 * Tira a sigla de dentro do nome oficial.
 *
 * Os nomes vêm em dois formatos — "Polícia Civil de Minas Gerais (PC-MG)" e
 * "Politec-PE (SDS-PE)" —, e o que cabe num botão de filtro é a sigla. Quando
 * não há parênteses, o próprio nome já é curto ("ITEP-RN", "Politec-MT").
 */
function sigla(completo: string): string {
  const entre = completo.match(/\(([^)]+)\)/);
  if (entre) {
    // "Politec-PE (SDS-PE)": o que identifica é o que vem ANTES, não a
    // secretaria que aparece entre parênteses.
    const antes = completo.slice(0, entre.index).trim();
    return antes.length <= 14 ? antes : entre[1];
  }
  return completo;
}

/** Slug a partir de qualquer texto: sem acento, minúsculo, hífens no lugar do resto. */
export function aSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const NOME_ESTADO = new Map(ESTADOS.map((e) => [e.uf, e.nome]));

/** Um por estado, na ordem alfabética do nome curto. */
export const ORGAOS: Orgao[] = Object.values(NOMES_CARGO_POR_UF)
  .map((c) => {
    const curto = sigla(c.orgao);
    return {
      slug: aSlug(curto),
      curto,
      completo: c.orgao,
      uf: c.uf,
      estado: NOME_ESTADO.get(c.uf) ?? c.uf,
    };
  })
  .sort((a, b) => a.curto.localeCompare(b.curto, "pt-BR"));

const POR_SLUG = new Map(ORGAOS.map((o) => [o.slug, o]));
const POR_UF = new Map(ORGAOS.map((o) => [o.uf, o]));

export function orgaoPorSlug(slug: string): Orgao | null {
  return POR_SLUG.get(slug) ?? null;
}

/** O órgão do estado. É o que o robô usa para marcar o post que ele rascunha. */
export function orgaoDaUf(uf: string): Orgao | null {
  return POR_UF.get(uf.toUpperCase()) ?? null;
}

/* ------------------------------------------------------------- categorias */

export interface Categoria {
  slug: string;
  nome: string;
  /** Uma linha explicando o recorte. Aparece no topo da página da categoria. */
  descricao: string;
}

/**
 * Os tipos de conteúdo.
 *
 * Lista fechada, e não marcador livre: categoria que qualquer um inventa vira,
 * em seis meses, "notícia", "notícias" e "noticia" convivendo como se fossem
 * três coisas — e o filtro deixa de funcionar justamente para quem usa.
 */
export const CATEGORIAS: Categoria[] = [
  {
    slug: "noticia",
    nome: "Notícias",
    descricao: "O que saiu sobre os concursos: autorização, banca, comissão, cronograma.",
  },
  {
    slug: "edital",
    nome: "Editais",
    descricao: "Edital publicado, com o que muda para quem já estava estudando.",
  },
  {
    slug: "conteudo",
    nome: "Conteúdo de prova",
    descricao: "Medicina legal na prática da prova: tanatologia, traumatologia, toxicologia.",
  },
  {
    slug: "carreira",
    nome: "Carreira",
    descricao: "Salário, plano de cargos, atribuições e onde o aprovado é lotado.",
  },
  {
    slug: "aprovados",
    nome: "Aprovados",
    descricao: "Quem passou, como estudou e quanto tempo levou.",
  },
  {
    slug: "guia",
    nome: "Guias",
    descricao: "Passo a passo para quem está começando agora.",
  },
];

const CATEGORIA_POR_SLUG = new Map(CATEGORIAS.map((c) => [c.slug, c]));

export function categoriaPorSlug(slug: string): Categoria | null {
  return CATEGORIA_POR_SLUG.get(slug) ?? null;
}

/** Nome da categoria, ou o próprio slug se alguém gravou uma que não existe mais. */
export function nomeCategoria(slug: string): string {
  return CATEGORIA_POR_SLUG.get(slug)?.nome ?? slug;
}

/* ----------------------------------------------------------------- estados */

/** Os 27, para o filtro por estado. Mesma fonte do mapa. */
export const ESTADOS_FILTRO = ESTADOS.map((e) => ({ uf: e.uf, nome: e.nome }));

export function nomeEstado(uf: string | null): string | null {
  if (!uf) return null;
  return NOME_ESTADO.get(uf.toUpperCase()) ?? uf;
}

/**
 * Artigo que acompanha o nome do estado numa frase.
 *
 * Não dá para derivar da terminação: "o Amapá" e "a Paraíba" são ambos de "á",
 * e metade dos estados não leva artigo nenhum ("em Pernambuco", "veja Goiás").
 * Como são 27 e a lista não muda, a tabela é a resposta certa — a alternativa
 * é escrever "Veja em que etapa Maranhão está", que soa como tradução
 * automática.
 */
const ARTIGO: Record<string, string> = {
  AC: "o", AP: "o", AM: "o", CE: "o", DF: "o", ES: "o", MA: "o", MT: "o",
  MS: "o", PA: "o", PR: "o", PI: "o", RJ: "o", RN: "o", RS: "o", TO: "o",
  BA: "a", PB: "a",
  // Sem artigo: Alagoas, Goiás, Minas Gerais, Pernambuco, Rondônia, Roraima,
  // Santa Catarina, São Paulo e Sergipe.
};

/** "o Maranhão", "a Bahia", "Minas Gerais". `null` quando não há estado. */
export function estadoComArtigo(uf: string | null): string | null {
  const nome = nomeEstado(uf);
  if (!nome || !uf) return null;
  const artigo = ARTIGO[uf.toUpperCase()];
  return artigo ? `${artigo} ${nome}` : nome;
}
