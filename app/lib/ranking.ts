// A conta do ranking: correção do cartão, estatística da turma e a estimativa
// de corte.
//
// Tudo aqui é função pura — entra número, sai número, sem banco e sem React.
// É de propósito: é a parte do sistema em que um erro custa caro (a pessoa
// acredita na nota que a gente mostra), e função pura é a que dá para testar
// sem subir nada.

/** Como o caderno é respondido. */
export type EstiloProva = "abcde" | "abcd" | "ce";

export const ALTERNATIVAS: Record<EstiloProva, string[]> = {
  abcde: ["A", "B", "C", "D", "E"],
  abcd: ["A", "B", "C", "D"],
  // Certo/Errado do Cebraspe. "C" e "E" como letras, e não booleano, para o
  // gabarito e o cartão falarem a mesma língua dos outros dois estilos.
  ce: ["C", "E"],
};

export const ESTILO_LABEL: Record<EstiloProva, string> = {
  abcde: "Múltipla escolha (A–E)",
  abcd: "Múltipla escolha (A–D)",
  ce: "Certo / Errado",
};

/** Marca de questão anulada: conta como acerto para todo mundo. */
export const ANULADA = "*";

export interface MateriaProva {
  id?: number;
  nome: string;
  questaoDe: number;
  questaoAte: number;
  peso: number;
  ordem?: number;
}

/** Gabarito de um tipo de prova: questão → alternativa correta. */
export type Gabarito = Record<number, string>;

/** Cartão-resposta: questão → alternativa marcada. Questão em branco não entra. */
export type Cartao = Record<number, string>;

export interface DesempenhoMateria {
  nome: string;
  peso: number;
  /** Questões da matéria que o gabarito já cobre. */
  corrigidas: number;
  acertos: number;
  erros: number;
  brancos: number;
}

export interface Correcao {
  acertos: number;
  erros: number;
  brancos: number;
  /** Quantas questões o gabarito cobria — o denominador honesto do percentual. */
  corrigidas: number;
  /**
   * Nota final: soma, por matéria, do peso vezes os acertos — menos os erros
   * quando a prova pune. É este número que ordena o ranking.
   */
  nota: number;
  porMateria: DesempenhoMateria[];
}

/**
 * Corrige um cartão contra um gabarito.
 *
 * Só conta o que o gabarito conhece: enquanto ele sai parcial (é comum a banca
 * publicar uma matéria antes da outra), a nota reflete o que dá para afirmar, e
 * `corrigidas` diz sobre quantas questões ela foi feita.
 */
export function corrigir(
  cartao: Cartao,
  gabarito: Gabarito,
  materias: MateriaProva[],
  penalidade: boolean,
): Correcao {
  const porMateria: DesempenhoMateria[] = [];
  let nota = 0;

  for (const m of materias) {
    const d: DesempenhoMateria = {
      nome: m.nome,
      peso: m.peso,
      corrigidas: 0,
      acertos: 0,
      erros: 0,
      brancos: 0,
    };

    for (let q = m.questaoDe; q <= m.questaoAte; q++) {
      const correta = gabarito[q];
      if (!correta) continue;
      d.corrigidas++;

      // Anulada conta certo para todos, inclusive para quem deixou em branco:
      // é o que a banca faz, e o contrário puniria quem pulou a questão que ela
      // mesma reconheceu como defeituosa.
      if (correta === ANULADA) {
        d.acertos++;
        continue;
      }

      const marcada = cartao[q];
      if (!marcada) d.brancos++;
      else if (marcada === correta) d.acertos++;
      else d.erros++;
    }

    porMateria.push(d);
    nota += m.peso * (d.acertos - (penalidade ? d.erros : 0));
  }

  const somar = (f: (d: DesempenhoMateria) => number) =>
    porMateria.reduce((t, d) => t + f(d), 0);

  return {
    acertos: somar((d) => d.acertos),
    erros: somar((d) => d.erros),
    brancos: somar((d) => d.brancos),
    corrigidas: somar((d) => d.corrigidas),
    // Duas casas: pesos fracionários (1,5 por questão de legislação, por
    // exemplo) fariam a soma acumular dízima.
    nota: Math.round(nota * 100) / 100,
    porMateria,
  };
}

/**
 * Lê o gabarito colado no painel. Aceita os três formatos em que ele costuma
 * chegar, porque exigir um formato só significa a pessoa reformatar 120
 * questões à mão:
 *
 *   "ABCDEA..."        — a sequência corrida, na ordem das questões
 *   "1-A 2-B 3-*"      — questão e alternativa, em qualquer separador
 *   "1 A\n2 B\n3 C"    — uma por linha, como sai do PDF da banca
 *
 * `primeira` é o número da primeira questão, usado só na forma corrida.
 * Devolve também o que não entendeu, para o painel poder mostrar em vez de
 * engolir.
 */
export function interpretarGabarito(
  bruto: string,
  estilo: EstiloProva,
  primeira = 1,
): { gabarito: Gabarito; ignorados: string[] } {
  const validas = new Set([...ALTERNATIVAS[estilo], ANULADA]);
  const texto = bruto.trim().toUpperCase();
  const gabarito: Gabarito = {};
  const ignorados: string[] = [];

  if (!texto) return { gabarito, ignorados };

  // Numerado, se houver qualquer dígito. A forma corrida é o contrário: só
  // letras e espaços.
  //
  // Varre o texto inteiro em vez de fatiá-lo por espaço: o separador entre a
  // questão e a alternativa PODE ser o espaço ("3 C", uma por linha, que é como
  // sai do PDF da banca), e quebrar por espaço antes de casar o par transformava
  // essa forma em dois pedaços sem sentido. O que sobra entre um par e o
  // seguinte é que vira "não entendi".
  if (/\d/.test(texto)) {
    const par = /(\d+)\s*[-.:=)\]]*\s*([A-Z*])/g;
    const sobra = (trecho: string) => {
      // O filtro não é zelo: um trecho que é só pontuação ("," entre dois
      // pares) vira strings vazias no split, e elas apareceriam na tela como
      // "não entendi: , ,".
      ignorados.push(...trecho.split(/[\s,;]+/).filter(Boolean));
    };

    let m: RegExpExecArray | null;
    let fim = 0;
    while ((m = par.exec(texto)) !== null) {
      sobra(texto.slice(fim, m.index));
      fim = m.index + m[0].length;

      const q = Number(m[1]);
      const letra = m[2];
      if (validas.has(letra) && q >= 1) gabarito[q] = letra;
      else ignorados.push(m[0]);
    }
    sobra(texto.slice(fim));

    return { gabarito, ignorados };
  }

  let q = primeira;
  for (const c of texto.replace(/[\s,;|-]/g, "")) {
    if (!validas.has(c)) {
      ignorados.push(c);
      continue;
    }
    gabarito[q++] = c;
  }
  return { gabarito, ignorados };
}

export interface Colocado {
  posicao: number;
  apelido: string;
  nota: number;
  acertos: number;
  /** True na linha de quem está olhando o ranking. */
  euMesmo: boolean;
}

/**
 * Monta o ranking a partir das notas já corrigidas.
 *
 * Empate divide a mesma posição (1º, 2º, 2º, 4º) — é como concurso conta, e
 * inventar um desempate aqui seria dizer que uma pessoa está na frente da
 * outra sem nenhum critério real para isso.
 */
export function montarRanking(
  linhas: { email: string; apelido: string; nota: number; acertos: number }[],
  euEmail: string | null,
): Colocado[] {
  const ordenadas = [...linhas].sort(
    (a, b) => b.nota - a.nota || a.apelido.localeCompare(b.apelido),
  );

  let posicao = 0;
  let anterior: number | null = null;
  return ordenadas.map((l, i) => {
    if (anterior === null || l.nota !== anterior) posicao = i + 1;
    anterior = l.nota;
    return {
      posicao,
      apelido: l.apelido,
      nota: l.nota,
      acertos: l.acertos,
      euMesmo: Boolean(euEmail) && l.email === euEmail,
    };
  });
}

/** Amostra mínima para publicar qualquer estimativa de corte. */
export const MIN_AMOSTRA = 15;

/**
 * Posição mínima em que a estimativa projetada pode cair.
 *
 * Se a fatia das vagas aponta para o 1º ou o 2º lugar da nossa lista, o número
 * que sairia seria a maior nota daqui — e "o corte é a maior nota que vimos" não
 * é estimativa, é o teto da amostra vestido de previsão. Concurso muito
 * concorrido cai nesse caso o tempo todo: 20 vagas em 1800 inscritos é 1,1%, e
 * 1,1% de 19 cartões é menos de um.
 */
const POSICAO_MINIMA = 3;

/**
 * Quantos cartões seriam precisos para a projeção sair do topo da amostra.
 * Serve para a tela dizer "faltam tantos" em vez de um "ainda não dá" seco.
 */
export function cartoesParaEstimar(vagas: number | null, inscritos: number | null): number | null {
  if (!vagas || !inscritos || vagas <= 0 || inscritos < vagas) return null;
  return Math.max(MIN_AMOSTRA, Math.ceil((POSICAO_MINIMA * inscritos) / vagas));
}

export interface EstimativaCorte {
  nota: number;
  /** Em que posição do NOSSO ranking está essa nota. */
  posicao: number;
  /**
   * "projetada" quando dá para projetar sobre o total de inscritos;
   * "amostra" quando só sabemos as vagas, e o número é o corte aqui dentro.
   */
  base: "projetada" | "amostra";
  respondentes: number;
}

/**
 * Estimativa da nota de corte.
 *
 * COMO A CONTA É FEITA, e por que ela vem com aviso na tela:
 *
 * Com V vagas e C inscritos, a nota de corte é a do V-ésimo melhor entre C. Se
 * quem responde aqui fosse uma amostra sorteada dos inscritos, o corte cairia
 * na mesma fatia da nossa lista — na posição V/C × N. É essa a conta.
 *
 * O "se" não vale, e é importante dizer isso em voz alta: quem responde aqui é
 * aluno do Clube que estudou e quer se comparar. Essa turma pontua acima da
 * média dos inscritos, então a nossa fatia é melhor que a fatia equivalente do
 * concurso inteiro, e a estimativa sai ALTA — o corte real tende a ficar
 * abaixo dela. A tela precisa dizer isso; a função não tem como corrigir um
 * viés cujo tamanho ninguém mede.
 *
 * Sem o total de inscritos não há projeção possível, e devolvemos o corte
 * dentro da amostra, que é uma afirmação bem menor e está marcada como tal.
 *
 * `null` quando não há gente suficiente para afirmar nada: uma "nota de corte"
 * tirada de seis cartões é chute com cara de estatística, e uma que cai no
 * primeiro colocado é o teto da amostra, não uma previsão.
 */
export function estimarCorte(
  notasDesc: number[],
  vagas: number | null,
  inscritos: number | null,
): EstimativaCorte | null {
  const n = notasDesc.length;
  if (n < MIN_AMOSTRA || !vagas || vagas <= 0) return null;

  if (inscritos && inscritos >= vagas) {
    const posicao = Math.min(n, Math.max(1, Math.ceil((vagas / inscritos) * n)));
    // Ver POSICAO_MINIMA: colada no topo, a projeção não estima nada.
    if (posicao < POSICAO_MINIMA) return null;
    return { nota: notasDesc[posicao - 1], posicao, base: "projetada", respondentes: n };
  }

  // Sem inscritos: só dá para dizer quanto fez quem está na última vaga AQUI
  // DENTRO — e só quando há mais respondentes que vagas, senão todo mundo
  // "passaria" e o número não significaria nada.
  if (n <= vagas) return null;
  return { nota: notasDesc[vagas - 1], posicao: vagas, base: "amostra", respondentes: n };
}

export interface Estatisticas {
  respondentes: number;
  maior: number;
  media: number;
  mediana: number;
}

export function estatisticas(notasDesc: number[]): Estatisticas | null {
  const n = notasDesc.length;
  if (n === 0) return null;
  const soma = notasDesc.reduce((t, v) => t + v, 0);
  const meio = Math.floor(n / 2);
  return {
    respondentes: n,
    maior: notasDesc[0],
    media: Math.round((soma / n) * 100) / 100,
    mediana:
      n % 2 === 1
        ? notasDesc[meio]
        : Math.round(((notasDesc[meio - 1] + notasDesc[meio]) / 2) * 100) / 100,
  };
}
