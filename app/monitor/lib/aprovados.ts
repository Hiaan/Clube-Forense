// Resultados do Clube Forense: alunos aprovados nos últimos concursos, por
// estado. Fonte: material oficial do Clube (arte "Aprovados"). Atualize quando
// sair um novo concurso com aprovados.

export interface Aprovacao {
  /** Total de aprovados do Clube no estado. */
  total: number;
  /** Colocações de destaque (ex.: "1º Lugar do Clube Forense"). */
  destaques: string[];
  /** Nomes dos aprovados divulgados. */
  nomes: string[];
  /**
   * Quando preenchido, indica que os aprovados são de um ÓRGÃO específico
   * (ex.: "Polícia Federal", concurso nacional) e não do concurso da UF — o
   * card deixa isso explícito. Usado hoje para hospedar a PF no DF.
   */
  orgao?: string;
}

export const APROVADOS: Record<string, Aprovacao> = {
  // Polícia Federal (concurso NACIONAL) alocada no DF por ora — o card sinaliza
  // que é da PF, não de um concurso do Distrito Federal.
  DF: {
    total: 3,
    destaques: ["3 alunos no Top 5"],
    nomes: ["Dr. Bruno Viana", "Dr. Giulianno Castelo", "Dr. Giovanni Vielmond"],
    orgao: "Polícia Federal",
  },
  PI: {
    total: 10,
    destaques: ["1º Lugar do Clube Forense", "3º Lugar do Clube Forense"],
    nomes: ["Dr. Robert Wall", "Dr. Ricardo Augusto"],
  },
  PE: {
    total: 86,
    destaques: ["1º Lugar", "3º Lugar", "5º Lugar"],
    nomes: ["Dr. Marcel Medeiros", "Dra. Simone Salgado", "Dr. Pietro Tenório"],
  },
  GO: {
    total: 17,
    destaques: ["1º Lugar do Clube Forense"],
    nomes: ["Dr. Bruno Viana"],
  },
  MG: {
    total: 13,
    destaques: ["1º Lugar do Clube Forense"],
    nomes: ["Dra. Lívia Bárbara"],
  },
  PR: {
    total: 14,
    destaques: ["1º Lugar do Clube Forense"],
    nomes: ["Dra. Laís Nader"],
  },
  RS: {
    total: 55,
    destaques: ["2º Lugar do Clube Forense"],
    nomes: ["Dr. Marcos Sandro"],
  },
  SC: {
    total: 49,
    destaques: ["1º Lugar — 4 alunos", "2º Lugar — 5 alunos", "3º Lugar — 2 alunos"],
    nomes: [
      "Dr. Lucas Mesquita",
      "Dr. Bruno Silva",
      "Dr. Hugo Emérico",
      "Dr. Marco Túlio",
      "Dra. Taynã Cesario",
      "Dr. Thiago Araújo",
      "Dr. Matheus Miguel",
      "Dr. Tulio Rucinski",
      "Dr. Luiz Brasil",
      "Dr. Felipe Sella",
      "Dr. Hugo Souza",
    ],
  },
};

/** Soma dos aprovados divulgados por estado. */
export const TOTAL_APROVADOS = Object.values(APROVADOS).reduce(
  (acc, a) => acc + a.total,
  0,
);
