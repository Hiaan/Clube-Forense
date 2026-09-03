// A ficha do concurso: forma e regras, sem tela.
//
// Módulo separado do BotaoInfo de propósito. O botão é um Client Component, e
// no App Router uma função exportada de um módulo `"use client"` NÃO pode ser
// chamada do servidor — o Next troca o corpo dela por uma referência ao
// cliente, e a chamada estoura em tempo de execução ("Attempted to call
// anoDoEdital() from the server"). Como quem monta a ficha é a página, que roda
// no servidor, as funções puras moram aqui, onde os dois lados alcançam.

/** A ficha, como sai do servidor. Tudo opcional — cada estado sabe o que sabe. */
export interface FichaConcurso {
  /** Rótulo do estágio, já traduzido ("Edital publicado"). */
  estagio: string;
  salarioInicial: number | null;
  salarioFinal: number | null;
  vagasImediatas: number | null;
  vagasCr: number | null;
  banca: string | null;
  /** `null` é "não conferimos", e não "não tem". */
  taf: boolean | null;
  materias: string | null;
  /** As fases do certame, uma por linha. */
  etapasConcurso: string | null;
  cargaHoraria: number | null;
  inscricoesAte: string | null;
  dataProva: string | null;
  especialidades: string | null;
  /** True quando a ficha descreve o concurso anterior. */
  doAnterior: boolean;
  /** Ano do último edital, para nomear de quando é a ficha antiga. */
  anoAnterior: number | null;
}

/**
 * Se há o que mostrar além do estágio.
 *
 * O estágio sozinho não conta: ele já está na etiqueta colorida do card, e um
 * botão que promete "mais informações" e abre uma ficha repetindo o que a
 * pessoa acabou de ler é pior que botão nenhum — ensina a não clicar.
 */
export function fichaTemConteudo(f: FichaConcurso): boolean {
  return (
    f.salarioInicial != null ||
    f.salarioFinal != null ||
    f.vagasImediatas != null ||
    f.vagasCr != null ||
    f.cargaHoraria != null ||
    f.taf != null ||
    Boolean(f.banca) ||
    Boolean(f.materias) ||
    Boolean(f.etapasConcurso) ||
    Boolean(f.especialidades) ||
    Boolean(f.inscricoesAte) ||
    Boolean(f.dataProva)
  );
}

/**
 * De quando é a ficha antiga.
 *
 * Aceita as duas fontes porque elas têm formatos diferentes: a curadoria grava
 * uma data ISO ("2018-03-01") e a tabela de histórico do código escreve como se
 * escreve na vida real ("set/2022", "2015"). Um `slice(0, 4)` funcionava só na
 * primeira e devolvia NaN na segunda, que é como o ano sumia do aviso.
 */
export function anoDoEdital(
  curado: string | null,
  historico: string | null,
): number | null {
  for (const bruto of [curado, historico]) {
    const achado = bruto?.match(/(19|20)\d{2}/);
    if (achado) return Number(achado[0]);
  }
  return null;
}
