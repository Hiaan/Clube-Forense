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
  /**
   * True quando a menção veio da curadoria (painel ou piso embutido), e não de
   * uma busca. É o que o consolidador respeita num estado travado.
   *
   * Marca explícita, e não "a fonte começa com Curadoria": a fonte é editável
   * no painel, e quem trocasse pelo nome do próprio blog derrubava o estágio do
   * estado para "sem" — a única menção que o travamento deixa passar deixava de
   * ser reconhecida.
   */
  daCuradoria?: boolean;
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
  fonte: "banco" | "embutida";
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

/**
 * Escala de calor da proximidade do edital: quanto mais perto, mais quente.
 *
 * Vermelho (edital na rua) → laranja → âmbar → amarelo → quase branco (apenas
 * estudos). É a mesma linguagem dos carrosséis do Clube, e substitui o esquema
 * antigo, que era um arco-íris — verde para edital, azul para estudo — em que a
 * cor não dizia nada sobre estar perto ou longe.
 *
 * A claridade cresce em passos parelhos (0,18 → 0,25 → 0,39 → 0,61 → 0,79 →
 * 0,94), então a ordem se lê mesmo impressa em preto e branco.
 *
 * Fora da escala ficam os dois estados que não são etapa de funil: "menção
 * recente" e "sem novidades" usam cinza, para não parecerem um degrau frio.
 */
export const NIVEL_COR: Record<Nivel, string> = {
  edital: "#e8112d", // vermelho — edital publicado
  banca: "#f4511e", // vermelho-alaranjado — banca definida
  comissao: "#fb8c00", // laranja
  autorizado: "#ffc400", // âmbar
  solicitado: "#ffe57f", // amarelo claro
  estudo: "#fff8e1", // quase branco — ainda em estudo
  noticia: "#94a3b8", // cinza-azulado — fora da escala
  sem: "#64748b", // cinza
};

/**
 * Cor do texto escrito DENTRO de cada cor acima (etiquetas, pílulas).
 *
 * Metade da escala é clara demais para texto branco: numa etiqueta amarela ele
 * sai ilegível. Cada nível carrega a tinta que passa de 4,5:1 sobre a própria
 * cor, em vez de um branco fixo.
 */
export const NIVEL_TINTA: Record<Nivel, string> = {
  edital: "#ffffff",
  banca: "#111827",
  comissao: "#111827",
  autorizado: "#111827",
  solicitado: "#111827",
  estudo: "#111827",
  noticia: "#111827",
  sem: "#ffffff",
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
