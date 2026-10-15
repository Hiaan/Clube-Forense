// Entrada da pesquisa de editais que roda na AWS (serviço pesquisa-editais no servidor da
// Clarear, repositório agenciaclarear, minuto 7 de cada hora).
//
// A função da AWS entrega o que achou nos diários oficiais e no Google
// Notícias. Esta rota só guarda (vigiaRepo.ts): quem filtra, dá o estágio,
// abre pauta e avisa por e-mail é a coleta de hora em hora (/api/cron), que lê
// o que ficou guardado como mais uma fonte.
//
// Autorização: VIGIA_SEGREDO (segredo só do vigia) ou, na falta dele, o
// CRON_SECRET.

import { revalidatePath } from "next/cache";

import { gravarPublicacoes, type PublicacaoVigia } from "../../lib/vigiaRepo";
import { ESTADO_POR_UF } from "../../monitor/lib/estados";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const segredo = process.env.VIGIA_SEGREDO || process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  let corpo: { publicacoes?: unknown[]; saude?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return new Response("Corpo inválido", { status: 400 });
  }

  const lista: PublicacaoVigia[] = [];
  for (const bruto of Array.isArray(corpo.publicacoes) ? corpo.publicacoes : []) {
    const p = bruto as Record<string, unknown>;
    const uf = String(p.uf ?? "");
    if (!ESTADO_POR_UF[uf] || !p.titulo || !p.link) continue;
    const data = p.data && !Number.isNaN(Date.parse(String(p.data))) ? new Date(String(p.data)).toISOString() : null;
    lista.push({
      uf,
      canal: p.canal === "diario" ? "diario" : "noticia",
      fonte: String(p.fonte || (p.canal === "diario" ? `Diário Oficial ${uf}` : "Google Notícias")).slice(0, 200),
      titulo: String(p.titulo).slice(0, 300),
      resumo: String(p.resumo ?? ""),
      link: String(p.link),
      data,
    });
  }

  const novas = await gravarPublicacoes(lista);
  if (novas === null) return new Response("Banco não configurado", { status: 503 });

  // Uma linha por entrega no log da Vercel, como a do cron.
  console.log(`vigia: ${lista.length} recebidas, ${novas} novas, saude=${JSON.stringify(corpo.saude ?? null)}`);
  if (novas > 0) revalidatePath("/monitor");

  return Response.json({ ok: true, recebidas: lista.length, novas });
}
