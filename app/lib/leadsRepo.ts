// Registro dos cadastros feitos pelo muro do mapa.
//
// A conta em si é criada na plataforma de alunos — ela é a fonte da verdade.
// Esta tabela é a cópia do Clube, e existe por dois motivos que a plataforma
// não resolve: saber quantas pessoas o mapa converteu, e de qual estado cada
// uma veio.
//
// REGRA: gravar aqui nunca pode derrubar um cadastro. Se o banco falhar, a
// pessoa já foi criada na plataforma e precisa entrar assim mesmo — o lead é
// perdido, o que é ruim, mas incomparavelmente melhor que recusar o cadastro
// de alguém que fez tudo certo.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

export interface Lead {
  email: string;
  nome: string;
  celular: string | null;
  ufInteresse: string | null;
  vezes: number;
  criadoEm: string;
  vistoEm: string;
}

export interface NovoLead {
  nome: string;
  email: string;
  celular: string;
  ufInteresse: string | null;
}

/**
 * Grava o lead. Nunca lança: devolve `false` quando não deu, para quem chamou
 * apenas registrar no log e seguir.
 */
export async function registrarLead(lead: NovoLead): Promise<boolean> {
  if (!bancoConfigurado()) return false;
  try {
    await garantirEsquema();
    await sql().query(
      `insert into leads (email, nome, celular, uf_interesse)
       values ($1, $2, $3, $4)
       on conflict (email) do update set
         nome = excluded.nome,
         celular = excluded.celular,
         -- Só sobrescreve a UF se a nova tiver valor: um retorno sem estado
         -- não deve apagar de onde a pessoa veio da primeira vez.
         uf_interesse = coalesce(excluded.uf_interesse, leads.uf_interesse),
         vezes = leads.vezes + 1,
         visto_em = now()`,
      [
        lead.email.trim().toLowerCase(),
        lead.nome.trim(),
        lead.celular.trim() || null,
        lead.ufInteresse?.toUpperCase() || null,
      ],
    );
    return true;
  } catch (e) {
    console.error("Falha ao registrar lead:", e instanceof Error ? e.message : e);
    return false;
  }
}

function daLinha(l: Record<string, unknown>): Lead {
  return {
    email: String(l.email),
    nome: String(l.nome),
    celular: l.celular == null ? null : String(l.celular),
    ufInteresse: l.uf_interesse == null ? null : String(l.uf_interesse),
    vezes: Number(l.vezes ?? 1),
    criadoEm: new Date(String(l.criado_em)).toISOString(),
    vistoEm: new Date(String(l.visto_em)).toISOString(),
  };
}

/** Leads mais recentes primeiro. `null` quando o banco não respondeu. */
export async function listarLeads(limite = 500): Promise<Lead[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select * from leads order by criado_em desc limit $1",
      [limite],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao listar leads:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface DiaLeads {
  /** Data no formato AAAA-MM-DD. */
  dia: string;
  total: number;
}

/**
 * Cadastros por dia, do mais antigo para o mais novo, com os dias vazios
 * incluídos — um gráfico com buracos mente sobre o ritmo.
 *
 * O dia é o de Brasília, não o do servidor: um cadastro das 22h de São Paulo
 * cairia no dia seguinte se contássemos em UTC.
 */
export async function leadsPorDia(dias = 14): Promise<DiaLeads[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select to_char(d.dia, 'YYYY-MM-DD') as dia, count(l.email)::int as n
         from generate_series(
                (now() at time zone 'America/Sao_Paulo')::date - ($1::int - 1),
                (now() at time zone 'America/Sao_Paulo')::date,
                interval '1 day') as d(dia)
         left join leads l
           on (l.criado_em at time zone 'America/Sao_Paulo')::date = d.dia::date
        group by d.dia
        order by d.dia`,
      [dias],
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({ dia: String(l.dia), total: Number(l.n) }));
  } catch (e) {
    console.error("Falha ao agrupar leads por dia:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface ResumoLeads {
  total: number;
  /** Quantos cadastros vieram de cada estado, do maior para o menor. */
  porUf: { uf: string; total: number }[];
}

/** Números para o topo da aba de leads. */
export async function resumoLeads(): Promise<ResumoLeads | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const s = sql();
    const [totais, porUf] = await Promise.all([
      s.query("select count(*)::int as n from leads"),
      s.query(
        `select uf_interesse as uf, count(*)::int as n
         from leads where uf_interesse is not null
         group by uf_interesse order by n desc`,
      ),
    ]);
    return {
      total: Number((totais as Record<string, unknown>[])[0]?.n ?? 0),
      porUf: (porUf as Record<string, unknown>[]).map((l) => ({
        uf: String(l.uf),
        total: Number(l.n),
      })),
    };
  } catch (e) {
    console.error("Falha ao resumir leads:", e instanceof Error ? e.message : e);
    return null;
  }
}
