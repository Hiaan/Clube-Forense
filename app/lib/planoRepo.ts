// Plano de cargos e carreiras por estado.
//
// Uma linha por classe. A gravação troca o plano inteiro do estado de uma vez —
// é assim que o editor funciona (você mexe na tabela toda e salva), e assim não
// existe estado intermediário com metade das classes velhas e metade novas.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import { PLANOS_BASE } from "./planosBase";

export interface ClassePlano {
  classe: string;
  /** Subsídio em reais. `null` quando a classe existe mas o valor não é público. */
  subsidio: number | null;
}

/** Todas as classes de todos os estados, agrupáveis por UF. */
export type PlanoPorUf = Record<string, ClassePlano[]>;

function daLinha(l: Record<string, unknown>): ClassePlano {
  return {
    classe: String(l.classe),
    subsidio: l.subsidio == null ? null : Number(l.subsidio),
  };
}

/** `null` quando o banco não respondeu — quem chama mostra o estado sem plano. */
export async function lerPlanos(): Promise<PlanoPorUf | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select uf, classe, subsidio from plano_classes order by uf, ordem, id",
    )) as Record<string, unknown>[];

    const porUf: PlanoPorUf = {};
    for (const l of linhas) {
      (porUf[String(l.uf)] ??= []).push(daLinha(l));
    }
    return porUf;
  } catch (e) {
    console.error("Falha ao ler planos de carreira:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** As classes de um estado só. Lista vazia quando não há plano cadastrado. */
export async function lerPlano(uf: string): Promise<ClassePlano[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select classe, subsidio from plano_classes where uf = $1 order by ordem, id",
      [uf.toUpperCase()],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao ler plano de carreira:", e instanceof Error ? e.message : e);
    return [];
  }
}

/**
 * Copia para o banco os planos que estão no código, um estado por vez, e só
 * onde ainda não há plano nenhum.
 *
 * O `where not exists` é o ponto todo: um estado editado à mão no painel nunca
 * é tocado, mesmo que o levantamento embutido tenha outra tabela. Sem isso, um
 * deploy desfaria a curadoria de quem corrigiu um valor na semana passada.
 *
 * Roda pelo cron, e não a cada requisição: são 17 estados e quase 200 linhas,
 * e depois da primeira vez o trabalho é só descobrir que não há o que fazer.
 *
 * Devolve quais UFs foram semeadas. Nunca lança: falhar aqui não pode derrubar
 * o cron, que tem outras coisas a fazer.
 */
export async function semearPlanos(): Promise<string[]> {
  if (!bancoConfigurado()) return [];
  const semeados: string[] = [];

  try {
    await garantirEsquema();
    const s = sql();

    for (const [uf, plano] of Object.entries(PLANOS_BASE)) {
      const jaTem = (await s.query(
        "select 1 from plano_classes where uf = $1 limit 1",
        [uf],
      )) as unknown[];
      if (jaTem.length > 0) continue;

      await s.transaction([
        ...plano.classes
          .filter((c) => c.classe.trim())
          .map((c, i) =>
            s.query(
              "insert into plano_classes (uf, classe, subsidio, ordem) values ($1, $2, $3, $4)",
              [uf, c.classe, c.subsidio, i],
            ),
          ),
        // O cabeçalho só é preenchido se estiver vazio: quem escreveu o órgão à
        // mão no painel continua com o texto dele.
        //
        // Insert, e não update: nem todo estado tem linha em `estados` — ela só
        // nasce quando alguém salva o estado no painel ou importa a planilha.
        // Com `update ... where uf = $1`, esses estados recebiam as classes e
        // perdiam o cabeçalho em silêncio, ficando com a tabela de salários sem
        // fonte nenhuma. Um salário sem fonte é exatamente o que este
        // levantamento existe para não ser.
        s.query(
          `insert into estados (uf, plano_orgao, plano_ano, plano_fonte)
           values ($1, $2, $3, $4)
           on conflict (uf) do update set
             plano_orgao = coalesce(estados.plano_orgao, excluded.plano_orgao),
             plano_ano   = coalesce(estados.plano_ano, excluded.plano_ano),
             plano_fonte = coalesce(estados.plano_fonte, excluded.plano_fonte)`,
          [uf, plano.orgao, plano.ano, plano.fonte],
        ),
      ]);

      semeados.push(uf);
    }
  } catch (e) {
    console.error("Falha ao semear os planos de carreira:", e instanceof Error ? e.message : e);
  }

  return semeados;
}

/**
 * Substitui o plano do estado. Apagar e inserir vão na mesma transação: sem
 * isso, uma falha no meio deixaria o estado sem plano nenhum.
 */
export async function salvarPlano(uf: string, classes: ClassePlano[]): Promise<void> {
  await garantirEsquema();
  const sigla = uf.toUpperCase();
  const s = sql();

  const comandos = [
    s.query("delete from plano_classes where uf = $1", [sigla]),
    ...classes
      .filter((c) => c.classe.trim())
      .map((c, i) =>
        s.query(
          "insert into plano_classes (uf, classe, subsidio, ordem) values ($1, $2, $3, $4)",
          [sigla, c.classe.trim(), c.subsidio, i],
        ),
      ),
  ];

  await s.transaction(comandos);
}
