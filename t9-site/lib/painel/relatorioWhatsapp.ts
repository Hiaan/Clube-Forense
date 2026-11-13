import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Idioma } from "@/lib/i18n";
import type { Empresa } from "./auth";
import { consulta, umaLinha } from "./db";
import { campanhas, somarDias, totais, type Totais } from "./dados";
import { dinheiro, numero } from "./formato";
import { metaConfigurado, sincronizarEmpresa } from "./meta";
import { enviarWhatsapp, numerosDe, ponteConfigurada } from "./whatsapp";

// Relatório automático no WhatsApp do cliente: investimento, resultados e a comparação com o
// período anterior, com um comentário curto da IA. Sai pelo número da T9 (a ponte), no dia e
// horário escolhidos para cada cliente. Quem dispara é a rotina que a ponte chama a cada 5 minutos.

export const FUSOS = [
  { valor: "America/Sao_Paulo", rotulo: "Brasília" },
  { valor: "America/New_York", rotulo: "Flórida (Miami, Orlando)" },
  { valor: "America/Manaus", rotulo: "Manaus" },
  { valor: "Europe/Lisbon", rotulo: "Lisboa" },
];
export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const FREQUENCIAS = {
  diario: "Todo dia (resultado de ontem)",
  semanal: "Toda semana (últimos 7 dias)",
  mensal: "Todo mês (mês anterior)",
} as const;

export type Frequencia = keyof typeof FREQUENCIAS;
export type EmpresaRelatorio = Pick<
  Empresa,
  | "id"
  | "slug"
  | "nome"
  | "tipo"
  | "idioma"
  | "moeda"
  | "pais"
  | "meta_cpl"
  | "meta_leads"
  | "meta_investimento"
  | "meta_conta"
  | "vendas_fonte"
  | "whatsapp_leads"
  | "rel_ativo"
  | "rel_frequencia"
  | "rel_dia_semana"
  | "rel_dia_mes"
  | "rel_hora"
  | "rel_fuso"
  | "rel_numeros"
  | "rel_ia"
  | "rel_ultimo_em"
  | "rel_metricas"
  | "rel_abertura"
  | "rel_fechamento"
  | "rel_instrucao"
  | "rel_destaque"
  | "rel_link"
>;

// ---------- Métricas que podem ir no relatório ----------

export const METRICAS = [
  { id: "investimento", rotulo: "Investimento" },
  { id: "leads", rotulo: "Leads (contatos)" },
  { id: "cpl", rotulo: "Custo por lead" },
  { id: "vendas", rotulo: "Vendas" },
  { id: "receita", rotulo: "Faturamento" },
  { id: "roas", rotulo: "Retorno (ROAS)" },
  { id: "ticket", rotulo: "Ticket médio" },
  { id: "cliques", rotulo: "Cliques" },
  { id: "impressoes", rotulo: "Impressões" },
  { id: "ctr", rotulo: "Taxa de cliques (CTR)" },
  { id: "cpc", rotulo: "Custo por clique (CPC)" },
  { id: "cpm", rotulo: "Custo por mil impressões (CPM)" },
  { id: "taxa_conversao", rotulo: "Taxa de conversão (leads ÷ cliques)" },
  { id: "meta_mes", rotulo: "Progresso da meta do mês" },
] as const;
export type IdMetrica = (typeof METRICAS)[number]["id"];

export const METRICAS_PADRAO: Record<Empresa["tipo"], IdMetrica[]> = {
  leads: ["investimento", "leads", "cpl", "cliques", "impressoes"],
  ecommerce: ["investimento", "vendas", "receita", "roas", "cliques", "impressoes"],
};

/** As escolhidas para o cliente, na ordem do catálogo; sem escolha, as padrão do tipo. */
export function metricasDe(e: Pick<Empresa, "tipo" | "rel_metricas">): IdMetrica[] {
  const escolhidas = new Set(e.rel_metricas ?? []);
  const lista = METRICAS.map((m) => m.id).filter((id) => escolhidas.has(id));
  return lista.length ? lista : METRICAS_PADRAO[e.tipo];
}

export const numerosDoRelatorio = (e: Pick<Empresa, "rel_numeros" | "whatsapp_leads">) =>
  numerosDe(e.rel_numeros?.trim() ? e.rel_numeros : e.whatsapp_leads);

// ---------- Datas no fuso do cliente ----------

/** Data, hora e dia da semana agora no fuso indicado. */
export function agoraNoFuso(fuso: string, quando = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    })
      .formatToParts(quando)
      .map((x) => [x.type, x.value]),
  );
  const data = `${p.year}-${p.month}-${p.day}`;
  const semana = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const ultimoDia = new Date(Date.UTC(Number(p.year), Number(p.month), 0)).getUTCDate();
  return { data, hora: Number(p.hour), semana, dia: Number(p.day), ultimoDia };
}

/** Está na hora do relatório deste cliente (e ele ainda não saiu hoje)? */
export function relatorioDevido(e: EmpresaRelatorio, quando = new Date()) {
  if (!e.rel_ativo) return false;
  const agora = agoraNoFuso(e.rel_fuso, quando);
  if (agora.hora < e.rel_hora) return false;
  if (e.rel_frequencia === "semanal" && agora.semana !== e.rel_dia_semana) return false;
  if (e.rel_frequencia === "mensal" && agora.dia !== Math.min(e.rel_dia_mes, agora.ultimoDia)) return false;
  return !e.rel_ultimo_em || agoraNoFuso(e.rel_fuso, new Date(e.rel_ultimo_em)).data < agora.data;
}

/** Período do relatório (e o anterior, para comparar), sempre com dias completos. */
export function periodoDoRelatorio(frequencia: Frequencia, hojeLocal: string) {
  const ontem = somarDias(hojeLocal, -1);
  if (frequencia === "diario") return { inicio: ontem, fim: ontem, antInicio: somarDias(ontem, -1), antFim: somarDias(ontem, -1) };
  if (frequencia === "semanal")
    return { inicio: somarDias(hojeLocal, -7), fim: ontem, antInicio: somarDias(hojeLocal, -14), antFim: somarDias(hojeLocal, -8) };
  const fim = somarDias(`${hojeLocal.slice(0, 7)}-01`, -1);
  const inicio = `${fim.slice(0, 7)}-01`;
  const antFim = somarDias(inicio, -1);
  return { inicio, fim, antInicio: `${antFim.slice(0, 7)}-01`, antFim };
}

// ---------- Textos ----------

const T = {
  pt: {
    titulo: { diario: "Resultado de ontem", semanal: "Relatório da semana", mensal: "Relatório do mês" },
    investimento: "Investimento",
    leads: "Contatos (leads)",
    cpl: "Custo por contato",
    vendas: "Vendas",
    receita: "Faturamento",
    roas: "Retorno (ROAS)",
    cliques: "Cliques",
    impressoes: "Impressões",
    melhor: "Destaque",
    a: "a",
    cada: "cada",
    analise: "Análise",
    painel: "Painel completo",
    rodape: "Relatório automático da T9",
    semDados: "Não houve investimento em anúncios neste período.",
    vs: "vs. período anterior",
  },
  en: {
    titulo: { diario: "Yesterday's results", semanal: "Weekly report", mensal: "Monthly report" },
    investimento: "Ad spend",
    leads: "Leads",
    cpl: "Cost per lead",
    vendas: "Sales",
    receita: "Revenue",
    roas: "ROAS",
    cliques: "Clicks",
    impressoes: "Impressions",
    melhor: "Top campaign",
    a: "at",
    cada: "each",
    analise: "Analysis",
    painel: "Full dashboard",
    rodape: "Automatic report by T9",
    semDados: "There was no ad spend in this period.",
    vs: "vs. previous period",
  },
  es: {
    titulo: { diario: "Resultado de ayer", semanal: "Informe de la semana", mensal: "Informe del mes" },
    investimento: "Inversión",
    leads: "Contactos (leads)",
    cpl: "Costo por contacto",
    vendas: "Ventas",
    receita: "Facturación",
    roas: "Retorno (ROAS)",
    cliques: "Clics",
    impressoes: "Impresiones",
    melhor: "Destacada",
    a: "a",
    cada: "cada uno",
    analise: "Análisis",
    painel: "Panel completo",
    rodape: "Informe automático de T9",
    semDados: "No hubo inversión en anuncios en este período.",
    vs: "vs. período anterior",
  },
} satisfies Record<Idioma, unknown>;

const LOCALE: Record<Idioma, string> = { pt: "pt-BR", en: "en-US", es: "es" };

function rotuloPeriodo(inicio: string, fim: string, idioma: Idioma) {
  const f = (iso: string, opcoes: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALE[idioma], { timeZone: "UTC", ...opcoes });
  if (inicio === fim) return f(inicio, { weekday: "long", day: "numeric", month: "long" });
  if (inicio.endsWith("-01") && somarDias(fim, 1).endsWith("-01")) return f(inicio, { month: "long", year: "numeric" });
  return `${f(inicio, { day: "numeric", month: "short" })} – ${f(fim, { day: "numeric", month: "short" })}`;
}

/** "↑ 12%" / "↓ 8%"; nada quando não dá para comparar. */
function variacao(atual: number, anterior: number) {
  if (!(anterior > 0) || !Number.isFinite(atual)) return "";
  const v = Math.round((atual / anterior - 1) * 100);
  if (v === 0) return " (=)";
  return ` (${v > 0 ? "↑" : "↓"} ${Math.abs(v)}%)`;
}

// ---------- Números do período ----------

export type DadosRelatorio = {
  periodo: ReturnType<typeof periodoDoRelatorio>;
  atual: Totais;
  anterior: Totais;
  campanhas: { campanha: string; gasto: number; leads: number; conversoes: number; receita: number }[];
  /** Do 1º dia do mês até o fim do período (para o progresso da meta). */
  mes: Totais;
};

export async function dadosDoRelatorio(e: EmpresaRelatorio, frequencia: Frequencia, hojeLocal: string): Promise<DadosRelatorio> {
  const periodo = periodoDoRelatorio(frequencia, hojeLocal);
  const [atual, anterior, lista, mes] = await Promise.all([
    totais(e.id, periodo.inicio, periodo.fim),
    totais(e.id, periodo.antInicio, periodo.antFim),
    campanhas(e.id, periodo.inicio, periodo.fim),
    totais(e.id, `${periodo.fim.slice(0, 7)}-01`, periodo.fim),
  ]);
  return { periodo, atual, anterior, campanhas: lista.filter((c) => c.gasto > 0).slice(0, 8), mes };
}

const REGRAS = {
  pt: {
    parado: "As campanhas não rodaram neste período.",
    retorno: (r: string) => `Cada 1 investido voltou ${r} em vendas.`,
    retornoComparado: (melhorou: boolean, de: string, para: string) =>
      `O retorno ${melhorou ? "melhorou" : "caiu"} em relação ao período anterior (de ${de} para ${para}).`,
    semLeads: "O investimento rodou, mas não chegaram contatos no período. A T9 está revisando os anúncios.",
    leads: (n: number) => `Chegaram ${n} contatos neste período.`,
    igual: "O resultado ficou igual ao do período anterior.",
    comparado: (mais: boolean, maisBarato: boolean) =>
      `${mais ? "Chegaram mais contatos" : "Chegaram menos contatos"} que no período anterior, e cada um ${maisBarato ? "custou menos" : "custou mais"}.`,
  },
  en: {
    parado: "Campaigns did not run in this period.",
    retorno: (r: string) => `Each 1 spent returned ${r} in sales.`,
    retornoComparado: (melhorou: boolean, de: string, para: string) =>
      `Return ${melhorou ? "improved" : "dropped"} versus the previous period (from ${de} to ${para}).`,
    semLeads: "Ads ran but no leads came in this period. T9 is reviewing the ads.",
    leads: (n: number) => `${n} leads came in this period.`,
    igual: "Results were the same as the previous period.",
    comparado: (mais: boolean, maisBarato: boolean) =>
      `${mais ? "More" : "Fewer"} leads than the previous period, and each one cost ${maisBarato ? "less" : "more"}.`,
  },
  es: {
    parado: "Las campañas no se ejecutaron en este período.",
    retorno: (r: string) => `Cada 1 invertido volvió ${r} en ventas.`,
    retornoComparado: (melhorou: boolean, de: string, para: string) =>
      `El retorno ${melhorou ? "mejoró" : "bajó"} frente al período anterior (de ${de} a ${para}).`,
    semLeads: "La inversión se ejecutó, pero no llegaron contactos en el período. T9 está revisando los anuncios.",
    leads: (n: number) => `Llegaron ${n} contactos en este período.`,
    igual: "El resultado fue igual al del período anterior.",
    comparado: (mais: boolean, maisBarato: boolean) =>
      `${mais ? "Llegaron más contactos" : "Llegaron menos contactos"} que en el período anterior, y cada uno ${maisBarato ? "costó menos" : "costó más"}.`,
  },
} satisfies Record<Idioma, unknown>;

/** Comentário sem IA: o que mudou em relação ao período anterior, em uma frase. */
export function comentarioPorRegras(e: Pick<Empresa, "tipo" | "idioma">, d: DadosRelatorio) {
  const r = REGRAS[e.idioma];
  const { atual: a, anterior: p } = d;
  const dec = (v: number) => v.toLocaleString(LOCALE[e.idioma], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (a.gasto <= 0) return r.parado;
  if (e.tipo === "ecommerce") {
    const roas = a.receita / a.gasto;
    const roasAnt = p.gasto ? p.receita / p.gasto : 0;
    return roasAnt ? r.retornoComparado(roas >= roasAnt, dec(roasAnt), dec(roas)) : r.retorno(dec(roas));
  }
  if (!a.leads) return r.semLeads;
  if (!p.leads) return r.leads(a.leads);
  const cpl = a.gasto / a.leads;
  const cplAnt = p.gasto / p.leads;
  if (a.leads === p.leads && Math.abs(cpl - cplAnt) < 0.01) return r.igual;
  return r.comparado(a.leads >= p.leads, cpl <= cplAnt);
}

// ---------- Comentário da IA ----------

const MODELO = "claude-haiku-5-5";
export const iaDoRelatorioConfigurada = () => Boolean(process.env.ANTHROPIC_API_KEY);

const SISTEMA = `Você escreve o comentário do relatório de anúncios que uma agência de marketing (T9) manda pelo WhatsApp para o dono de uma empresa.
Escreva de 2 a 3 frases curtas, no idioma pedido, em linguagem simples de conversa (o leitor não é do marketing: diga "contatos" e "custo de cada contato", não "CPL" ou "CTR").
- Use só os números recebidos. Não invente números, causas que os dados não mostram, nem promessas de resultado.
- Comece pelo mais importante: os resultados subiram ou caíram, e o custo melhorou ou piorou, em relação ao período anterior.
- Se houver meta, diga se está perto dela. Se uma campanha se destacou, cite-a pelo nome.
- Se algo piorou, diga com tranquilidade o que a T9 vai olhar ou ajustar, sem alarmar.
- Texto puro: sem título, sem listas, sem markdown, sem emojis, sem saudação e sem assinatura.
- Prefira comentar as métricas que o cliente escolheu receber ("metricasEscolhidas").
- Se vier "instrucaoDaAgencia", siga-a no tom e no foco, sem quebrar as regras acima.`;

let cliente: Anthropic | null = null;

/** Comentário da IA. Sem chave, com erro ou recusa: devolve null e o relatório usa o comentário por regras. */
export async function comentarioDaIa(e: EmpresaRelatorio, d: DadosRelatorio, frequencia: Frequencia) {
  if (!iaDoRelatorioConfigurada()) return null;
  cliente ??= new Anthropic({ timeout: 20_000, maxRetries: 1 });
  const idioma = { pt: "português do Brasil", en: "inglês", es: "espanhol" }[e.idioma];
  try {
    const resposta = await cliente.messages.create({
      model: MODELO,
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: SISTEMA,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            idioma,
            empresa: e.nome,
            tipo: e.tipo === "ecommerce" ? "loja virtual (vendas e faturamento)" : "geração de contatos (leads)",
            moeda: e.moeda,
            relatorio: FREQUENCIAS[frequencia],
            periodo: { de: d.periodo.inicio, ate: d.periodo.fim },
            atual: d.atual,
            periodoAnterior: d.anterior,
            metasDoMes: { custoPorContato: e.meta_cpl, contatos: e.meta_leads, investimento: e.meta_investimento },
            campanhas: d.campanhas,
            metricasEscolhidas: metricasDe(e).map((id) => METRICAS.find((m) => m.id === id)?.rotulo),
            ...(e.rel_instrucao?.trim() ? { instrucaoDaAgencia: e.rel_instrucao.trim().slice(0, 500) } : {}),
          }),
        },
      ],
    });
    if (resposta.stop_reason === "refusal") return null;
    const texto = resposta.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return texto ? texto.slice(0, 700) : null;
  } catch (erro) {
    console.error("[relatorio] IA indisponível, usando o comentário por regras:", erro instanceof Error ? erro.message : erro);
    return null;
  }
}

// ---------- Mensagem ----------

const endereco = () => (process.env.PAINEL_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://t9company.com.br").replace(/\/$/, "");

const ROTULOS: Record<Idioma, Record<IdMetrica, string> & { metaLeads: string; metaInvest: string; de: string }> = {
  pt: {
    investimento: "Investimento",
    leads: "Contatos (leads)",
    cpl: "Custo por contato",
    vendas: "Vendas",
    receita: "Faturamento",
    roas: "Retorno (ROAS)",
    ticket: "Ticket médio",
    cliques: "Cliques",
    impressoes: "Impressões",
    ctr: "Taxa de cliques",
    cpc: "Custo por clique",
    cpm: "Custo por mil impressões",
    taxa_conversao: "Taxa de conversão",
    meta_mes: "Meta do mês",
    metaLeads: "Meta do mês",
    metaInvest: "Investido no mês",
    de: "de",
  },
  en: {
    investimento: "Ad spend",
    leads: "Leads",
    cpl: "Cost per lead",
    vendas: "Sales",
    receita: "Revenue",
    roas: "ROAS",
    ticket: "Average order",
    cliques: "Clicks",
    impressoes: "Impressions",
    ctr: "Click-through rate",
    cpc: "Cost per click",
    cpm: "Cost per 1,000 impressions",
    taxa_conversao: "Conversion rate",
    meta_mes: "Monthly goal",
    metaLeads: "Monthly goal",
    metaInvest: "Spent this month",
    de: "of",
  },
  es: {
    investimento: "Inversión",
    leads: "Contactos (leads)",
    cpl: "Costo por contacto",
    vendas: "Ventas",
    receita: "Facturación",
    roas: "Retorno (ROAS)",
    ticket: "Ticket promedio",
    cliques: "Clics",
    impressoes: "Impresiones",
    ctr: "Tasa de clics",
    cpc: "Costo por clic",
    cpm: "Costo por mil impresiones",
    taxa_conversao: "Tasa de conversión",
    meta_mes: "Meta del mes",
    metaLeads: "Meta del mes",
    metaInvest: "Invertido en el mes",
    de: "de",
  },
};

const EMOJI: Record<IdMetrica, string> = {
  investimento: "💰",
  leads: "👥",
  cpl: "🎯",
  vendas: "🛒",
  receita: "💵",
  roas: "📈",
  ticket: "🧾",
  cliques: "👆",
  impressoes: "👀",
  ctr: "🖱️",
  cpc: "🪙",
  cpm: "📣",
  taxa_conversao: "🔁",
  meta_mes: "🏁",
};

/** Valor de cada métrica (null quando não dá para calcular, por exemplo custo por lead sem leads). */
function valorDaMetrica(id: IdMetrica, x: Totais): number | null {
  const div = (a: number, b: number) => (b > 0 ? a / b : null);
  switch (id) {
    case "investimento":
      return x.gasto;
    case "leads":
      return x.leads;
    case "cpl":
      return div(x.gasto, x.leads);
    case "vendas":
      return x.conversoes;
    case "receita":
      return x.receita;
    case "roas":
      return x.receita > 0 ? div(x.receita, x.gasto) : null;
    case "ticket":
      return div(x.receita, x.conversoes);
    case "cliques":
      return x.cliques;
    case "impressoes":
      return x.impressoes;
    case "ctr":
      return div(x.cliques * 100, x.impressoes);
    case "cpc":
      return div(x.gasto, x.cliques);
    case "cpm":
      return div(x.gasto * 1000, x.impressoes);
    case "taxa_conversao":
      return div(x.leads * 100, x.cliques);
    default:
      return null;
  }
}

/** Troca {empresa} e {periodo} no texto livre da equipe. */
const preencher = (texto: string, e: EmpresaRelatorio, periodo: string) =>
  texto
    .replace(/\{empresa\}/g, e.nome)
    .replace(/\{periodo\}/g, periodo)
    .trim();

/** Monta a mensagem do relatório com as métricas escolhidas. `comentario`: o da IA ou o por regras. */
export function textoDoRelatorio(e: EmpresaRelatorio, frequencia: Frequencia, d: DadosRelatorio, comentario: string) {
  const t = T[e.idioma];
  const r = ROTULOS[e.idioma];
  const { atual: a, anterior: p } = d;
  const local = LOCALE[e.idioma];
  const din = (v: number) => dinheiro(v, e.moeda, e.idioma);
  const num = (v: number) => numero(v, e.idioma);
  const pct = (v: number, casas: number) => `${v.toLocaleString(local, { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
  const formato = (id: IdMetrica, v: number) =>
    ["investimento", "receita", "cpl", "ticket", "cpc", "cpm"].includes(id)
      ? din(v)
      : id === "roas"
        ? v.toLocaleString(local, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : id === "ctr"
          ? pct(v, 2)
          : id === "taxa_conversao"
            ? pct(v, 1)
            : num(v);

  const periodo = rotuloPeriodo(d.periodo.inicio, d.periodo.fim, e.idioma);
  const linhas = [`📊 *${t.titulo[frequencia]}* — ${e.nome}`, `_${periodo}_`, ""];
  if (e.rel_abertura?.trim()) linhas.push(preencher(e.rel_abertura, e, periodo), "");

  if (a.gasto <= 0) {
    linhas.push(t.semDados);
  } else {
    let comparou = false;
    for (const id of metricasDe(e)) {
      if (id === "meta_mes") {
        if (e.meta_leads && e.tipo === "leads")
          linhas.push(
            `${EMOJI.meta_mes} ${r.metaLeads}: *${num(d.mes.leads)}* ${r.de} ${num(e.meta_leads)} ${r.leads.split(" ")[0].toLowerCase()} (${pct((d.mes.leads / e.meta_leads) * 100, 0)})`,
          );
        if (e.meta_investimento)
          linhas.push(
            `${EMOJI.meta_mes} ${r.metaInvest}: *${din(d.mes.gasto)}* ${r.de} ${din(e.meta_investimento)} (${pct((d.mes.gasto / e.meta_investimento) * 100, 0)})`,
          );
        continue;
      }
      const v = valorDaMetrica(id, a);
      if (v === null) continue;
      const antes = valorDaMetrica(id, p);
      const mudanca = antes !== null ? variacao(v, antes) : "";
      if (mudanca) comparou = true;
      linhas.push(`${EMOJI[id]} ${r[id]}: *${formato(id, v)}*${mudanca}`);
    }
    if (comparou) linhas.push(`_(${t.vs})_`);

    const destaque =
      e.tipo === "ecommerce"
        ? [...d.campanhas].filter((c) => c.receita > 0).sort((x, y) => y.receita / y.gasto - x.receita / x.gasto)[0]
        : [...d.campanhas].filter((c) => c.leads > 0).sort((x, y) => y.leads - x.leads)[0];
    if (e.rel_destaque && destaque && d.campanhas.length > 1) {
      const detalhe =
        e.tipo === "ecommerce"
          ? `${num(destaque.conversoes)} ${t.vendas.toLowerCase()}, ${din(destaque.receita)}`
          : `${num(destaque.leads)} ${t.leads.split(" ")[0].toLowerCase()} ${t.a} ${din(destaque.gasto / destaque.leads)} ${t.cada}`;
      linhas.push("", `🏆 ${t.melhor}: ${destaque.campanha || "—"} (${detalhe})`);
    }
  }

  if (comentario) linhas.push("", `💬 *${t.analise}:* ${comentario}`);
  if (e.rel_fechamento?.trim()) linhas.push("", preencher(e.rel_fechamento, e, periodo));
  if (e.rel_link) linhas.push("", `${t.painel}: ${endereco()}/painel/${e.slug}`);
  linhas.push("", `_${t.rodape}_`);
  return linhas.join("\n");
}

/** Relatório pronto (atualiza os números da Meta antes, se puder). */
export async function montarRelatorio(e: EmpresaRelatorio, opcoes: { comIa?: boolean; atualizar?: boolean; frequencia?: Frequencia } = {}) {
  const frequencia = opcoes.frequencia ?? e.rel_frequencia;
  if (opcoes.atualizar && e.meta_conta && metaConfigurado()) {
    await sincronizarEmpresa(e, 3).catch((erro) =>
      console.error("[relatorio] não deu para atualizar a Meta:", erro instanceof Error ? erro.message : erro),
    );
  }
  const hojeLocal = agoraNoFuso(e.rel_fuso).data;
  const d = await dadosDoRelatorio(e, frequencia, hojeLocal);
  const ia = opcoes.comIa && e.rel_ia && d.atual.gasto > 0 ? await comentarioDaIa(e, d, frequencia) : null;
  return { texto: textoDoRelatorio(e, frequencia, d, ia ?? comentarioPorRegras(e, d)), comIa: Boolean(ia) };
}

// ---------- Envio ----------

/** Manda o texto para cada número. Devolve os erros ("número: motivo"); vazio = todos receberam. */
export async function enviarParaNumeros(numeros: string[], texto: string) {
  const erros: string[] = [];
  for (const n of numeros) {
    try {
      await enviarWhatsapp(n, texto);
    } catch (erro) {
      erros.push(`${n}: ${erro instanceof Error ? erro.message : String(erro)}`);
    }
  }
  return erros;
}

const COLUNAS_RELATORIO = `id, slug, nome, tipo, idioma, moeda, pais, meta_cpl, meta_leads, meta_investimento, meta_conta, vendas_fonte, whatsapp_leads,
  rel_ativo, rel_frequencia, rel_dia_semana, rel_dia_mes, rel_hora, rel_fuso, rel_numeros, rel_ia, rel_ultimo_em,
  rel_metricas, rel_abertura, rel_fechamento, rel_instrucao, rel_destaque, rel_link`;

export const empresaDoRelatorio = (id: number) => umaLinha<EmpresaRelatorio>(`select ${COLUNAS_RELATORIO} from empresas where id = $1`, [id]);

/**
 * Envia os relatórios que estão na hora. Uma mensagem por cliente por dia: a chave do dia fica
 * em envios_automaticos. Se a ponte falhar, o mesmo texto é reenviado nas próximas rotinas (até 6 horas).
 * `prazoMs`: tempo máximo desta chamada (a rotina tem outras tarefas).
 */
export async function enviarRelatoriosDevidos(prazoMs = 60_000) {
  if (!ponteConfigurada()) return [];
  const inicio = Date.now();
  const empresas = await consulta<EmpresaRelatorio>(`select ${COLUNAS_RELATORIO} from empresas where rel_ativo`);
  const resultado: { empresa: string; ok: boolean; erro?: string }[] = [];

  for (const e of empresas) {
    if (Date.now() - inicio > prazoMs) break;
    if (!relatorioDevido(e)) continue;
    const numeros = numerosDoRelatorio(e);
    if (!numeros.length) continue;
    const chave = `rel:${agoraNoFuso(e.rel_fuso).data}`;

    // Reserva o envio do dia (ou retoma o que falhou), para não sair duas vezes.
    let envio = await umaLinha<{ id: number; texto: string }>(
      `update envios_automaticos set ok = null where empresa_id = $1 and chave = $2 and ok = false and criado_em > now() - interval '6 hours'
       returning id, texto`,
      [e.id, chave],
    );
    if (!envio) {
      const existe = await umaLinha("select 1 from envios_automaticos where empresa_id = $1 and chave = $2", [e.id, chave]);
      if (existe) {
        // Já saiu (ou desistiu depois de 6 horas): marca o dia como feito.
        await consulta("update empresas set rel_ultimo_em = now() where id = $1", [e.id]);
        continue;
      }
      const { texto } = await montarRelatorio(e, { comIa: true, atualizar: true });
      envio = await umaLinha<{ id: number; texto: string }>(
        `insert into envios_automaticos (empresa_id, tipo, chave, destino, texto) values ($1, 'relatorio', $2, 'cliente', $3)
         on conflict (empresa_id, chave) do nothing returning id, texto`,
        [e.id, chave, texto],
      );
      if (!envio) continue;
    }

    const erros = await enviarParaNumeros(numeros, envio.texto);
    const ok = erros.length < numeros.length;
    await consulta("update envios_automaticos set ok = $2, erro = $3 where id = $1", [envio.id, ok, erros.join("; ").slice(0, 500) || null]);
    if (ok) await consulta("update empresas set rel_ultimo_em = now() where id = $1", [e.id]);
    resultado.push({ empresa: e.nome, ok, erro: erros.join("; ") || undefined });
  }
  return resultado;
}

export type EnvioAutomatico = {
  id: number;
  empresa: string;
  tipo: string;
  destino: string;
  texto: string;
  ok: boolean | null;
  erro: string | null;
  criado_em: string;
};

export function enviosAutomaticos(empresaId?: number, limite = 15) {
  return consulta<EnvioAutomatico>(
    `select a.id, e.nome as empresa, a.tipo, a.destino, a.texto, a.ok, a.erro, a.criado_em
       from envios_automaticos a join empresas e on e.id = a.empresa_id
      where $1::int is null or a.empresa_id = $1
      order by a.criado_em desc limit $2`,
    [empresaId ?? null, limite],
  );
}
