// Cliente da API de Marketing do Meta (Graph API), usado para saber quanto as
// campanhas gastaram.
//
// Diferente da Eduzz, aqui não há troca de credencial por token: o token de
// acesso já é a credencial. O que se pede é o relatório de insights da conta de
// anúncios, quebrado por campanha e por dia (`time_increment=1`), porque é essa
// granularidade que permite refazer a conta em qualquer recorte depois.
//
// Como no cliente da Eduzz, nada aqui lança: devolve `null` com o motivo no log.

const VERSAO = process.env.META_API_VERSAO || "v21.0";
const BASE = `https://graph.facebook.com/${VERSAO}`;

/** True quando o token e a conta estão no ambiente. */
export function metaAdsConfigurado(): boolean {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
}

/**
 * O id da conta na Graph API vem prefixado com `act_`. Aceitamos os dois
 * formatos na variável de ambiente porque o painel do Meta mostra ora um, ora
 * outro, e essa diferença é fonte garantida de "por que não vem nada".
 */
function conta(): string {
  const id = (process.env.META_AD_ACCOUNT_ID || "").trim();
  return id.startsWith("act_") ? id : `act_${id}`;
}

export interface GastoDiario {
  /** AAAA-MM-DD. */
  dia: string;
  campanhaId: string;
  campanha: string | null;
  gasto: number;
  impressoes: number;
  cliques: number;
}

/** Página de insights como a Graph API devolve. */
interface RespostaInsights {
  data?: {
    date_start?: string;
    campaign_id?: string;
    campaign_name?: string;
    spend?: string;
    impressions?: string;
    clicks?: string;
  }[];
  paging?: { next?: string };
  error?: { message?: string; type?: string; code?: number };
}

function numero(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function dia(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Teto de páginas, para um período largo não virar um loop infinito. */
const MAX_PAGINAS = 50;

/**
 * Gasto por campanha e por dia no período, com as duas pontas incluídas.
 *
 * Devolve `null` quando o Meta não respondeu — diferente de `[]`, que é
 * "respondeu e não houve gasto". Confundir os dois apagaria o custo do painel e
 * faria o ROI parecer infinito, que é o erro mais caro que esta tela pode
 * cometer.
 */
export async function buscarGastos(inicio: Date, fim: Date): Promise<GastoDiario[] | null> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token || !process.env.META_AD_ACCOUNT_ID) return null;

  const url = new URL(`${BASE}/${conta()}/insights`);
  url.searchParams.set("level", "campaign");
  url.searchParams.set("fields", "campaign_id,campaign_name,spend,impressions,clicks");
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("time_range", JSON.stringify({ since: dia(inicio), until: dia(fim) }));
  url.searchParams.set("limit", "500");
  url.searchParams.set("access_token", token);

  const gastos: GastoDiario[] = [];
  let proxima: string | null = url.toString();

  for (let pagina = 0; proxima && pagina < MAX_PAGINAS; pagina++) {
    try {
      const resposta: Response = await fetch(proxima, { cache: "no-store" });
      const corpo = (await resposta.json().catch(() => null)) as RespostaInsights | null;

      if (!resposta.ok || corpo?.error) {
        console.error(
          "Meta Ads: falha ao buscar insights",
          resposta.status,
          corpo?.error?.message ?? "",
        );
        // Igual ao cliente da Eduzz: falhar na primeira página é não ter nada
        // confiável; falhar no meio devolve o que já veio, e o resto volta na
        // próxima sincronização.
        return pagina === 0 ? null : gastos;
      }

      for (const l of corpo?.data ?? []) {
        if (!l.date_start || !l.campaign_id) continue;
        gastos.push({
          dia: l.date_start,
          campanhaId: String(l.campaign_id),
          campanha: l.campaign_name ? String(l.campaign_name) : null,
          gasto: numero(l.spend),
          impressoes: numero(l.impressions),
          cliques: numero(l.clicks),
        });
      }

      // O `next` já vem com o token e o cursor embutidos.
      proxima = corpo?.paging?.next ?? null;
    } catch (e) {
      console.error("Meta Ads: erro ao buscar insights:", e instanceof Error ? e.message : e);
      return pagina === 0 ? null : gastos;
    }
  }

  return gastos;
}

/**
 * Gastos dos últimos `dias` dias, contando hoje.
 *
 * A janela padrão de quem chama é larga de propósito: o Meta reescreve os
 * números dos dias recentes conforme atribui conversões, então reler só ontem
 * deixaria o histórico congelado numa versão provisória.
 */
export function buscarGastosRecentes(dias = 30): Promise<GastoDiario[] | null> {
  const fim = new Date();
  const inicio = new Date(fim.getTime() - (dias - 1) * 86_400_000);
  return buscarGastos(inicio, fim);
}
