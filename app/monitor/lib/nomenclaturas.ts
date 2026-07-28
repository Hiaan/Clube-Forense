// Como cada estado NOMEIA o cargo do médico-legista.
//
// Não existe um nome único no país. O mesmo profissional é "Perito
// Médico-Legista" no RS, "Médico Legista" em SP, "Perito Legista" no RJ,
// "Perito Oficial Médico-Legal" na PB, "Perito Médico-Legal" em SE e, no PR e
// em SC, nem cargo próprio tem: é uma ÁREA dentro de "Perito Oficial Criminal".
// Um filtro que só procure "legista" perde estados inteiros.
//
// BASE DE CADA LINHA: o nome oficial do cargo no ÚLTIMO concurso do estado
// (o mesmo certame registrado em historico.ts). É a única referência estável —
// portais de notícia parafraseiam, o edital não.
//
// Classificação de cada cargo:
//   direto    → o cargo é nominalmente do médico-legista; sozinho já basta.
//   unificado → medicina é uma ÁREA dentro de um cargo maior (PR, SC, MS, MT).
//               Só vale como cargo-alvo se o texto também sinalizar medicina —
//               senão um edital de perito criminal (balística, informática)
//               entraria como se fosse de legista.
//
// confianca: "alta"  = nome conferido no edital / corroborado pelo histórico.
//            "media" = certame antigo ou nomenclatura provável; confirmar no
//                      edital antes de tratar como oficial.

export const NOMENCLATURAS_VERIFICADO_EM = "2026-07-25";

export type TipoCargo = "direto" | "unificado";

export interface NomeCargoUF {
  uf: string;
  /** Nome oficial do cargo no último concurso do estado. */
  oficial: string;
  /** Órgão que realiza o certame. */
  orgao: string;
  /** Certame de referência de onde o nome foi tirado. */
  referencia: string;
  tipo: TipoCargo;
  /** Formas normalizadas (sem acento, sem hífen) usadas em editais e notícias. */
  variantes: string[];
  confianca: "alta" | "media";
}

/**
 * Normaliza para comparação de cargo: sem acento, minúsculo, e — diferente de
 * `normalizar()` de estados.ts — hífen e pontuação viram espaço.
 *
 * É isso que faz "perito médico-legal" casar com o termo "perito medico legal".
 * Sem esse passo, PB e SE (que usam a forma hifenizada "médico-legal") passam
 * despercebidos.
 */
export function normalizarCargo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const NOMES_CARGO_POR_UF: Record<string, NomeCargoUF> = {
  AC: {
    uf: "AC",
    oficial: "Perito Médico-Legista",
    orgao: "Polícia Civil do Acre (PC-AC)",
    referencia: "Funcab, 2015",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "media",
  },
  AL: {
    uf: "AL",
    oficial: "Perito Médico-Legista",
    orgao: "Perícia Oficial e Científica de Alagoas",
    referencia: "Cebraspe, 2022",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista", "perito legista"],
    confianca: "alta",
  },
  AP: {
    uf: "AP",
    oficial: "Perito Médico-Legista",
    orgao: "Politec-AP",
    referencia: "FCC, 2017",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista", "perito legista"],
    confianca: "media",
  },
  AM: {
    uf: "AM",
    oficial: "Perito Legista",
    orgao: "Polícia Civil do Amazonas (PC-AM)",
    referencia: "FGV, 2021/2022",
    tipo: "direto",
    variantes: ["perito legista", "perito legista medicina", "medico legista"],
    confianca: "alta",
  },
  BA: {
    uf: "BA",
    oficial: "Perito Médico-Legista",
    orgao: "Departamento de Polícia Técnica (DPT-BA)",
    referencia: "Idecan, 2022",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "alta",
  },
  CE: {
    uf: "CE",
    oficial: "Médico Legista",
    orgao: "Perícia Forense do Ceará (Pefoce)",
    referencia: "Idecan, 2021",
    tipo: "direto",
    // O edital do CE sai como "médico legista / Pefoce"; "médico perito-legista"
    // é paráfrase de imprensa, não o nome do cargo.
    variantes: ["medico legista", "medico legista pefoce", "medico perito legista"],
    confianca: "alta",
  },
  DF: {
    uf: "DF",
    oficial: "Perito Médico-Legista",
    orgao: "Polícia Civil do Distrito Federal (PCDF)",
    referencia: "Fundação Universa, 2014",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "alta",
  },
  ES: {
    uf: "ES",
    oficial: "Médico Legista",
    orgao: "Polícia Científica do Espírito Santo (PCI-ES)",
    referencia: "Instituto AOCP, 2018",
    tipo: "direto",
    // O certame de 2018 trouxe "Médico Legista" (e, à parte, "Auxiliar de
    // Perícia Médico-Legal", que é cargo de apoio e NÃO entra aqui). O Estatuto
    // de 2026 (LC 1.137) renomeia a carreira para "Perito Oficial Médico
    // Legista".
    variantes: ["medico legista", "perito medico legista", "perito oficial medico legista"],
    confianca: "alta",
  },
  GO: {
    uf: "GO",
    oficial: "Médico Legista",
    orgao: "Polícia Científica de Goiás (SPTC-GO)",
    referencia: "Iades, 2024",
    tipo: "direto",
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
  MA: {
    uf: "MA",
    oficial: "Médico Legista",
    orgao: "Perícia Oficial de Natureza Criminal (SEAD/SSP-MA)",
    referencia: "Cebraspe, 2026",
    tipo: "direto",
    // Edital de 2026: cargo "Médico Legista", com especialidades (clínica,
    // psiquiatria, radiologia).
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
  MT: {
    uf: "MT",
    oficial: "Perito Médico-Legista",
    orgao: "Politec-MT",
    referencia: "UFMT, 2022",
    // Cargo PRÓPRIO, não unificado: o edital de 2022 trouxe "Perito Oficial
    // Criminal", "Perito Médico-Legista" e "Perito Odonto-Legista" como cargos
    // separados, e o PLDO 2026 repete os dois primeiros.
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista", "perito odonto legista"],
    confianca: "alta",
  },
  MS: {
    uf: "MS",
    oficial: "Perito Oficial Forense — área Medicina Legal",
    orgao: "Coordenadoria-Geral de Perícias (Sejusp-MS)",
    referencia: "Fapec, 2021",
    tipo: "unificado",
    variantes: ["perito oficial forense", "perito medico legista", "medico legista"],
    confianca: "media",
  },
  MG: {
    uf: "MG",
    oficial: "Médico Legista",
    orgao: "Polícia Civil de Minas Gerais (PC-MG)",
    referencia: "FGV, 2024",
    tipo: "direto",
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
  PA: {
    uf: "PA",
    oficial: "Perito Médico-Legista",
    orgao: "Polícia Científica do Pará (CPC Renato Chaves)",
    referencia: "Fadesp, 2018",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "alta",
  },
  PB: {
    uf: "PB",
    oficial: "Perito Oficial Médico-Legal",
    orgao: "Polícia Civil da Paraíba (PC-PB)",
    referencia: "Cebraspe, 2021",
    tipo: "direto",
    variantes: [
      "perito oficial medico legal",
      "perito medico legal",
      "medico legal",
      "perito oficial legista",
    ],
    confianca: "alta",
  },
  PR: {
    uf: "PR",
    oficial: "Perito Oficial Criminal — área Medicina",
    orgao: "Polícia Científica do Paraná",
    referencia: "IBFC, 2024",
    tipo: "unificado",
    variantes: [
      "perito oficial criminal",
      "perito oficial criminal medicina",
      "perito criminal medicina",
      "medico legista",
    ],
    confianca: "alta",
  },
  PE: {
    uf: "PE",
    oficial: "Médico Legista",
    orgao: "Politec-PE (SDS-PE)",
    referencia: "Instituto AOCP, 2024",
    tipo: "direto",
    // Edital de 2024: "Agente de Medicina Legal", "Médico Legista" e "Perito
    // Criminal" — o cargo-alvo é "Médico Legista", sem o prefixo "Perito"; o
    // agente é cargo de apoio e fica fora.
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
  PI: {
    uf: "PI",
    oficial: "Perito Médico-Legista",
    orgao: "Polícia Civil do Piauí (PC-PI)",
    referencia: "FGV, 2025",
    tipo: "direto",
    variantes: [
      "perito medico legista",
      "perito medico legista patologia",
      "medico legista",
    ],
    confianca: "alta",
  },
  RJ: {
    uf: "RJ",
    oficial: "Perito Legista",
    orgao: "Polícia Civil do Rio de Janeiro (PCERJ)",
    referencia: "2021",
    tipo: "direto",
    variantes: ["perito legista", "medico legista"],
    confianca: "alta",
  },
  RN: {
    uf: "RN",
    oficial: "Perito Médico-Legista",
    orgao: "ITEP-RN",
    referencia: "Instituto AOCP, 2021",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "alta",
  },
  RS: {
    uf: "RS",
    oficial: "Perito Médico-Legista",
    orgao: "Instituto-Geral de Perícias (IGP-RS)",
    referencia: "Fundatec, 2025",
    tipo: "direto",
    variantes: ["perito medico legista", "medico legista"],
    confianca: "alta",
  },
  RO: {
    uf: "RO",
    oficial: "Médico Legista",
    orgao: "Polícia Civil de Rondônia (PC-RO) / Politec-RO",
    referencia: "Cebraspe, 2022",
    tipo: "direto",
    variantes: ["medico legista", "perito medico legista"],
    confianca: "media",
  },
  RR: {
    uf: "RR",
    oficial: "Médico Legista",
    orgao: "Polícia Civil de Roraima (PC-RR)",
    referencia: "Vunesp, 2022 (prova reaplicada em 2023)",
    tipo: "direto",
    variantes: ["medico legista", "perito medico legista"],
    confianca: "media",
  },
  SC: {
    uf: "SC",
    oficial: "Perito Oficial Criminal — área Medicina Legal",
    orgao: "Polícia Científica de Santa Catarina",
    referencia: "FEPESE, 2025",
    tipo: "unificado",
    variantes: [
      "perito oficial criminal",
      "perito oficial criminal medicina legal",
      "medico legista",
    ],
    confianca: "alta",
  },
  SP: {
    uf: "SP",
    oficial: "Médico Legista",
    orgao: "Superintendência da Polícia Técnico-Científica (SPTC-SP)",
    referencia: "Vunesp, 2023",
    tipo: "direto",
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
  SE: {
    uf: "SE",
    oficial: "Perito Médico-Legal",
    orgao: "SSP-SE / Instituto de Criminalística",
    referencia: "Idecan, 2023",
    tipo: "direto",
    variantes: ["perito medico legal", "medico legal", "medico legista"],
    confianca: "alta",
  },
  TO: {
    uf: "TO",
    oficial: "Médico Legista",
    orgao: "Polícia Civil do Tocantins (PC-TO)",
    referencia: "Fundação Aroeira, 2014",
    tipo: "direto",
    // "Perito Oficial" é o nome da CARREIRA no TO (subsídio, enquadramento),
    // não do cargo — não pode entrar como termo direto, senão "perito oficial
    // criminal" de qualquer área casaria como médico-legista.
    variantes: ["medico legista", "perito medico legista"],
    confianca: "alta",
  },
};

/**
 * Cargo federal equivalente. Não é estado, mas aparece nas mesmas buscas e
 * interessa ao mesmo público: na Polícia Federal o legista concorre como
 * Perito Criminal Federal na Área 12 (Medicina/Medicina Legal).
 */
export const CARGO_FEDERAL: Omit<NomeCargoUF, "uf"> = {
  oficial: "Perito Criminal Federal — Área 12 (Medicina)",
  orgao: "Polícia Federal (PF)",
  referencia: "Cebraspe, 2021",
  tipo: "unificado",
  variantes: [
    "perito criminal federal",
    "perito criminal federal area 12",
    "area 12 medicina",
    "perito federal area 12",
  ],
  confianca: "alta",
};

// ---------------------------------------------------------------------------
// Termos nacionais derivados da tabela
// ---------------------------------------------------------------------------

/**
 * Variantes que aparecem em notícia/edital mas não são o nome oficial de
 * nenhum estado — sinônimos, inversões e formas por extenso.
 */
const VARIANTES_GENERICAS_DIRETAS = [
  "legista",
  "medico legista",
  "medica legista",
  "perito legista",
  "perito medico legista",
  "perito medico legal",
  "perito oficial medico legal",
  "medico perito legista",
  "medicina legal",
  "medico legal",
  "medica legal",
  "perito em medicina legal",
  "perito oficial de medicina legal",
  "perito medico legista estadual",
];

const VARIANTES_GENERICAS_UNIFICADAS = [
  "perito oficial criminal",
  "perito oficial forense",
  "perito criminal federal",
  "perito criminal",
  "perito oficial",
];

function unir(...listas: string[][]): string[] {
  const set = new Set<string>();
  for (const lista of listas) for (const t of lista) set.add(normalizarCargo(t));
  // Mais longo primeiro: o termo mais específico é testado antes do genérico.
  return [...set].sort((a, b) => b.length - a.length);
}

const variantesPorTipo = (tipo: TipoCargo) =>
  Object.values(NOMES_CARGO_POR_UF)
    .filter((c) => c.tipo === tipo)
    .flatMap((c) => c.variantes);

/**
 * Todos os termos do país que nomeiam DIRETAMENTE o cargo. Inclui as variantes
 * de estados unificados que também usam o nome direto em notícias (ex.: o PR é
 * "Perito Oficial Criminal" no edital, mas a imprensa escreve "médico legista").
 */
export const TERMOS_CARGO_DIRETO: string[] = unir(
  variantesPorTipo("direto"),
  variantesPorTipo("unificado").filter((v) => /legista|legal/.test(v)),
  VARIANTES_GENERICAS_DIRETAS,
);

/**
 * Cargos que ENGLOBAM medicina como área. Só valem como cargo-alvo quando o
 * texto traz também um sinal de medicina (ver SINAL_MEDICINA).
 */
export const TERMOS_CARGO_UNIFICADO: string[] = unir(
  variantesPorTipo("unificado").filter((v) => !/legista|legal/.test(v)),
  CARGO_FEDERAL.variantes,
  VARIANTES_GENERICAS_UNIFICADAS,
);

/**
 * Cargos de APOIO da perícia. O nome deles contém o nome do cargo-alvo como
 * pedaço ("Auxiliar de Perícia Médico-**Legal**", "Agente de Medicina Legal"),
 * então um `includes` ingênuo os promoveria a cargo-alvo.
 *
 * Caso real: o concurso da Polícia Científica SP de 2026 tem 397 vagas —
 * Atendente de Necrotério, Auxiliar de Necropsia, Desenhista e Fotógrafo
 * Técnico-Pericial — e NENHUMA de médico-legista. Precisa ficar fora.
 *
 * Tem flag `g` porque é usada apenas em `String.replace` (que reseta
 * `lastIndex`); não use `.test()` com ela.
 */
// Cada alternativa precisa consumir TAMBÉM o qualificador do cargo de apoio:
// apagar só "auxiliar de pericia" deixaria "medico legal" solto na frase, que
// voltaria a casar como cargo-alvo.
export const CARGO_DE_APOIO =
  /\bauxiliar de pericia( medico leg(al|ista))?\b|\bauxiliar de necropsia\b|\bauxiliar de laboratorio\b|\bauxiliar de medicina legal\b|\bagente de medicina legal\b|\bagente de necrotomia\b|\batendente de necroterio( policial)?\b|\btecnico de necropsia\b|\bdesenhista tecnico pericial\b|\bfotografo tecnico pericial\b/g;

/**
 * Sinal de que um cargo unificado se refere à medicina. Usa limite de palavra:
 * `includes("medica")` casaria com "medicamento", "medicação" etc.
 */
export const SINAL_MEDICINA =
  /\bmedic[oa]s?\b|\bmedicina\b|\bmedico legal\b|\barea 12\b|\bpatologia\b|\blegista\b|\bclinica medica\b|\bpsiquiatria\b|\bnecropsia\b/;

/** Nome oficial do cargo no estado, ou null se a UF não estiver mapeada. */
export function cargoDoEstado(uf: string): NomeCargoUF | null {
  return NOMES_CARGO_POR_UF[uf] ?? null;
}

/** Tabela ordenada por UF, para exibição. */
export const NOMES_CARGO_LISTA: NomeCargoUF[] = Object.values(NOMES_CARGO_POR_UF).sort(
  (a, b) => a.uf.localeCompare(b.uf),
);
