// Os aprovados que o site mostra.
//
// Duas fontes, na mesma forma: a tabela do painel, quando tem alguém, e a lista
// escrita no código, como piso. É a mesma regra da curadoria dos estados — o
// banco pode estar fora do ar, ou ainda vazio, e o site continua mostrando os
// resultados do Clube.

import { listarAprovados } from "./aprovadosRepo";
import { APROVADOS, type Aprovacao } from "../monitor/lib/aprovados";

export interface AprovacaoSite extends Aprovacao {
  /** Nome -> URL da foto, para quem tem foto cadastrada no painel. */
  fotos: Record<string, string>;
}

/** Nunca lança e nunca volta vazio: sem banco, devolve a lista do código. */
export async function obterAprovadosSite(): Promise<Record<string, AprovacaoSite>> {
  const doCodigo = (): Record<string, AprovacaoSite> =>
    Object.fromEntries(
      Object.entries(APROVADOS).map(([uf, a]) => [uf, { ...a, fotos: {} }]),
    );

  const linhas = await listarAprovados();
  if (!linhas || linhas.length === 0) return doCodigo();

  const porUf: Record<string, AprovacaoSite> = {};
  for (const a of linhas) {
    const atual = (porUf[a.uf] ??= { total: 0, destaques: [], nomes: [], fotos: {} });
    atual.total += 1;
    atual.nomes.push(a.nome);
    if (a.titulo && !atual.destaques.includes(a.titulo)) atual.destaques.push(a.titulo);
    // O órgão é do grupo, não da pessoa: o primeiro preenchido vale para o card.
    if (a.orgao && !atual.orgao) atual.orgao = a.orgao;
    if (a.fotoUrl) atual.fotos[a.nome] = a.fotoUrl;
  }
  return porUf;
}
