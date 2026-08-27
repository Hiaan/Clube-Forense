// Onde ficam os IMLs de cada estado.
//
// Responde a pergunta que todo candidato faz antes de escolher onde prestar:
// "se eu passar, para onde posso ser mandado". Mesmas regras dos outros
// repositórios — leitura nunca lança, gravação troca a lista inteira do estado
// dentro de uma transação.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import { IMLS_BASE } from "./imlsBase";

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

/**
 * Copia para o banco a distribuição que está no código, um estado por vez, e só
 * onde ainda não há nada cadastrado.
 *
 * "Não há nada" cobre os dois casos: nenhuma unidade na tabela E nenhum texto
 * no estado. Sem a segunda metade, os dois estados que entram só com o texto —
 * PR e MT, onde o órgão não publica as unidades por município — seriam
 * semeados de novo a cada passada, e apareceriam para sempre na lista de
 * semeados sem nada ter mudado.
 *
 * Um estado editado à mão no painel nunca é tocado, mesmo que o levantamento
 * embutido tenha outra lista: um deploy não pode desfazer a curadoria de quem
 * corrigiu uma cidade na semana passada.
 *
 * Roda pelo cron, e não a cada requisição: são 22 estados e quase 300 linhas, e
 * depois da primeira vez o trabalho é só descobrir que não há o que fazer.
 *
 * Devolve quais UFs foram semeadas. Nunca lança: falhar aqui não pode derrubar
 * o cron, que tem outras coisas a fazer.
 */
export async function semearImls(): Promise<string[]> {
  if (!bancoConfigurado()) return [];
  const semeados: string[] = [];

  try {
    await garantirEsquema();
    const s = sql();

    for (const [uf, base] of Object.entries(IMLS_BASE)) {
      const jaTem = (await s.query(
        `select 1 from imls where uf = $1
         union all
         select 1 from estados where uf = $1 and imls_texto is not null
         limit 1`,
        [uf],
      )) as unknown[];
      if (jaTem.length > 0) continue;

      await s.transaction([
        ...base.unidades
          .filter((u) => u.cidade.trim())
          .map((u, ordem) =>
            s.query("insert into imls (uf, cidade, nome, ordem) values ($1, $2, $3, $4)", [
              uf,
              u.cidade.trim(),
              u.nome?.trim() || null,
              ordem,
            ]),
          ),
        // Insert, e não update: nem todo estado tem linha em `estados` — ela só
        // nasce quando alguém salva o estado no painel ou importa a planilha.
        // Com update, esses estados receberiam as cidades e perderiam total,
        // texto e fonte em silêncio. O coalesce protege quem escreveu à mão.
        s.query(
          `insert into estados (uf, imls_total, imls_texto, imls_fonte)
           values ($1, $2, $3, $4)
           on conflict (uf) do update set
             imls_total = coalesce(estados.imls_total, excluded.imls_total),
             imls_texto = coalesce(estados.imls_texto, excluded.imls_texto),
             imls_fonte = coalesce(estados.imls_fonte, excluded.imls_fonte)`,
          [uf, base.total, base.texto, base.fonte],
        ),
      ]);

      semeados.push(uf);
    }
  } catch (e) {
    console.error("Falha ao semear os IMLs:", e instanceof Error ? e.message : e);
  }

  return semeados;
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
