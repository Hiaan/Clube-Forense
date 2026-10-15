// Importa o blog antigo (Wix) para cá.
//
// O QUE VEM E O QUE NÃO VEM. O feed do Wix entrega título, data, capa, autor,
// endereço original e um resumo — e só. O corpo do post é montado no navegador
// de quem lê, por chamada à API do Wix que exige um token gerado na própria
// página; de fora, nem o HTML servido nem o feed trazem o texto. Então o que
// esta importação cria é a FICHA do post pronta — título, data, capa, estado,
// órgão, categoria, endereço e procedência —, com o resumo no lugar do corpo e
// um aviso dizendo o que falta.
//
// Isso é de propósito melhor que o contrário. O trabalho chato da migração é
// classificar vinte posts um a um; copiar o texto de um post aberto ao lado
// leva segundos. E publicar automaticamente um resumo truncado com link para o
// original seria pior que não migrar: dois endereços nossos competindo pelo
// mesmo assunto, nenhum dos dois completo.
//
// Para trazer o texto junto, o caminho é o export do painel do Wix (Blog →
// Mais ações → Exportar), que sai com o corpo inteiro. Quando esse arquivo
// existir, ele entra por aqui também.

import {
  abrirRascunhoDoRobo,
  preencherTextosImportados,
  type PostParaGravar,
} from "../../lib/postsRepo";
import { TEXTOS_IMPORTADOS } from "../../blog/lib/textosImportados";
import { aSlug, orgaoDaUf } from "../../blog/lib/taxonomia";
import { ESTADOS, normalizar } from "./estados";

const FEED = "https://www.clubeforense.com.br/blog-feed.xml";
const TIMEOUT_MS = 20_000;

export interface ItemAntigo {
  titulo: string;
  resumo: string;
  link: string;
  data: string | null;
  capa: string | null;
  autor: string | null;
}

/** Tira o conteúdo de uma tag, com ou sem CDATA. */
function tag(xml: string, nome: string): string | null {
  // `[\s\S]` no lugar de `.` com a flag `s`: o alvo de compilação deste
  // projeto não aceita a flag, e o resumo do Wix tem quebra de linha dentro.
  const achou = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`));
  if (!achou) return null;
  const bruto = achou[1].trim();
  const cdata = bruto.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return (cdata ? cdata[1] : bruto).trim() || null;
}

/**
 * Lê o feed e devolve os itens.
 *
 * Sem biblioteca de XML: o feed tem uma forma só, conhecida, e trazer um parser
 * para extrair sete campos custaria mais que o problema. O que não casar vira
 * item ignorado, nunca exceção.
 */
export async function lerBlogAntigo(url = FEED): Promise<ItemAntigo[]> {
  let xml: string;
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "ClubeForenseBot/1.0 (+https://clubeforense.com.br)" },
    });
    if (!r.ok) return [];
    xml = await r.text();
  } catch {
    return [];
  }

  const itens: ItemAntigo[] = [];
  for (const bruto of xml.match(/<item>[\s\S]*?<\/item>/g) ?? []) {
    const titulo = tag(bruto, "title");
    const link = tag(bruto, "link");
    if (!titulo || !link) continue;

    const data = tag(bruto, "pubDate");
    const capa = bruto.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ?? null;

    itens.push({
      titulo,
      // O Wix corta o resumo com reticências. Mantidas: são a marca de que o
      // texto continua, e quem revisa precisa ver isso.
      resumo: tag(bruto, "description") ?? "",
      link,
      data: data ? new Date(data).toISOString() : null,
      capa,
      autor: tag(bruto, "dc:creator"),
    });
  }
  return itens;
}

/* --------------------------------------------------------- classificação */

/**
 * Siglas de órgão que aparecem nos títulos do blog antigo.
 *
 * Existe porque o nome do estado quase nunca está escrito por extenso ali: o
 * título diz "PCDF", "IGP‑RS", "Politec PE". Procurar "Distrito Federal" num
 * título desses não acha nada, e o post entraria como nacional.
 *
 * Os hífens já vêm normalizados — `normalizar()` tira acento e baixa a caixa,
 * e o hífen tipográfico (‑, U+2011) que o Wix usa em "IGP‑RS" vira o comum
 * antes da comparação.
 */
const SIGLAS: [RegExp, string][] = [
  [/\bpc\s*-?\s*to\b|tocantins/, "TO"],
  [/\bpc\s*-?\s*pi\b|policia civil pi\b|piaui/, "PI"],
  [/\bpcdf\b|\bpc\s*-?\s*df\b|distrito federal/, "DF"],
  [/\bigp\s*-?\s*rs\b|rio grande do sul/, "RS"],
  [/\bpc\s*-?\s*mg\b|minas gerais/, "MG"],
  [/\bpc\s*-?\s*ac\b|\bacre\b/, "AC"],
  [/\bpc\s*-?\s*ma\b|pericia oficial ma\b|maranhao/, "MA"],
  [/politec\s*-?\s*pe\b|pernambuco/, "PE"],
  [/policia cientifica (de )?(sc|santa catarina)|santa catarina/, "SC"],
  [/policia cientifica (de )?(go|goias)|goias/, "GO"],
];

/** A UF do post, pelo título. `null` quando o assunto não é de um estado. */
export function ufDoTitulo(titulo: string): string | null {
  const t = normalizar(titulo.replace(/‑/g, "-"));

  for (const [padrao, uf] of SIGLAS) if (padrao.test(t)) return uf;

  // Último recurso: o nome do estado por extenso. Vem depois das siglas porque
  // é mais raro e mais ambíguo.
  for (const e of ESTADOS) if (t.includes(normalizar(e.nome))) return e.uf;

  return null;
}

/**
 * A categoria, pelo título.
 *
 * "Edital publicado" é a única distinção que o título sustenta sozinho. O resto
 * é notícia de andamento — e quem revisa troca em um clique se discordar.
 */
export function categoriaDoTitulo(titulo: string): string {
  const t = normalizar(titulo);
  return /edital (publicado|.{0,12}publicado)|^edital |publicado!/.test(t) ? "edital" : "noticia";
}

/* ------------------------------------------------------------ importação */

/** Corpo do rascunho: o resumo que o feed deu, e o aviso do que falta. */
function corpo(item: ItemAntigo): string {
  return [
    item.resumo,
    "",
    "---",
    "",
    "<!-- TEXTO INCOMPLETO. O resumo acima é o que o feed do blog antigo",
    "     entrega; o corpo do post é montado no navegador e não sai de fora.",
    `     Abra ${item.link} e cole o texto no lugar deste aviso. -->`,
  ].join("\n");
}

export interface ResultadoImportacao {
  encontrados: number;
  importados: number;
  jaExistiam: number;
  /** Quantos ganharam o texto completo que está no código. */
  comTexto: number;
  titulos: string[];
}

/**
 * Traz o blog antigo para a fila de revisão.
 *
 * Idempotente pelo endereço de origem: rodar duas vezes não duplica, e rodar
 * daqui a um mês traz só o que foi publicado no meio tempo. Quem já estiver
 * aqui é contado como `jaExistiam`, para a mensagem do painel poder dizer que
 * não houve nada de novo em vez de parecer que falhou.
 */
export async function importarBlogAntigo(url = FEED): Promise<ResultadoImportacao> {
  const itens = await lerBlogAntigo(url);
  const titulos: string[] = [];
  let jaExistiam = 0;

  for (const item of itens) {
    const uf = ufDoTitulo(item.titulo);

    const pauta: PostParaGravar = {
      // A data entra no slug porque o blog antigo repete manchete entre
      // certames ("PC-TO: Edital até novembro!" vale para mais de um ano).
      slug: aSlug(`${(item.data ?? "").slice(0, 10)} ${item.titulo}`).slice(0, 80),
      titulo: item.titulo.slice(0, 200),
      resumo: item.resumo.slice(0, 400),
      corpo: corpo(item),
      capaUrl: item.capa,
      // A foto é nossa: o blog antigo é do Clube. O crédito nomeia a origem
      // para quem revisa saber de onde a imagem veio.
      capaCredito: "Blog do Clube Forense",
      uf,
      orgao: uf ? (orgaoDaUf(uf)?.slug ?? null) : null,
      categoria: categoriaDoTitulo(item.titulo),
      origem: "robo",
      fonteNome: "Blog do Clube Forense",
      fonteUrl: item.link,
      status: "revisao",
      publicadoEm: item.data,
    };

    if (await abrirRascunhoDoRobo(pauta)) titulos.push(pauta.titulo);
    else jaExistiam++;
  }

  // Depois de criar, preenche o corpo de quem já tem texto transcrito. Vem
  // aqui, e não num passo à parte, porque é o mesmo movimento: quem aperta o
  // botão quer os posts prontos, não os posts criados.
  const comTexto = await preencherTextosImportados(TEXTOS_IMPORTADOS);

  return {
    encontrados: itens.length,
    importados: titulos.length,
    jaExistiam,
    comTexto,
    titulos,
  };
}
