import "server-only";
import { consulta, umaLinha } from "./db";
import { FUSO } from "./formato";
import type { Empresa, Usuario } from "./auth";
import type { EtapaLead, StatusPlano } from "./textos";

// ---------- Datas e períodos (sempre no horário de Brasília) ----------

export const PERIODOS = ["7", "30", "90", "mes", "mes-passado"] as const;
export type ChavePeriodo = (typeof PERIODOS)[number];
export type Periodo = { chave: ChavePeriodo; inicio: string; fim: string; anteriorInicio: string; anteriorFim: string };

export function hoje() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const paraData = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
};
const paraIso = (data: Date) => data.toISOString().slice(0, 10);
export const somarDias = (iso: string, dias: number) => {
  const d = paraData(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return paraIso(d);
};
const diasEntre = (inicio: string, fim: string) => Math.round((paraData(fim).getTime() - paraData(inicio).getTime()) / 86_400_000) + 1;
const inicioDoMes = (iso: string) => `${iso.slice(0, 7)}-01`;
const fimDoMes = (iso: string) => {
  const d = paraData(inicioDoMes(iso));
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return paraIso(d);
};

export function periodo(valor: string | undefined, referencia = hoje()): Periodo {
  const chave = (PERIODOS as readonly string[]).includes(valor ?? "") ? (valor as ChavePeriodo) : "30";
  let inicio: string;
  let fim: string;
  if (chave === "mes") {
    inicio = inicioDoMes(referencia);
    fim = referencia;
  } else if (chave === "mes-passado") {
    fim = somarDias(inicioDoMes(referencia), -1);
    inicio = inicioDoMes(fim);
  } else {
    fim = referencia;
    inicio = somarDias(referencia, -(Number(chave) - 1));
  }
  const dias = diasEntre(inicio, fim);
  const anteriorFim = somarDias(inicio, -1);
  const anteriorInicio = chave === "mes-passado" ? inicioDoMes(anteriorFim) : somarDias(anteriorFim, -(dias - 1));
  return { chave, inicio, fim, anteriorInicio, anteriorFim };
}

// ---------- Métricas ----------

export type Totais = { gasto: number; impressoes: number; cliques: number; leads: number; conversoes: number; receita: number };

const SOMAS = `coalesce(sum(gasto), 0) as gasto, coalesce(sum(impressoes), 0) as impressoes, coalesce(sum(cliques), 0) as cliques,
  coalesce(sum(leads), 0) as leads, coalesce(sum(conversoes), 0) as conversoes, coalesce(sum(receita), 0) as receita`;

export async function totais(empresaId: number, inicio: string, fim: string) {
  const linha = await umaLinha<Totais>(
    `select ${SOMAS} from metricas where empresa_id = $1 and data between $2 and $3`,
    [empresaId, inicio, fim],
  );
  return linha!;
}

export async function serieDiaria(empresaId: number, inicio: string, fim: string) {
  return consulta<Totais & { data: string }>(
    `select d::date as data,
            coalesce(sum(m.gasto), 0) as gasto, coalesce(sum(m.impressoes), 0) as impressoes, coalesce(sum(m.cliques), 0) as cliques,
            coalesce(sum(m.leads), 0) as leads, coalesce(sum(m.conversoes), 0) as conversoes, coalesce(sum(m.receita), 0) as receita
       from generate_series($2::date, $3::date, interval '1 day') d
       left join metricas m on m.empresa_id = $1 and m.data = d::date
      group by d order by d`,
    [empresaId, inicio, fim],
  );
}

export async function porPlataforma(empresaId: number, inicio: string, fim: string) {
  return consulta<Totais & { plataforma: string }>(
    `select plataforma, ${SOMAS} from metricas where empresa_id = $1 and data between $2 and $3
      group by plataforma order by sum(gasto) desc`,
    [empresaId, inicio, fim],
  );
}

export async function campanhas(empresaId: number, inicio: string, fim: string) {
  return consulta<Totais & { plataforma: string; campanha: string }>(
    `select plataforma, campanha, ${SOMAS} from metricas where empresa_id = $1 and data between $2 and $3
      group by plataforma, campanha order by sum(gasto) desc, campanha`,
    [empresaId, inicio, fim],
  );
}

export async function ultimaData(empresaId: number) {
  const linha = await umaLinha<{ data: string | null }>("select max(data) as data from metricas where empresa_id = $1", [empresaId]);
  return linha?.data ?? null;
}

/** Metas do mês corrente: realizado até hoje e projeção no ritmo atual. */
export async function progressoDoMes(empresa: Empresa) {
  const referencia = hoje();
  const inicio = inicioDoMes(referencia);
  const realizado = await totais(empresa.id, inicio, referencia);
  const decorridos = diasEntre(inicio, referencia);
  const noMes = diasEntre(inicio, fimDoMes(referencia));
  const projetar = (v: number) => (v / decorridos) * noMes;
  return { realizado, projecao: { gasto: projetar(realizado.gasto), leads: projetar(realizado.leads), receita: projetar(realizado.receita) }, fracaoDoMes: decorridos / noMes };
}

// ---------- Leads ----------

export type Lead = {
  id: number;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  origem: string | null;
  campanha: string | null;
  etapa: EtapaLead;
  valor: number | null;
  recebido_em: string;
  dados: Record<string, unknown> | null;
};

export async function listarLeads(empresaId: number, etapa?: EtapaLead, limite = 300) {
  return consulta<Lead>(
    `select id, nome, email, whatsapp, origem, campanha, etapa, valor, recebido_em, dados
       from leads where empresa_id = $1 and ($2::text is null or etapa = $2)
      order by recebido_em desc limit $3`,
    [empresaId, etapa ?? null, limite],
  );
}

export async function contagemPorEtapa(empresaId: number) {
  const linhas = await consulta<{ etapa: EtapaLead; total: number }>(
    "select etapa, count(*)::int as total from leads where empresa_id = $1 group by etapa",
    [empresaId],
  );
  return Object.fromEntries(linhas.map((l) => [l.etapa, l.total])) as Partial<Record<EtapaLead, number>>;
}

// ---------- Plano de 4 semanas ----------

export type ItemPlano = { id: number; semana: number; ordem: number; titulo: string; status: StatusPlano };

export async function itensDoPlano(empresaId: number) {
  return consulta<ItemPlano>("select id, semana, ordem, titulo, status from plano where empresa_id = $1 order by semana, ordem, id", [
    empresaId,
  ]);
}

// ---------- Carteira (visão da equipe T9) ----------

export type LinhaCarteira = Empresa & {
  ultima: string | null;
  g7: number;
  l7: number;
  c7: number;
  r7: number;
  g7ant: number;
  l7ant: number;
  gm: number;
  lm: number;
  rm: number;
  leads_novos: number;
  /** Vencimento mais antigo ainda não pago e já vencido (null se está em dia). */
  atraso_desde: string | null;
};

export async function carteira(usuario: Usuario) {
  const ref = hoje();
  const ini7 = somarDias(ref, -6);
  const ini7ant = somarDias(ref, -13);
  const fim7ant = somarDias(ref, -7);
  const iniMes = inicioDoMes(ref);
  const somasCurtas = (alias: string) =>
    `left join lateral (select coalesce(sum(gasto), 0) as gasto, coalesce(sum(leads), 0) as leads,
       coalesce(sum(conversoes), 0) as conversoes, coalesce(sum(receita), 0) as receita
       from metricas where empresa_id = e.id and data between $${alias}) `;
  return consulta<LinhaCarteira>(
    `select e.*,
            (select max(data) from metricas where empresa_id = e.id) as ultima,
            s7.gasto as g7, s7.leads as l7, s7.conversoes as c7, s7.receita as r7,
            sa.gasto as g7ant, sa.leads as l7ant,
            sm.gasto as gm, sm.leads as lm, sm.receita as rm,
            (select count(*)::int from leads where empresa_id = e.id and etapa = 'novo') as leads_novos,
            (select min(vencimento) from cobrancas where empresa_id = e.id and pago_em is null and vencimento < $2::date) as atraso_desde
       from empresas e
       ${somasCurtas("1 and $2")} s7 on true
       ${somasCurtas("3 and $4")} sa on true
       ${somasCurtas("5 and $6")} sm on true
      where $7::boolean or e.id in (select empresa_id from acessos where usuario_id = $8)
      order by e.nome`,
    [ini7, ref, ini7ant, fim7ant, iniMes, ref, usuario.perfil === "admin", usuario.id],
  );
}

export type Alerta = { nivel: "alto" | "medio"; texto: string };

/** Sinais que pedem atenção do gestor. */
export function alertasDe(e: LinhaCarteira): Alerta[] {
  const alertas: Alerta[] = [];
  const ref = hoje();
  // A própria T9 (leads do site) não tem campanhas lançadas: não é motivo de alerta.
  if (!e.ultima && e.slug !== "t9") alertas.push({ nivel: "medio", texto: "Sem dados de campanha" });
  else if (e.ultima && e.ultima < somarDias(ref, -2)) alertas.push({ nivel: "alto", texto: `Dados parados desde ${e.ultima.split("-").reverse().join("/")}` });

  if (e.meta_cpl && e.tipo === "leads" && e.l7 > 0) {
    const cpl = e.g7 / e.l7;
    if (cpl > e.meta_cpl * 1.2) alertas.push({ nivel: "alto", texto: `CPL 7d ${Math.round((cpl / e.meta_cpl - 1) * 100)}% acima da meta` });
  }
  if (e.tipo === "leads" && e.g7 > 0 && e.l7 === 0) alertas.push({ nivel: "alto", texto: "Investindo sem leads há 7 dias" });
  if (e.tipo === "ecommerce" && e.g7 > 0 && e.r7 / e.g7 < 1) alertas.push({ nivel: "alto", texto: "ROAS 7d abaixo de 1" });

  if (e.meta_investimento) {
    const decorridos = Number(ref.slice(8, 10));
    const noMes = Number(fimDoMes(ref).slice(8, 10));
    const esperado = (e.meta_investimento * decorridos) / noMes;
    if (esperado > 0) {
      const ritmo = e.gm / esperado;
      if (ritmo > 1.15) alertas.push({ nivel: "medio", texto: `Investimento ${Math.round((ritmo - 1) * 100)}% acima do ritmo da meta` });
      else if (ritmo < 0.8 && decorridos > 3) alertas.push({ nivel: "medio", texto: `Investimento ${Math.round((1 - ritmo) * 100)}% abaixo do ritmo da meta` });
    }
  }
  if (e.atraso_desde) {
    const dias = Math.round((Date.parse(`${ref}T12:00:00Z`) - Date.parse(`${e.atraso_desde}T12:00:00Z`)) / 86_400_000);
    alertas.push({ nivel: "alto", texto: dias >= 7 ? `Pagamento ${dias} dias em atraso: suspender campanhas` : `Pagamento ${dias} dia(s) em atraso` });
  }
  if (e.leads_novos >= 10) alertas.push({ nivel: "medio", texto: `${e.leads_novos} leads sem atendimento` });
  return alertas;
}

// ---------- Criativos, arquivos, reuniões e relatórios ----------

export type Criativo = {
  id: number;
  titulo: string;
  status: "validado" | "teste" | "reprovado";
  formato: string;
  plataforma: string | null;
  link: string | null;
  imagem: string | null;
  gasto: number | null;
  resultados: number | null;
  ctr: number | null;
  nota: string | null;
  inicio: string | null;
};

export async function listarCriativos(empresaId: number) {
  return consulta<Criativo>(
    `select id, titulo, status, formato, plataforma, link, imagem, gasto, resultados, ctr, nota, inicio
       from criativos where empresa_id = $1 order by atualizado_em desc, id desc`,
    [empresaId],
  );
}

/** Endereço da miniatura: arquivo enviado (servido com checagem de acesso), caminho público ou miniatura do Drive. */
export function miniaturaDe(c: Pick<Criativo, "imagem" | "link">) {
  if (c.imagem) {
    if (c.imagem.startsWith("/") || c.imagem.startsWith("https://")) return c.imagem;
    return `/painel/midia/${c.imagem}`;
  }
  const drive = c.link?.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{10,})/);
  return drive ? `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w800` : null;
}

export type Arquivo = { id: number; titulo: string; url: string; nota: string | null; criado_em: string; usuario_id: number | null; autor: string | null };

export async function listarArquivos(empresaId: number) {
  return consulta<Arquivo>(
    `select a.id, a.titulo, a.url, a.nota, a.criado_em, a.usuario_id, coalesce(u.nome, u.email) as autor
       from arquivos a left join usuarios u on u.id = a.usuario_id
      where a.empresa_id = $1 order by a.criado_em desc`,
    [empresaId],
  );
}

export type Reuniao = {
  id: number;
  quando: string;
  titulo: string;
  link: string | null;
  gravacao: string | null;
  resumo: string | null;
  proximos_passos: string | null;
  /** Já passou (uma reunião continua em "próximas" até 1 hora depois do início). */
  passada: boolean;
};

export async function listarReunioes(empresaId: number) {
  return consulta<Reuniao>(
    "select id, quando, titulo, link, gravacao, resumo, proximos_passos, quando <= now() - interval '1 hour' as passada from reunioes where empresa_id = $1 order by quando desc",
    [empresaId],
  );
}

export type Relatorio = { mes: string; resumo: string | null; destaques: string | null; proximos_passos: string | null; publicado: boolean };

export async function relatorioDoMes(empresaId: number, mes: string) {
  return umaLinha<Relatorio>("select mes, resumo, destaques, proximos_passos, publicado from relatorios where empresa_id = $1 and mes = $2", [
    empresaId,
    mes,
  ]);
}

/** Meses com dados (mais recentes primeiro), sempre incluindo o mês atual. */
export async function mesesComDados(empresaId: number) {
  const linhas = await consulta<{ mes: string }>(
    "select distinct to_char(data, 'YYYY-MM') as mes from metricas where empresa_id = $1 order by mes desc limit 24",
    [empresaId],
  );
  const atual = hoje().slice(0, 7);
  const meses = linhas.map((l) => l.mes);
  return meses.includes(atual) ? meses : [atual, ...meses];
}

export function limitesDoMes(mes: string) {
  const inicio = `${mes}-01`;
  const fim = fimDoMes(inicio);
  const anteriorFim = somarDias(inicio, -1);
  return { inicio, fim, anteriorInicio: inicioDoMes(anteriorFim), anteriorFim };
}
