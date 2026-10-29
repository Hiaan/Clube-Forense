import "server-only";
import { consulta, umaLinha } from "./db";
import type { LeadSalvo } from "@/lib/leads";

// Leads do formulário do site da T9 entram no painel como leads da empresa "t9",
// para a equipe acompanhar o funil comercial da própria agência.

async function empresaT9() {
  const linha = await umaLinha<{ id: number }>(
    `insert into empresas (slug, nome, tipo) values ('t9', 'T9 ADS Company', 'leads')
     on conflict (slug) do update set slug = excluded.slug returning id`,
  );
  return linha!.id;
}

export async function salvarLeadNoPainel(lead: LeadSalvo) {
  const empresaId = await empresaT9();
  const dados = { faturamento: lead.faturamento, reuniao: lead.reuniao, idioma: lead.idioma, origemCompleta: lead.origem };
  const utm = parametros(lead.origem);
  const origem = utm.get("utm_source") ?? "Site";
  const campanha = utm.get("utm_campaign");
  const whatsapp = `+${lead.whatsapp}`;

  // O agendamento completa o lead parcial enviado minutos antes pela mesma pessoa.
  if (lead.etapa === "agendamento") {
    const atualizado = await umaLinha(
      `update leads set etapa = case when etapa = 'novo' then 'reuniao' else etapa end,
         -- No quadro do CRM, o lead que agendou vai para a coluna de reunião (se ainda estava na primeira).
         etapa_id = case when etapa = 'novo' then coalesce((select id from crm_etapas where empresa_id = $1 and chave = 'reuniao' limit 1), etapa_id) else etapa_id end,
         dados = coalesce(dados, '{}'::jsonb) || $3::jsonb,
         nome = $4, whatsapp = $5, atualizado_em = now()
       where id = (select id from leads where empresa_id = $1 and email = $2 and recebido_em > now() - interval '1 day'
                   order by recebido_em desc limit 1)
       returning id`,
      [empresaId, lead.email, JSON.stringify(dados), lead.nome, whatsapp],
    );
    if (atualizado) return;
  }
  await consulta(
    `insert into leads (empresa_id, nome, email, whatsapp, origem, campanha, etapa, etapa_id, dados)
     values ($1, $2, $3, $4, $5, $6, $7,
             case when $7 = 'reuniao' then (select id from crm_etapas where empresa_id = $1 and chave = 'reuniao' limit 1) end, $8::jsonb)`,
    [empresaId, lead.nome, lead.email, whatsapp, origem, campanha, lead.etapa === "agendamento" ? "reuniao" : "novo", JSON.stringify(dados)],
  );
}

function parametros(origem: string | null) {
  try {
    return new URL(origem ?? "", "https://t9company.com.br").searchParams;
  } catch {
    return new URLSearchParams();
  }
}

/** Lead que veio do diagnóstico gratuito: entra na T9 com as respostas e o resultado. Devolve o id. */
export async function salvarDiagnosticoNoPainel(lead: {
  nome: string;
  email: string;
  whatsapp: string;
  origem: string | null;
  respostas: Record<string, string>;
  diagnostico: unknown;
}) {
  const empresaId = await empresaT9();
  const utm = parametros(lead.origem);
  const linha = await umaLinha<{ id: number }>(
    `insert into leads (empresa_id, nome, email, whatsapp, origem, campanha, etapa, dados)
     values ($1, $2, $3, $4, 'Diagnóstico', $5, 'novo', $6::jsonb) returning id`,
    [
      empresaId,
      lead.nome,
      lead.email,
      `+${lead.whatsapp}`,
      utm.get("utm_campaign"),
      JSON.stringify({ respostas: lead.respostas, diagnostico: lead.diagnostico, origemCompleta: lead.origem }),
    ],
  );
  return { leadId: linha!.id, empresaId };
}
