// O veredito da triagem de notícias, guardado por link.
//
// POR QUE GUARDAR. A pergunta "esta notícia fala de vaga de médico-legista?" é
// respondida por um modelo, e custa. A mesma manchete volta nos feeds a cada
// passada do robô, de hora em hora, por semanas — perguntar de novo seria
// pagar dezenas de vezes pela mesma resposta, que não muda.
//
// NUNCA LANÇA. Banco fora do ar devolve cache vazio e a gravação é silenciosa:
// o pior que acontece é a notícia ser julgada de novo na próxima passada. A
// coleta não pode parar porque o cache teve um soluço.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

export interface Veredito {
  relevante: boolean;
  /** Em uma frase, por quê. Existe para a decisão poder ser auditada. */
  motivo: string;
}

/** Os vereditos já conhecidos, entre os links pedidos. */
export async function lerTriagens(links: string[]): Promise<Map<string, Veredito>> {
  const mapa = new Map<string, Veredito>();
  if (!bancoConfigurado() || links.length === 0) return mapa;

  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select link, relevante, motivo from triagem_noticias where link = any($1)",
      [links],
    )) as Record<string, unknown>[];
    for (const l of linhas) {
      mapa.set(String(l.link), {
        relevante: Boolean(l.relevante),
        motivo: String(l.motivo ?? ""),
      });
    }
  } catch (e) {
    console.error("Falha ao ler a triagem:", e instanceof Error ? e.message : e);
  }
  return mapa;
}

/** Grava os vereditos novos. Um por link; repetido sobrescreve. */
export async function gravarTriagens(
  vereditos: { link: string; uf: string; modelo: string; veredito: Veredito }[],
): Promise<void> {
  if (!bancoConfigurado() || vereditos.length === 0) return;

  try {
    await garantirEsquema();
    for (const v of vereditos) {
      await sql().query(
        `insert into triagem_noticias (link, uf, relevante, motivo, modelo)
         values ($1, $2, $3, $4, $5)
         on conflict (link) do update set
           relevante = excluded.relevante,
           motivo    = excluded.motivo,
           modelo    = excluded.modelo,
           em        = now()`,
        [v.link, v.uf, v.veredito.relevante, v.veredito.motivo.slice(0, 500), v.modelo],
      );
    }
  } catch (e) {
    console.error("Falha ao gravar a triagem:", e instanceof Error ? e.message : e);
  }
}
