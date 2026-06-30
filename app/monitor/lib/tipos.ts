// Tipos compartilhados do Monitor de Concursos para Médico-Legista.

/** Níveis de andamento de um concurso, do mais avançado ao inexistente. */
export type Nivel = "edital" | "banca" | "previsto" | "noticia" | "sem";

/** Uma menção/notícia coletada de alguma fonte. */
export interface Mencao {
  titulo: string;
  link: string;
  fonte: string;
  /** ISO date string, quando disponível. */
  data: string | null;
  /** Nível inferido a partir do texto da menção. */
  nivel: Nivel;
  /** Sigla do estado a que a menção foi associada (ou "BR" para nacional). */
  uf: string;
  resumo: string;
}

/** Situação consolidada de um estado. */
export interface EstadoStatus {
  uf: string;
  nome: string;
  /** Nível mais avançado encontrado entre as menções recentes. */
  nivel: Nivel;
  /** Pontuação 0–100 que representa o quão "quente"/avançado está. */
  score: number;
  /** Data ISO da menção mais recente, ou null. */
  ultimaMencao: string | null;
  /** Menções recentes ordenadas da mais nova para a mais antiga. */
  mencoes: Mencao[];
  /** Link do Diário Oficial do estado para verificação manual. */
  diarioOficial: string;
}

/** Resultado completo de uma coleta. */
export interface Relatorio {
  /** Momento da geração (ISO). */
  atualizadoEm: string;
  /** Situação por estado, ordenada por score desc. */
  estados: EstadoStatus[];
  /** Contagem de estados por nível. */
  resumo: Record<Nivel, number>;
  /** Total de menções consideradas. */
  totalMencoes: number;
  /** True quando nenhuma fonte externa pôde ser consultada (modo demonstração). */
  fonteIndisponivel: boolean;
}

export const NIVEL_LABEL: Record<Nivel, string> = {
  edital: "Edital publicado",
  banca: "Autorizado / banca",
  previsto: "Previsto / em estudo",
  noticia: "Menção recente",
  sem: "Sem novidades",
};

export const NIVEL_COR: Record<Nivel, string> = {
  edital: "#16a34a", // verde
  banca: "#ca8a04", // amarelo-ouro
  previsto: "#ea580c", // laranja
  noticia: "#2563eb", // azul
  sem: "#9ca3af", // cinza
};

export const NIVEL_PESO: Record<Nivel, number> = {
  edital: 100,
  banca: 70,
  previsto: 45,
  noticia: 25,
  sem: 0,
};
