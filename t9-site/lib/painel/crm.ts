import "server-only";
import { consulta, transacao, umaLinha } from "./db";
import { enviarEventosCrm, type EventoCrm } from "./meta";
import { ETAPAS_LEAD, TEXTOS_PAINEL, type EtapaLead } from "./textos";
import type { Idioma } from "@/lib/i18n";

// CRM do cliente: etapas (colunas do quadro) que ele mesmo cria, renomeia e reordena.
// O lead sem etapa_id fica na primeira coluna: é lá que os leads novos chegam.
// Etapas com evento_meta avisam a Meta (API de Conversões) quando um lead entra nelas.

export const TIPOS_ETAPA = ["aberta", "ganho", "perdido"] as const;
export type TipoEtapa = (typeof TIPOS_ETAPA)[number];

export type Etapa = {
  id: number;
  nome: string;
  ordem: number;
  tipo: TipoEtapa;
  /** Nome do evento enviado à Meta; null = esta etapa não avisa a Meta. */
  evento_meta: string | null;
  /** Etapa fixa antiga correspondente (novo, contato...), usada nos resumos da carteira. */
  chave: EtapaLead | null;
};

export const MAX_ETAPAS = 15;
export const limparNome = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 40);

/** Etapas do cliente, em ordem. Na primeira vez, cria as etapas padrão e encaixa os leads que já existiam. */
export async function etapasDaEmpresa(empresaId: number, idioma: Idioma): Promise<Etapa[]> {
  const existentes = await consulta<Etapa>(
    "select id, nome, ordem, tipo, evento_meta, chave from crm_etapas where empresa_id = $1 order by ordem, id",
    [empresaId],
  );
  if (existentes.length) return existentes;

  const nomes = TEXTOS_PAINEL[idioma].leads.etapas;
  return transacao(async (q) => {
    // Duas telas abertas ao mesmo tempo não podem criar as etapas duas vezes.
    await q("select pg_advisory_xact_lock(7201, $1)", [empresaId]);
    const ja = await q<Etapa>("select id, nome, ordem, tipo, evento_meta, chave from crm_etapas where empresa_id = $1 order by ordem, id", [empresaId]);
    if (ja.length) return ja;
    const criadas = await q<Etapa>(
      `insert into crm_etapas (empresa_id, nome, ordem, tipo, evento_meta, chave)
       select $1, n, o, t, ev, c from unnest($2::text[], $3::int[], $4::text[], $5::text[], $6::text[]) as x(n, o, t, ev, c)
       returning id, nome, ordem, tipo, evento_meta, chave`,
      [
        empresaId,
        ETAPAS_LEAD.map((e) => nomes[e]),
        ETAPAS_LEAD.map((_, i) => i),
        ETAPAS_LEAD.map((e) => (e === "ganho" ? "ganho" : e === "perdido" ? "perdido" : "aberta")),
        // A primeira etapa é a chegada do lead, que a Meta já conhece: não reenvia.
        ETAPAS_LEAD.map((e) => (e === "novo" ? null : nomes[e])),
        [...ETAPAS_LEAD],
      ],
    );
    await q(
      `update leads l set etapa_id = s.id from crm_etapas s
        where s.empresa_id = $1 and l.empresa_id = $1 and l.etapa_id is null and l.etapa <> 'novo' and s.chave = l.etapa`,
      [empresaId],
    );
    return criadas.sort((a, b) => a.ordem - b.ordem);
  });
}

/** Etapa em que o lead está (sem etapa_id → a primeira). */
export function etapaDoLead(etapaId: number | null, etapas: Etapa[]) {
  return etapas.find((e) => e.id === etapaId) ?? etapas[0] ?? null;
}

/** Valor do campo antigo "etapa", mantido para os resumos (carteira, exportação antiga). */
function chaveCompativel(etapa: Etapa, primeira: boolean): EtapaLead {
  if (etapa.chave) return etapa.chave;
  if (etapa.tipo === "ganho") return "ganho";
  if (etapa.tipo === "perdido") return "perdido";
  return primeira ? "novo" : "contato";
}

/**
 * Move o lead para a etapa e, se ela avisa a Meta, põe o evento na fila.
 * Devolve true quando há evento novo para enviar. O id do evento é fixo por lead e etapa:
 * ir e voltar não conta duas vezes.
 */
export async function moverLead(leadId: number, etapa: Etapa, primeira: boolean, empresaId: number) {
  return transacao(async (q) => {
    const lead = await q<{ id: number; valor: number | null }>(
      `update leads set etapa_id = $2, etapa = $3, etapa_em = now(), atualizado_em = now()
        where id = $1 and empresa_id = $4 returning id, valor`,
      [leadId, etapa.id, chaveCompativel(etapa, primeira), empresaId],
    );
    if (!lead.length || !etapa.evento_meta) return false;
    const novo = await q(
      `insert into crm_eventos (empresa_id, lead_id, etapa_id, evento, evento_id, valor)
       values ($1, $2, $3, $4, $5, $6) on conflict (empresa_id, evento_id) do nothing returning id`,
      [empresaId, leadId, etapa.id, etapa.evento_meta, `t9-${leadId}-${etapa.id}`, etapa.tipo === "ganho" ? lead[0].valor : null],
    );
    return novo.length > 0;
  });
}

/** A Meta só aceita eventos de até 7 dias atrás. */
const DIAS_VALIDADE = 7;
const MAX_TENTATIVAS = 6;

/**
 * Envia os eventos pendentes de um cliente (ou de todos). Só para quem tem conjunto de dados.
 * Nunca lança erro: o erro fica gravado no evento e na empresa, e a próxima rodada tenta de novo,
 * com intervalo crescente (5 min, 20 min, 1h20, 5h20, 21h). `agora` ignora o intervalo (botão da equipe).
 */
export async function enviarPendentes(empresaId?: number, agora = false) {
  const empresas = await consulta<{ id: number; nome: string; pais: string; moeda: string; meta_dataset: string; meta_dataset_token: string | null }>(
    `select id, nome, pais, moeda, meta_dataset, meta_dataset_token from empresas
      where meta_dataset is not null and ($1::int is null or id = $1)
        and exists (select 1 from crm_eventos v where v.empresa_id = empresas.id and v.enviado_em is null and v.criado_em > now() - interval '7 days')`,
    [empresaId ?? null],
  );
  const resultado: { empresa: string; enviados: number; erro?: string }[] = [];
  for (const e of empresas) {
    const linhas = await consulta<{
      id: number;
      evento: string;
      evento_id: string;
      criado_em: string;
      valor: number | null;
      meta_lead_id: string | null;
      email: string | null;
      whatsapp: string | null;
    }>(
      `select v.id, v.evento, v.evento_id, v.criado_em, coalesce(v.valor, case when s.tipo = 'ganho' then l.valor end) as valor,
              l.meta_lead_id, l.email, l.whatsapp
         from crm_eventos v join leads l on l.id = v.lead_id
         left join crm_etapas s on s.id = v.etapa_id
        where v.empresa_id = $1 and v.enviado_em is null and ($4::boolean or v.tentativas < $2)
          and v.criado_em > now() - make_interval(days => $3)
          and ($4::boolean or v.tentativas = 0 or v.tentado_em < now() - make_interval(mins => (5 * power(4, v.tentativas - 1))::int))
        order by v.criado_em limit 500`,
      [e.id, MAX_TENTATIVAS, DIAS_VALIDADE, agora],
    );
    // Sem nada que identifique a pessoa, a Meta não tem como ligar o evento ao anúncio.
    const semDados = linhas.filter((l) => !l.meta_lead_id && !l.email && !l.whatsapp).map((l) => l.id);
    if (semDados.length) {
      await consulta("update crm_eventos set tentativas = $2, erro = 'Lead sem e-mail, telefone ou id da Meta' where id = any($1::bigint[])", [
        semDados,
        MAX_TENTATIVAS,
      ]);
    }
    const eventos: EventoCrm[] = linhas
      .filter((l) => !semDados.includes(l.id))
      .map((l) => ({
        id: l.id,
        evento: l.evento,
        eventoId: l.evento_id,
        quando: new Date(l.criado_em),
        metaLeadId: l.meta_lead_id,
        email: l.email,
        telefone: l.whatsapp,
        valor: l.valor,
        moeda: e.moeda,
      }));
    if (!eventos.length) continue;
    const ids = eventos.map((x) => x.id);
    try {
      const recebidos = await enviarEventosCrm(e.meta_dataset, eventos, e.pais, e.meta_dataset_token);
      await consulta("update crm_eventos set enviado_em = now(), tentado_em = now(), erro = null, tentativas = tentativas + 1 where id = any($1::bigint[])", [ids]);
      await consulta("update empresas set meta_dataset_erro = null where id = $1", [e.id]);
      resultado.push({ empresa: e.nome, enviados: recebidos });
    } catch (erro) {
      const mensagem = (erro instanceof Error ? erro.message : String(erro)).slice(0, 500);
      await consulta("update crm_eventos set tentativas = tentativas + 1, tentado_em = now(), erro = $2 where id = any($1::bigint[])", [ids, mensagem]);
      await consulta("update empresas set meta_dataset_erro = $2 where id = $1", [e.id, mensagem]);
      resultado.push({ empresa: e.nome, enviados: 0, erro: mensagem });
    }
  }
  return resultado;
}

export type ResumoEnvios = { enviados7d: number; pendentes: number; falhas: number; ultimoEnvio: string | null; ultimoErro: string | null };

/** Números para a equipe conferir se as etapas estão chegando à Meta. */
export async function resumoEnvios(empresaId: number) {
  return (await umaLinha<ResumoEnvios>(
    `select count(*) filter (where enviado_em > now() - interval '7 days')::int as enviados7d,
            count(*) filter (where enviado_em is null and tentativas < $2 and criado_em > now() - interval '7 days')::int as pendentes,
            count(*) filter (where enviado_em is null and (tentativas >= $2 or criado_em <= now() - interval '7 days'))::int as falhas,
            max(enviado_em) as "ultimoEnvio",
            (array_agg(erro order by criado_em desc) filter (where enviado_em is null and erro is not null))[1] as "ultimoErro"
       from crm_eventos where empresa_id = $1`,
    [empresaId, MAX_TENTATIVAS],
  ))!;
}
