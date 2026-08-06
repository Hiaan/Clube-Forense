// Marcos do próprio sistema — hoje, quando a coleta de notícias rodou.
//
// Existe porque "atualizado em" na tela era a hora em que a PÁGINA foi montada,
// não a hora em que as notícias foram buscadas. Como as buscas têm cache de uma
// hora, a página podia dizer "agora" mostrando notícia de 59 minutos atrás. Só
// o robô sabe quando foi buscar de verdade, e é ele que grava aqui.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

const CHAVE_COLETA = "ultima_coleta";

export interface Coleta {
  /** Quando a coleta rodou (ISO). */
  em: string;
  /** Quantos estados tinham alguma novidade naquele momento. */
  estadosComNovidade: number;
  /** True quando nenhuma fonte externa respondeu e só sobrou a curadoria. */
  fonteIndisponivel: boolean;
}

/** Registra a coleta. Nunca lança: falhar aqui não pode derrubar o cron. */
export async function registrarColeta(c: Coleta): Promise<void> {
  if (!bancoConfigurado()) return;
  try {
    await garantirEsquema();
    await sql().query(
      `insert into sistema (chave, valor) values ($1, $2)
       on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
      [CHAVE_COLETA, JSON.stringify(c)],
    );
  } catch (e) {
    console.error("Falha ao registrar a coleta:", e instanceof Error ? e.message : e);
  }
}

/** `null` quando nunca rodou, ou quando o banco não respondeu. */
export async function lerUltimaColeta(): Promise<Coleta | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query("select valor from sistema where chave = $1", [
      CHAVE_COLETA,
    ])) as Record<string, unknown>[];
    if (!linhas[0]) return null;
    const c = JSON.parse(String(linhas[0].valor));
    return {
      em: String(c.em),
      estadosComNovidade: Number(c.estadosComNovidade ?? 0),
      fonteIndisponivel: Boolean(c.fonteIndisponivel),
    };
  } catch (e) {
    console.error("Falha ao ler a última coleta:", e instanceof Error ? e.message : e);
    return null;
  }
}
