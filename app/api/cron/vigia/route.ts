// O vigia de editais, de hora em hora no minuto 7 (vercel.json), em São Paulo.
//
// Busca o Google Notícias das últimas 48 h e os diários oficiais com busca
// automática (vigiaMotor.mjs) e guarda o que é do cargo em vigia_publicacoes.
// A coleta do minuto 17 (/api/cron) lê dali como mais uma fonte — é ela que dá
// o estágio, abre pauta e manda o e-mail.
//
// Roda em São Paulo (gru1) porque diário oficial costuma barrar IP de fora do
// Brasil.

import { gravarPublicacoes, type PublicacaoVigia } from "../../../lib/vigiaRepo";
import { ESTADO_POR_UF } from "../../../monitor/lib/estados";
import { diarios, noticias, relevancia, ufDoTexto, type ItemVigia } from "../../../monitor/lib/vigiaMotor.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const preferredRegion = "gru1";

function paraGuardar(i: ItemVigia, uf: string): PublicacaoVigia {
  const titulo = String(i.titulo || "").slice(0, 300);
  const texto = String(i.texto || "");
  return {
    uf,
    canal: i.canal === "diario" ? "diario" : "noticia",
    fonte: String(i.fonte || "").slice(0, 200),
    titulo,
    // O texto sem o título repetido na frente.
    resumo: (texto.startsWith(titulo) ? texto.slice(titulo.length) : texto).trim().slice(0, 1000),
    link: i.link,
    data: i.data && !Number.isNaN(Date.parse(i.data)) ? new Date(i.data).toISOString() : null,
  };
}

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (segredo && request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  const inicio = Date.now();
  const [news, dos] = await Promise.all([noticias(), diarios()]);

  const lista: PublicacaoVigia[] = [];
  for (const i of dos.itens) {
    if (i.uf && ESTADO_POR_UF[i.uf] && relevancia(i.texto)) lista.push(paraGuardar(i, i.uf));
  }
  for (const i of news.itens) {
    if (!relevancia(i.texto)) continue;
    // A UF vem do texto, nunca da consulta: a busca "Pernambuco" também traz
    // matéria do Maranhão.
    const uf = ufDoTexto(i.texto);
    if (uf && ESTADO_POR_UF[uf]) lista.push(paraGuardar(i, uf));
  }

  const novas = await gravarPublicacoes(lista);

  const resumo = {
    ok: novas !== null,
    segundos: Math.round((Date.now() - inicio) / 1000),
    noticias: `${news.ok}/${news.total}`,
    diarios: `${dos.ok}/${dos.total}`,
    falhas: dos.falhas,
    relevantes: lista.length,
    novas,
  };
  // Uma linha por passada no log da Vercel, como a do /api/cron.
  console.log(`vigia: ${JSON.stringify(resumo)}`);
  return Response.json(resumo);
}
