// Plano de cargos e carreiras por estado.
//
// Uma linha por classe. A gravação troca o plano inteiro do estado de uma vez —
// é assim que o editor funciona (você mexe na tabela toda e salva), e assim não
// existe estado intermediário com metade das classes velhas e metade novas.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

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
