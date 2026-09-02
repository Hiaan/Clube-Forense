// As provas do ranking, no banco.
//
// Mesmas regras dos outros repositórios: leitura nunca lança (o site continua
// de pé sem o ranking), gravação lança para o painel poder mostrar o erro.
//
// A correção mora aqui, e não na tela, por um motivo prático: ela acontece em
// dois momentos distintos — quando alguém envia o cartão e quando o gabarito
// chega ou é corrigido — e nos dois o resultado tem de ser idêntico. Uma função
// só, chamada dos dois lados.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import {
  corrigir,
  type Cartao,
  type EstiloProva,
  type Gabarito,
  type MateriaProva,
} from "./ranking";

export interface Prova {
  id: number;
  uf: string;
  titulo: string;
  dataProva: string | null;
  estilo: EstiloProva;
  penalidade: boolean;
  /** Cadernos da prova. Lista vazia quando é caderno único. */
  tipos: string[];
  aberta: boolean;
  vagas: number | null;
  inscritos: number | null;
}

export interface ProvaCompleta extends Prova {
  materias: MateriaProva[];
  /** Gabarito por tipo. Caderno único usa a chave "". */
  gabaritos: Record<string, Gabarito>;
}

export interface RespostaProva {
  id: number;
  email: string;
  apelido: string;
  tipo: string;
  respostas: Cartao;
  acertos: number | null;
  erros: number | null;
  nota: number | null;
  criadoEm: string;
}

const ESTILOS: EstiloProva[] = ["abcde", "abcd", "ce"];

/** Separa "Tipo 1, Tipo 2" na lista, ignorando espaços e vazios. */
export function separarTipos(bruto: string): string[] {
  return bruto
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function daLinha(l: Record<string, unknown>): Prova {
  const estilo = String(l.estilo ?? "abcde") as EstiloProva;
  const data = (v: unknown): string | null => {
    if (v == null) return null;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };
  return {
    id: Number(l.id),
    uf: String(l.uf),
    titulo: String(l.titulo),
    dataProva: data(l.data_prova),
    estilo: ESTILOS.includes(estilo) ? estilo : "abcde",
    penalidade: Boolean(l.penalidade),
    tipos: separarTipos(String(l.tipos ?? "")),
    aberta: Boolean(l.aberta),
    vagas: l.vagas == null ? null : Number(l.vagas),
    inscritos: l.inscritos == null ? null : Number(l.inscritos),
  };
}

function materiaDaLinha(l: Record<string, unknown>): MateriaProva {
  return {
    id: Number(l.id),
    nome: String(l.nome),
    questaoDe: Number(l.questao_de),
    questaoAte: Number(l.questao_ate),
    peso: Number(l.peso),
    ordem: Number(l.ordem ?? 0),
  };
}

/** O cartão vem do jsonb com chaves em texto; aqui vira questão → alternativa. */
function cartaoDaLinha(v: unknown): Cartao {
  const cru = typeof v === "string" ? JSON.parse(v) : v;
  const cartao: Cartao = {};
  if (cru && typeof cru === "object") {
    for (const [q, alt] of Object.entries(cru as Record<string, unknown>)) {
      const n = Number(q);
      if (Number.isInteger(n) && n > 0 && alt) cartao[n] = String(alt).toUpperCase();
    }
  }
  return cartao;
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

/**
 * A prova que vale para cada estado — a aberta, se houver; senão a mais
 * recente. É o que o mapa consulta para decidir entre "Participar do ranking" e
 * "Ranking e notas", então precisa ser barato: uma consulta só, sem matérias
 * nem gabarito.
 *
 * `distinct on (uf)` com a mesma ordenação de `lerProvaDaUf` garante que o mapa
 * e a página do estado escolham sempre a mesma prova — duas regras separadas
 * mandariam o botão para um ranking diferente do que ele anuncia.
 */
export async function lerProvaPorUf(): Promise<Record<string, Prova>> {
  if (!bancoConfigurado()) return {};
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select distinct on (uf) * from provas
       order by uf, aberta desc, coalesce(data_prova, criada_em::date) desc, id desc`,
    )) as Record<string, unknown>[];
    return Object.fromEntries(linhas.map((l) => [String(l.uf), daLinha(l)]));
  } catch (e) {
    console.error("Falha ao ler as provas do mapa:", e instanceof Error ? e.message : e);
    return {};
  }
}

/** Todas as provas, da mais nova para a mais antiga. */
export async function lerProvas(): Promise<Prova[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select * from provas order by aberta desc, coalesce(data_prova, criada_em::date) desc, id desc",
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao ler provas:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Quantos cartões cada prova recebeu. Chave é o id da prova. */
export async function contarRespostas(): Promise<Record<number, number>> {
  if (!bancoConfigurado()) return {};
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select prova_id, count(*) as total from prova_respostas group by prova_id",
    )) as Record<string, unknown>[];
    return Object.fromEntries(linhas.map((l) => [Number(l.prova_id), Number(l.total)]));
  } catch {
    return {};
  }
}

async function montarCompleta(l: Record<string, unknown>): Promise<ProvaCompleta> {
  const prova = daLinha(l);
  const s = sql();

  const [materias, gabarito] = await Promise.all([
    s.query("select * from prova_materias where prova_id = $1 order by ordem, id", [
      prova.id,
    ]) as Promise<Record<string, unknown>[]>,
    s.query("select tipo, questao, correta from prova_gabaritos where prova_id = $1", [
      prova.id,
    ]) as Promise<Record<string, unknown>[]>,
  ]);

  const gabaritos: Record<string, Gabarito> = {};
  for (const g of gabarito) {
    const tipo = String(g.tipo ?? "");
    (gabaritos[tipo] ??= {})[Number(g.questao)] = String(g.correta).toUpperCase();
  }

  return { ...prova, materias: materias.map(materiaDaLinha), gabaritos };
}

/** Uma prova com matérias e gabarito. `null` quando não existe. */
export async function lerProva(id: number): Promise<ProvaCompleta | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query("select * from provas where id = $1", [
      id,
    ])) as Record<string, unknown>[];
    return linhas[0] ? await montarCompleta(linhas[0]) : null;
  } catch (e) {
    console.error("Falha ao ler a prova:", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * A prova do estado para a página pública: a aberta, se houver; senão a mais
 * recente. Uma prova encerrada continua valendo — é onde ficam o ranking e a
 * nota de corte do que já aconteceu.
 */
export async function lerProvaDaUf(uf: string): Promise<ProvaCompleta | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select * from provas where uf = $1
       order by aberta desc, coalesce(data_prova, criada_em::date) desc, id desc
       limit 1`,
      [uf.toUpperCase()],
    )) as Record<string, unknown>[];
    return linhas[0] ? await montarCompleta(linhas[0]) : null;
  } catch (e) {
    console.error("Falha ao ler a prova do estado:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Todos os cartões de uma prova, já corrigidos. */
export async function lerRespostas(provaId: number): Promise<RespostaProva[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select * from prova_respostas where prova_id = $1 order by nota desc nulls last, criado_em",
      [provaId],
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({
      id: Number(l.id),
      email: String(l.email),
      apelido: String(l.apelido),
      tipo: String(l.tipo ?? ""),
      respostas: cartaoDaLinha(l.respostas),
      acertos: l.acertos == null ? null : Number(l.acertos),
      erros: l.erros == null ? null : Number(l.erros),
      nota: l.nota == null ? null : Number(l.nota),
      criadoEm: new Date(String(l.criado_em)).toISOString(),
    }));
  } catch (e) {
    console.error("Falha ao ler os cartões:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** O cartão de uma pessoa, para ela poder revisar o que enviou. */
export async function lerResposta(
  provaId: number,
  email: string,
): Promise<RespostaProva | null> {
  const todas = await lerRespostas(provaId);
  return todas.find((r) => r.email === email.trim().toLowerCase()) ?? null;
}

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------

export interface DadosProva {
  uf: string;
  titulo: string;
  dataProva: string | null;
  estilo: EstiloProva;
  penalidade: boolean;
  tipos: string;
  aberta: boolean;
  vagas: number | null;
  inscritos: number | null;
}

/** Cria ou atualiza a prova. Devolve o id, que a criação ainda não tinha. */
export async function salvarProva(id: number | null, d: DadosProva): Promise<number> {
  await garantirEsquema();
  const s = sql();
  const valores = [
    d.uf.toUpperCase(),
    d.titulo.trim(),
    d.dataProva?.trim() || null,
    d.estilo,
    d.penalidade,
    d.tipos.trim(),
    d.aberta,
    d.vagas,
    d.inscritos,
  ];

  if (id) {
    await s.query(
      `update provas set uf = $1, titulo = $2, data_prova = $3, estilo = $4,
         penalidade = $5, tipos = $6, aberta = $7, vagas = $8, inscritos = $9,
         atualizada_em = now()
       where id = $10`,
      [...valores, id],
    );
    return id;
  }

  const linhas = (await s.query(
    `insert into provas (uf, titulo, data_prova, estilo, penalidade, tipos, aberta, vagas, inscritos)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
    valores,
  )) as Record<string, unknown>[];
  return Number(linhas[0].id);
}

/** Troca a lista de matérias inteira. Apagar e inserir vão juntos. */
export async function salvarMaterias(
  provaId: number,
  materias: MateriaProva[],
): Promise<void> {
  await garantirEsquema();
  const s = sql();
  await s.transaction([
    s.query("delete from prova_materias where prova_id = $1", [provaId]),
    ...materias
      .filter((m) => m.nome.trim() && m.questaoAte >= m.questaoDe)
      .map((m, ordem) =>
        s.query(
          `insert into prova_materias (prova_id, nome, questao_de, questao_ate, peso, ordem)
           values ($1, $2, $3, $4, $5, $6)`,
          [provaId, m.nome.trim(), m.questaoDe, m.questaoAte, m.peso, ordem],
        ),
      ),
  ]);
}

/**
 * Troca o gabarito de um tipo. Gabarito vazio apaga o que havia — é como se
 * desfaz uma colagem errada, e sem isso a única saída seria mexer no banco.
 */
export async function salvarGabarito(
  provaId: number,
  tipo: string,
  gabarito: Gabarito,
): Promise<void> {
  await garantirEsquema();
  const s = sql();
  const entradas = Object.entries(gabarito);
  await s.transaction([
    s.query("delete from prova_gabaritos where prova_id = $1 and tipo = $2", [
      provaId,
      tipo,
    ]),
    ...entradas.map(([questao, correta]) =>
      s.query(
        `insert into prova_gabaritos (prova_id, tipo, questao, correta)
         values ($1, $2, $3, $4)`,
        [provaId, tipo, Number(questao), correta],
      ),
    ),
  ]);
}

/**
 * Grava (ou regrava) o cartão de uma pessoa, já corrigido contra o gabarito que
 * existir no momento. Sem gabarito, o cartão fica guardado sem nota — e entra
 * no ranking assim que o gabarito chegar, sem ninguém precisar reenviar nada.
 */
export async function salvarResposta(
  prova: ProvaCompleta,
  email: string,
  apelido: string,
  tipo: string,
  cartao: Cartao,
): Promise<void> {
  await garantirEsquema();

  const gabarito = prova.gabaritos[tipo] ?? {};
  const temGabarito = Object.keys(gabarito).length > 0;
  const c = temGabarito ? corrigir(cartao, gabarito, prova.materias, prova.penalidade) : null;

  await sql().query(
    `insert into prova_respostas
       (prova_id, email, apelido, tipo, respostas, acertos, erros, nota, corrigido_em)
     values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
     on conflict (prova_id, email) do update set
       apelido = excluded.apelido,
       tipo = excluded.tipo,
       respostas = excluded.respostas,
       acertos = excluded.acertos,
       erros = excluded.erros,
       nota = excluded.nota,
       corrigido_em = excluded.corrigido_em,
       atualizado_em = now()`,
    [
      prova.id,
      email.trim().toLowerCase(),
      apelido.trim(),
      tipo,
      JSON.stringify(cartao),
      c?.acertos ?? null,
      c?.erros ?? null,
      c?.nota ?? null,
      c ? new Date().toISOString() : null,
    ],
  );
}

/**
 * Recorrige todos os cartões da prova. É o que roda quando o gabarito é colado
 * dias depois, ou quando a banca muda uma resposta no julgamento dos recursos —
 * caso em que todo mundo precisa de nota nova, e ninguém vai reenviar o cartão.
 *
 * Devolve quantos cartões passaram a ter nota.
 */
export async function recorrigirProva(provaId: number): Promise<number> {
  await garantirEsquema();
  const prova = await lerProva(provaId);
  if (!prova) return 0;

  const respostas = await lerRespostas(provaId);
  const s = sql();
  let corrigidos = 0;

  for (const r of respostas) {
    const gabarito = prova.gabaritos[r.tipo] ?? {};
    if (Object.keys(gabarito).length === 0) {
      // Some com a nota antiga: se o gabarito daquele tipo foi apagado, manter
      // a nota seria mostrar no ranking um número que não tem mais lastro.
      await s.query(
        `update prova_respostas set acertos = null, erros = null, nota = null,
           corrigido_em = null, atualizado_em = now() where id = $1`,
        [r.id],
      );
      continue;
    }
    const c = corrigir(r.respostas, gabarito, prova.materias, prova.penalidade);
    await s.query(
      `update prova_respostas set acertos = $1, erros = $2, nota = $3,
         corrigido_em = now(), atualizado_em = now() where id = $4`,
      [c.acertos, c.erros, c.nota, r.id],
    );
    corrigidos++;
  }

  return corrigidos;
}

/** Apaga a prova. Matérias, gabarito e cartões vão junto (on delete cascade). */
export async function apagarProva(id: number): Promise<void> {
  await garantirEsquema();
  await sql().query("delete from provas where id = $1", [id]);
}
