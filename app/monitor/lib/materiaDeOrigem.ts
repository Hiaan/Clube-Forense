// O que a matéria de origem conta sobre si: a imagem de abertura e a descrição
// que ela publica para as redes sociais.
//
// POR QUE A DESCRIÇÃO IMPORTA TANTO QUANTO A IMAGEM. Metade das nossas fontes
// não manda resumo: o sitemap de notícias do QConcursos traz título e data, e
// nada mais. Com publicação automática, um post feito só de manchete seria o
// blog repetindo a chamada de outro veículo sem dizer nada. A og:description é
// o parágrafo que o próprio veículo escolheu como resumo da matéria — citá-la
// entre aspas, creditada, é a diferença entre um post e um eco.
//
// POR QUE NÃO "BUSCAR NO GOOGLE": buscar imagem por assunto devolve foto de
// qualquer um, sem licença e sem contexto — é assim que um post sobre a PC-TO
// acaba ilustrado com a fachada de outro estado. A imagem que a própria matéria
// escolheu para si (a og:image) é a única que se sabe ser daquele assunto, e
// vem com um dono identificável: o veículo, que o rascunho credita.
//
// POR QUE COPIAR EM VEZ DE APONTAR: apontar para o servidor do veículo é
// hotlink — consome banda dele e some quando ele reorganiza o site, deixando o
// post sem capa meses depois. A cópia fica na nossa store, com o crédito ao
// lado.
//
// O QUE VAI AO AR SOZINHO, E O QUE NÃO VAI. O texto do rascunho completo é
// publicado pelo monitor sem espera (ver pautas.ts), e a capa viaja com ele
// creditada ao veículo de origem. A licença de uma foto de agência não nos
// alcança, então o aviso por e-mail de cada post publicado traz o link: quem
// recebe abre, olha a capa e troca ou tira em dois cliques. É uma revisão
// depois em vez de uma revisão antes — a troca que o pedido fez de propósito,
// porque notícia de concurso parada na fila não serve a ninguém.

import { put } from "@vercel/blob";

import { blobConfigurado } from "../../lib/blob";

const TIMEOUT_MS = 8_000;
/** Teto da imagem baixada. Capa de portal fica bem abaixo disso. */
const TAMANHO_MAXIMO = 2_000_000;

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const EXTENSAO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Endereços que não valem a pena seguir.
 *
 * A URL vem de um feed RSS, ou seja, de fora. Buscar de dentro do nosso
 * servidor um endereço que outra pessoa escolheu é exatamente a forma de um
 * terceiro nos usar para alcançar o que só nós alcançamos — a rede interna da
 * Vercel, o serviço de metadados da nuvem, um `localhost` qualquer. Só http e
 * https, e nada que aponte para nome ou IP de rede privada.
 */
function enderecoPublico(bruto: string): URL | null {
  let u: URL;
  try {
    u = new URL(bruto);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    return null;
  }
  // IPv4 literal em faixa privada, e o endereço de metadados das nuvens.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || a === 169) return null;
    if (a === 172 && b >= 16 && b <= 31) return null;
    if (a === 192 && b === 168) return null;
  }
  // IPv6 literal: nenhum caso legítimo aqui, e analisar faixa de IPv6 direito é
  // trabalhoso o bastante para não valer o risco de errar.
  if (host.includes(":")) return null;

  return u;
}

async function buscarComPrazo(url: string, aceita: string): Promise<Response | null> {
  const corte = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: corte,
      headers: {
        accept: aceita,
        // Alguns portais devolvem 403 para cliente sem user-agent. Identificar
        // o robô é mais honesto que fingir ser um navegador — e quem não quiser
        // ser lido pode bloquear por aqui.
        "user-agent": "ClubeForenseBot/1.0 (+https://clubeforense.com.br)",
      },
      redirect: "follow",
    });
    return r.ok ? r : null;
  } catch {
    return null;
  }
}

/**
 * Tira a og:image do HTML.
 *
 * Regex, e não um parser de HTML: o que precisa ser lido são duas meta tags no
 * começo do documento, e trazer um parser para isso custaria mais que o
 * problema. O risco de regex em HTML é casar errado — aqui, casar errado
 * devolve uma URL que não baixa, e o post fica sem capa.
 */
function imagemNoHtml(html: string, base: URL): string | null {
  const cabeca = html.slice(0, 200_000);
  const padroes = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const p of padroes) {
    const achou = cabeca.match(p);
    if (achou?.[1]) {
      try {
        // O `&amp;` precisa virar `&` antes de a URL ser montada: o
        // QConcursos serve a capa por um redimensionador com cinco parâmetros
        // (`?image=...&fit=cover&width=1280`), e dentro do HTML eles vêm
        // escapados. Sem desescapar, o pedido sai com `&amp;fit` como nome de
        // parâmetro e a imagem volta errada ou não volta.
        const endereco = achou[1].trim().replace(/&amp;/g, "&");
        // Portal que serve og:image relativa existe; sem resolver contra a
        // base, a URL não baixa.
        return new URL(endereco, base).toString();
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Tira a descrição do HTML: og:description primeiro, meta description depois.
 *
 * A ordem não é arbitrária. A og:description é escrita para ser lida fora do
 * site — é o que aparece quando a matéria é compartilhada — e por isso resume
 * o fato. A meta description de muitos portais é a mesma frase institucional
 * em todas as páginas ("as últimas notícias de concursos"), que como resumo de
 * post não diz nada. Fica como segunda opção, e o corte de tamanho mínimo
 * abaixo descarta as mais vazias.
 */
function descricaoNoHtml(html: string): string | null {
  const cabeca = html.slice(0, 200_000);
  const padroes = [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const padrao of padroes) {
    const achou = cabeca.match(padrao);
    const bruto = achou?.[1]?.trim();
    if (!bruto) continue;
    const limpo = bruto
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    // Menos que isto não é resumo, é etiqueta.
    if (limpo.length >= 60) return limpo.slice(0, 600);
  }
  return null;
}

export interface MateriaDeOrigem {
  /** Cópia da capa na nossa store. `null` quando não deu para pegar. */
  capaUrl: string | null;
  /** O resumo que o veículo publica para as redes. `null` quando não há. */
  descricao: string | null;
}

/**
 * Abre a matéria de origem e devolve o que der para aproveitar dela.
 *
 * Nunca lança, e nunca devolve `null` por falta de uma das duas coisas: capa e
 * descrição falham por motivos diferentes (portal sem og:image, portal que
 * recusa o robô, store não configurada) e uma não deve levar a outra embora. O
 * que não vier volta `null` no seu campo e o post se arranja sem.
 */
export async function lerMateria(link: string): Promise<MateriaDeOrigem> {
  const vazio: MateriaDeOrigem = { capaUrl: null, descricao: null };

  const pagina = enderecoPublico(link);
  if (!pagina) return vazio;

  const resposta = await buscarComPrazo(pagina.toString(), "text/html");
  if (!resposta) return vazio;

  // Google Notícias responde com uma página de redirecionamento por JavaScript,
  // que não tem metadado nenhum. Não é erro — é só não haver o que pegar.
  const html = await resposta.text().catch(() => "");
  if (!html) return vazio;

  const descricao = descricaoNoHtml(html);

  // A base é a URL FINAL, depois dos redirecionamentos: resolver uma og:image
  // relativa contra o endereço do Google News daria um endereço inexistente.
  const finalUrl = enderecoPublico(resposta.url || pagina.toString());
  if (!finalUrl) return { capaUrl: null, descricao };

  const capaUrl = await copiarCapa(html, finalUrl);
  return { capaUrl, descricao };
}

/** Acha a og:image, baixa e guarda uma cópia nossa. `null` em qualquer tropeço. */
async function copiarCapa(html: string, base: URL): Promise<string | null> {
  if (!blobConfigurado()) return null;

  const endereco = imagemNoHtml(html, base);
  if (!endereco) return null;

  const imagemUrl = enderecoPublico(endereco);
  if (!imagemUrl) return null;

  const img = await buscarComPrazo(imagemUrl.toString(), "image/*");
  if (!img) return null;

  const tipo = (img.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TIPOS.includes(tipo)) return null;

  const tamanho = Number(img.headers.get("content-length") ?? 0);
  if (tamanho > TAMANHO_MAXIMO) return null;

  const bytes = await img.arrayBuffer().catch(() => null);
  // O content-length pode mentir ou faltar; confere de novo com o que chegou.
  if (!bytes || bytes.byteLength === 0 || bytes.byteLength > TAMANHO_MAXIMO) return null;

  try {
    const { url } = await put(`blog/capa.${EXTENSAO[tipo]}`, bytes, {
      access: "public",
      addRandomSuffix: true,
      contentType: tipo,
    });
    return url;
  } catch {
    return null;
  }
}
