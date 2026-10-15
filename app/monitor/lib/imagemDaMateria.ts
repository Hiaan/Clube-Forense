// Pega a imagem de abertura da matéria de origem e guarda uma cópia nossa.
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
// NADA DISSO VAI AO AR SOZINHO. O rascunho nasce em revisão; quem aprova vê a
// capa, o crédito e decide. Imagem de agência tem licença que não nos alcança,
// e esse julgamento é humano.

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
        // Portal que serve og:image relativa existe; sem resolver contra a
        // base, a URL não baixa.
        return new URL(achou[1].trim(), base).toString();
      } catch {
        continue;
      }
    }
  }
  return null;
}

export interface CapaEncontrada {
  /** URL na nossa store. */
  url: string;
}

/**
 * Procura a imagem da matéria e devolve a cópia guardada, ou `null`.
 *
 * Nunca lança. Capa é enfeite: se qualquer passo falhar — o portal recusa o
 * robô, a página não tem og:image, a store não está configurada — o rascunho
 * nasce sem imagem e a vida segue.
 */
export async function buscarImagemDaMateria(link: string): Promise<CapaEncontrada | null> {
  if (!blobConfigurado()) return null;

  const pagina = enderecoPublico(link);
  if (!pagina) return null;

  const resposta = await buscarComPrazo(pagina.toString(), "text/html");
  if (!resposta) return null;

  // Google Notícias responde com uma página de redirecionamento por JavaScript,
  // que não tem og:image nenhuma. Não é erro — é só não haver o que pegar.
  const html = await resposta.text().catch(() => "");
  if (!html) return null;

  // A base é a URL FINAL, depois dos redirecionamentos: resolver uma og:image
  // relativa contra o endereço do Google News daria um endereço inexistente.
  const finalUrl = enderecoPublico(resposta.url || pagina.toString());
  if (!finalUrl) return null;

  const endereco = imagemNoHtml(html, finalUrl);
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
    return { url };
  } catch {
    return null;
  }
}
