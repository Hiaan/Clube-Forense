// Tipos compartilhados do Monitor de Concursos para Médico-Legista.

/**
 * Estágios do funil de um edital, do mais avançado ao inexistente — espelha o
 * processo real de um concurso público (curadoria Clube Forense):
 *
 *   estudo      → Edital em Estudo: avaliação se haverá concurso; pode não sair.
 *   solicitado  → Concurso Solicitado: órgão pediu autorização (vagas +
 *                 justificativas); depende de aprovação e orçamento.
 *   autorizado  → Concurso Autorizado: governo autorizou oficialmente; comissão
 *                 pode ser formada; edital geralmente em até 6 meses.
 *   comissao    → Comissão Formada: equipe designada define o projeto básico e
 *                 inicia a contratação da banca.
 *   banca       → Banca Definida: banca contratada; última etapa antes do
 *                 edital, que pode sair a qualquer momento.
 *   edital      → Edital Publicado: regras e cronograma oficiais divulgados.
 *
 *   noticia     → menção relevante sem estágio identificável.
 *   sem         → nada encontrado.
 */
export type Nivel =
  | "edital"
  | "banca"
  | "comissao"
  | "autorizado"
  | "solicitado"
  | "estudo"
  | "noticia"
  | "sem";

/** Uma menção/notícia coletada de alguma fonte (ou da curadoria). */
export interface Mencao {
  titulo: string;
  link: string;
  fonte: string;
  /** ISO date string, quando disponível. */
  data: string | null;
  /** Estágio do funil inferido do texto (ou definido pela curadoria). */
  nivel: Nivel;
  /** Sigla do estado a que a menção foi associada. */
  uf: string;
  resumo: string;
  /**
   * True quando a menção anuncia o fim de um certame (resultado final,
   * homologação, nomeação, posse). Fecha o ciclo: menções anteriores a ela
   * pertencem a um concurso já encerrado e não contam para o estágio atual.
   */
  conclusiva?: boolean;
}

/** Histórico do último concurso com o cargo no estado (fonte: QConcursos). */
export interface HistoricoResumo {
  ultimoEdital: string | null;
  ultimaProva: string | null;
  banca: string | null;
  obs?: string;
}

/**
 * Dados ricos vindos da planilha de curadoria. Definidos aqui (e não importados
 * de planilha.ts) para não criar ciclo de import — planilha.ts já depende deste
 * módulo.
 */
export interface DetalheCuradoria {
  previsao: string | null;
  vagasImediatas: number | null;
  vagasCr: number | null;
  salarioInicial: number | null;
  cargaHoraria: number | null;
  especialidades: string | null;
  banca: string | null;
  inscricoesAte: string | null;
  dataProva: string | null;
  confianca: "alta" | "media" | "baixa";
  /** True quando a curadoria fixou o estágio e nenhuma notícia pode alterá-lo. */
  travado: boolean;
}

/** De onde saiu a curadoria nesta geração. */
export interface OrigemCuradoriaRelatorio {
  fonte: "planilha" | "embutida";
  /** Por que caímos no piso embutido, quando foi o caso. */
  motivo?: string;
  avisos: string[];
}

/** Situação consolidada de um estado. */
export interface EstadoStatus {
  uf: string;
  nome: string;
  /** Estágio mais avançado entre as menções da janela. */
  nivel: Nivel;
  /** Pontuação 0–100 que representa o quão "quente"/avançado está. */
  score: number;
  /** Data ISO da menção mais recente, ou null. */
  ultimaMencao: string | null;
  /** Menções ordenadas da mais nova para a mais antiga. */
  mencoes: Mencao[];
  /** Link do Diário Oficial do estado para verificação manual. */
  diarioOficial: string;
  /** Último edital/prova/banca do cargo no estado, ou null se desconhecido. */
  historico: HistoricoResumo | null;
  /** Detalhes da planilha de curadoria, quando ela foi lida com sucesso. */
  curadoria: DetalheCuradoria | null;
}

/** Resultado completo de uma coleta. */
export interface Relatorio {
  /** Momento da geração (ISO). */
  atualizadoEm: string;
  /** Situação por estado, ordenada por score desc. */
  estados: EstadoStatus[];
  /** Contagem de estados por estágio. */
  resumo: Record<Nivel, number>;
  /** Total de menções consideradas. */
  totalMencoes: number;
  /** True quando nenhuma fonte externa pôde ser consultada (só curadoria). */
  fonteIndisponivel: boolean;
  /** Se a curadoria veio da planilha ou do piso embutido, e por quê. */
  origemCuradoria: OrigemCuradoriaRelatorio;
  /** Qual commit gerou esta resposta — para não precisar deduzir. */
  versao: {
    commit: string | null;
    branch: string | null;
    ondeRoda: string;
  };
}

export const NIVEL_LABEL: Record<Nivel, string> = {
  edital: "Edital publicado",
  banca: "Banca definida",
  comissao: "Comissão formada",
  autorizado: "Concurso autorizado",
  solicitado: "Concurso solicitado",
  estudo: "Edital em estudo",
  noticia: "Menção recente",
  sem: "Sem novidades",
};

export const NIVEL_COR: Record<Nivel, string> = {
  edital: "#16a34a", // verde — aberto
  banca: "#84cc16", // lima — iminente
  comissao: "#ca8a04", // amarelo-ouro
  autorizado: "#ea580c", // laranja
  solicitado: "#8b5cf6", // violeta
  estudo: "#2563eb", // azul
  noticia: "#64748b", // cinza-azulado
  sem: "#9ca3af", // cinza
};

export const NIVEL_PESO: Record<Nivel, number> = {
  edital: 100,
  banca: 85,
  comissao: 70,
  autorizado: 55,
  solicitado: 40,
  estudo: 25,
  noticia: 15,
  sem: 0,
};
