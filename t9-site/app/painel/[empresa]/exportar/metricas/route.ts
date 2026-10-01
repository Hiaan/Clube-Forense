import { consulta } from "@/lib/painel/db";
import { lerData } from "@/lib/painel/csv";
import { acessoExportacao, respostaCsv } from "../csv";

/** Métricas por dia e campanha. Aceita ?inicio=AAAA-MM-DD&fim=AAAA-MM-DD. */
export async function GET(request: Request, { params }: { params: Promise<{ empresa: string }> }) {
  const acesso = await acessoExportacao(params);
  if (!acesso) return new Response("Não encontrado", { status: 404 });
  const { usuario, empresa } = acesso;
  const url = new URL(request.url);
  const inicio = lerData(url.searchParams.get("inicio") ?? "") ?? "2000-01-01";
  const fim = lerData(url.searchParams.get("fim") ?? "") ?? "2100-01-01";
  const linhas = await consulta<{ data: string; plataforma: string; campanha: string; gasto: number; impressoes: number; cliques: number; leads: number; conversoes: number; receita: number }>(
    `select data, plataforma, campanha, gasto, impressoes, cliques, leads, conversoes, receita
       from metricas where empresa_id = $1 and data between $2 and $3 order by data, plataforma, campanha`,
    [empresa.id, inicio, fim],
  );
  return respostaCsv(
    `metricas-${empresa.slug}.csv`,
    ["data", "plataforma", "campanha", "gasto", "impressoes", "cliques", "leads", "conversoes", "receita"],
    linhas.map((l) => [l.data, l.plataforma, l.campanha, l.gasto, l.impressoes, l.cliques, l.leads, l.conversoes, l.receita]),
    usuario.idioma,
  );
}
