import { listarLeads } from "@/lib/painel/dados";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { acessoExportacao, respostaCsv } from "../csv";

export async function GET(_: Request, { params }: { params: Promise<{ empresa: string }> }) {
  const acesso = await acessoExportacao(params);
  if (!acesso) return new Response("Não encontrado", { status: 404 });
  const { usuario, empresa } = acesso;
  const t = TEXTOS_PAINEL[usuario.idioma].leads;
  const leads = await listarLeads(empresa.id, undefined, 10_000);
  return respostaCsv(
    `leads-${empresa.slug}.csv`,
    [t.nome, "E-mail", "WhatsApp", t.origem, TEXTOS_PAINEL[usuario.idioma].campanhas.campanha, t.etapa, "Valor", t.recebido],
    leads.map((l) => [l.nome, l.email, l.whatsapp, l.origem, l.campanha, t.etapas[l.etapa] ?? l.etapa, l.valor, new Date(l.recebido_em).toISOString()]),
    usuario.idioma,
  );
}
