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
  /**
   * True quando esta é a notícia principal escrita no painel — a escolha
   * editorial, e não uma coletada.
   *
   * Precisa ser uma marca própria, e não "veio da curadoria": todo estado tem
   * uma menção de curadoria (o andamento), mas só é destaque quem preencheu o
   * título no painel. O resto continua sendo escolhido pelo robô, que é o que
   * o próprio formulário promete a quem deixa os campos em branco.
   */
  escolhidaNoPainel?: boolean;
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
  /** Imagem do estado escolhida no painel, mostrada no lugar da sigla. */
  imagemUrl: string | null;
  /** Cabeçalho do plano de carreira; as classes vêm de plano_classes. */
  planoOrgao: string | null;
  planoAno: number | null;
  planoFonte: string | null;
  /** Total de IMLs do estado; as cidades vêm da tabela imls. */
  imlsTotal: number | null;
  /** Texto livre sobre a distribuição das unidades. */
  imlsTexto: string | null;
  /** Link do edital — o publicado quando há, o anterior enquanto não sai. */
  editalUrl: string | null;
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
 * Brasa apagada (apenas estudos) → amarelo → laranja → vermelho (edital na
 * rua). É a mesma linguagem dos carrosséis do Clube, e substitui o esquema
 * antigo, que era um arco-íris — verde para edital, azul para estudo — em que a
 * cor não dizia nada sobre estar perto ou longe.
 *
 * Os cinco degraus quentes foram medidos em OKLCH, e não escolhidos a olho: a
 * claridade sobe de 0,565 a 0,880 em passos iguais, o matiz gira de 27° a 95°
 * também em passos iguais, e o croma cai de leve ao longo do caminho. É isso
 * que faz a sequência parecer uma família, e não cinco cores avulsas.
 *
 * O frio é um marrom-acinzentado, e não branco nem cinza neutro: o mapa é
 * preto, e ali o branco é a cor que mais salta — um estado que só está em
 * estudo gritava mais que um com edital na rua. O tom terroso mantém a brasa
 * apagada dentro da mesma família das acesas.
 *
 * Fora da escala ficam os dois níveis que não são etapa de funil: "menção
 * recente" e "sem novidades" usam cinza azulado, que não pertence à faixa
 * quente e por isso não se lê como um degrau dela. "Menção recente" é mais
 * clara que "em estudo" mesmo valendo menos no funil — de propósito: um
 * terceiro cinza escuro no mapa seria indistinguível dos outros dois, e o
 * azulado já diz "isto não é uma etapa".
 */
export const NIVEL_COR: Record<Nivel, string> = {
  edital: "#d22e2c", // vermelho — edital publicado
  banca: "#e36300", // laranja queimado — banca definida
  comissao: "#ef8f07", // laranja
  autorizado: "#f6b632", // âmbar
  solicitado: "#f6d653", // amarelo
  estudo: "#5f5346", // marrom-acinzentado — brasa apagada
  noticia: "#969fab", // cinza-azulado — fora da escala
  sem: "#ced5de", // cinza claro — fora da escala (no mapa escurece para recuar)
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
  estudo: "#ffffff",
  noticia: "#111827",
  sem: "#111827",
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
