import { listarLeads } from "@/lib/painel/dados";
import { etapaDoLead, etapasDaEmpresa } from "@/lib/painel/crm";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { acessoExportacao, respostaCsv } from "../csv";

export async function GET(_: Request, { params }: { params: Promise<{ empresa: string }> }) {
  const acesso = await acessoExportacao(params);
  if (!acesso) return new Response("Não encontrado", { status: 404 });
  const { usuario, empresa } = acesso;
  const t = TEXTOS_PAINEL[usuario.idioma].leads;
  const [leads, etapas] = await Promise.all([listarLeads(empresa.id, undefined, 10_000), etapasDaEmpresa(empresa.id, empresa.idioma)]);
  return respostaCsv(
    `leads-${empresa.slug}.csv`,
    [t.nome, "E-mail", "WhatsApp", t.origem, TEXTOS_PAINEL[usuario.idioma].campanhas.campanha, t.etapa, "Valor", t.recebido],
    leads.map((l) => [l.nome, l.email, l.whatsapp, l.origem, l.campanha, etapaDoLead(l.etapa_id, etapas)?.nome ?? t.etapas[l.etapa] ?? l.etapa, l.valor, new Date(l.recebido_em).toISOString()]),
    usuario.idioma,
  );
}
