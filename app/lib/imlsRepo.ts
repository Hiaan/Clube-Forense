// Onde ficam os IMLs de cada estado.
//
// Responde a pergunta que todo candidato faz antes de escolher onde prestar:
// "se eu passar, para onde posso ser mandado". Mesmas regras dos outros
// repositórios — leitura nunca lança, gravação troca a lista inteira do estado
// dentro de uma transação.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

export interface Iml {
  cidade: string;
  /** Nome da unidade, quando ela tem um. */
  nome: string | null;
}

export type ImlsPorUf = Record<string, Iml[]>;

function daLinha(l: Record<string, unknown>): Iml {
  return {
    cidade: String(l.cidade),
    nome: l.nome == null ? null : String(l.nome),
  };
}

/** `null` quando o banco não respondeu. */
export async function lerImls(): Promise<ImlsPorUf | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select uf, cidade, nome from imls order by uf, ordem, id",
    )) as Record<string, unknown>[];

    const porUf: ImlsPorUf = {};
    for (const l of linhas) (porUf[String(l.uf)] ??= []).push(daLinha(l));
    return porUf;
  } catch (e) {
    console.error("Falha ao ler os IMLs:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Os IMLs de um estado. Lista vazia quando não há nenhum cadastrado. */
export async function lerImlsDoEstado(uf: string): Promise<Iml[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select cidade, nome from imls where uf = $1 order by ordem, id",
      [uf.toUpperCase()],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao ler os IMLs do estado:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Substitui a lista do estado. Apagar e inserir vão juntos, na transação. */
export async function salvarImls(uf: string, imls: Iml[]): Promise<void> {
  await garantirEsquema();
  const sigla = uf.toUpperCase();
  const s = sql();

  await s.transaction([
    s.query("delete from imls where uf = $1", [sigla]),
    ...imls
      .filter((i) => i.cidade.trim())
      .map((i, ordem) =>
        s.query("insert into imls (uf, cidade, nome, ordem) values ($1, $2, $3, $4)", [
          sigla,
          i.cidade.trim(),
          i.nome?.trim() || null,
          ordem,
        ]),
      ),
  ]);
}
