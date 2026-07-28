// Histórico do último concurso com o cargo de médico-legista por estado:
// data do último edital, data da última prova e banca organizadora.
//
// Fonte primária: QConcursos / Folha Dirigida (páginas de concurso e notícias),
// levantado por pesquisa em jul/2026. Campos com null = não localizado com
// segurança — preferimos "—" a dado impreciso. Atualize quando novos editais
// saírem (e ajuste VERIFICADO_EM).

export const HISTORICO_VERIFICADO_EM = "2026-07-26";

export interface HistoricoConcurso {
  /** Quando saiu o último edital com o cargo (texto de exibição). */
  ultimoEdital: string | null;
  /** Quando foi a última prova para o cargo (texto de exibição). */
  ultimaProva: string | null;
  /** Banca organizadora do último certame. */
  banca: string | null;
  /** Observação curta (vagas, particularidades). */
  obs?: string;
}

export const HISTORICO_CONCURSOS: Record<string, HistoricoConcurso> = {
  AC: {
    ultimoEdital: "2015",
    ultimaProva: "2015",
    banca: "Funcab",
    obs: "Última prova de perito médico-legista (PC-AC). O concurso geral seguinte da PC-AC foi em 2017 (Ibade).",
  },
  AL: {
    ultimoEdital: "28/04/2022",
    ultimaProva: "31/07/2022",
    banca: "Cebraspe",
    obs: "Perícia Oficial AL — 242 vagas no total, incluindo perito médico-legista.",
  },
  AP: {
    ultimoEdital: "2017",
    ultimaProva: "2017",
    banca: "FCC",
    obs: "Politec-AP — perito médico legista (inclusive psiquiatria). Houve movimentação para novo edital a partir de 2022.",
  },
  AM: {
    ultimoEdital: "dez/2021",
    ultimaProva: "03/04/2022",
    banca: "FGV",
    obs: "PC-AM — 8 vagas de perito legista (medicina).",
  },
  BA: {
    ultimoEdital: "set/2022",
    ultimaProva: "11/12/2022",
    banca: "Idecan",
    obs: "PC-BA/Polícia Técnica (DPT) — 103 vagas de perito médico legista.",
  },
  CE: {
    ultimoEdital: "2021",
    ultimaProva: "31/07/2021",
    banca: "Idecan",
    obs: "Pefoce — médico perito-legista.",
  },
  DF: {
    ultimoEdital: "2014",
    ultimaProva: "2014",
    banca: "Fundação Universa",
    obs: "PC-DF — último concurso para médico legista.",
  },
  ES: {
    ultimoEdital: "2018",
    ultimaProva: null,
    banca: "Instituto AOCP",
    obs: "PCI-ES — 15 vagas de médico legista.",
  },
  GO: {
    ultimoEdital: "mai/2024",
    ultimaProva: "04/08/2024",
    banca: "Iades",
    obs: "Polícia Científica GO (SPTC) — 111 vagas de médico legista + 6 de odontolegista.",
  },
  MA: {
    ultimoEdital: "jul/2026",
    ultimaProva: "2018",
    banca: "Cebraspe",
    obs: "Edital de 2026 publicado (Perícia Oficial de Natureza Criminal): 25 vagas de Médico Legista, inscrições de 31/07 a 05/10/2026 e prova marcada para 10/01/2027 — por isso a última prova aplicada segue sendo a de 2018 (edital de 2017, 415 vagas).",
  },
  MT: {
    ultimoEdital: "2022",
    ultimaProva: "2022",
    banca: "UFMT",
    obs: "Politec-MT — apenas cadastro de reserva para medicina legal.",
  },
  MS: {
    ultimoEdital: "2021",
    ultimaProva: null,
    banca: "Fapec",
    obs: "Sejusp-MS/Coordenadoria-Geral de Perícias — datas da prova de médico legista não localizadas.",
  },
  MG: {
    ultimoEdital: "20/08/2024",
    ultimaProva: "26/01/2025",
    banca: "FGV",
    obs: "PC-MG — 255 vagas de nível superior; dissertativa de médico legista em 15/06/2025.",
  },
  PA: {
    ultimoEdital: "2018",
    ultimaProva: null,
    banca: "Fadesp",
    obs: "Último concurso efetivo. Em 2024 e 2026 houve PSS (temporário) com vagas de perito médico legista.",
  },
  PB: {
    ultimoEdital: "out/2021",
    ultimaProva: "13/02/2022",
    banca: "Cebraspe",
    obs: "PC-PB — perito oficial médico-legal.",
  },
  PR: {
    ultimoEdital: "fev/2024",
    ultimaProva: "21/04/2024",
    banca: "IBFC",
    obs: "Polícia Científica PR — perito oficial criminal (13 áreas, incluindo medicina).",
  },
  PE: {
    ultimoEdital: "abr/2024",
    ultimaProva: "21/07/2024",
    banca: "Instituto AOCP",
    obs: "Politec-PE — 60 vagas de médico legista (213 no total).",
  },
  PI: {
    ultimoEdital: "2025",
    ultimaProva: "25/01/2026",
    banca: "FGV",
    obs: "PC-PI — 416 vagas no total, incluindo perito médico legista (e patologia).",
  },
  RJ: {
    ultimoEdital: "2021",
    ultimaProva: "2021",
    banca: null,
    obs: "PCERJ — perito legista (exclusivo para medicina) no certame de 2021.",
  },
  RN: {
    ultimoEdital: "2021",
    ultimaProva: "25/07/2021",
    banca: "Instituto AOCP",
    obs: "ITEP-RN — 23 vagas de perito médico legista (anterior: prova em 04/02/2018).",
  },
  RS: {
    ultimoEdital: "16/09/2025",
    ultimaProva: "14/12/2025",
    banca: "Fundatec",
    obs: "IGP-RS — 54 vagas de perito médico-legista; resultados homologados em 2026.",
  },
  RO: {
    ultimoEdital: "2022",
    ultimaProva: "2022",
    banca: "Cebraspe",
    obs: "PC-RO 2022 incluiu médico legista; a Politec-RO teve edital próprio em 2022 (60 vagas de nível superior).",
  },
  RR: {
    ultimoEdital: "2022",
    ultimaProva: "24/09/2023",
    banca: "Vunesp",
    obs: "PC-RR — prova de médico legista reaplicada em 2023 após anulações no certame de 2022.",
  },
  SC: {
    ultimoEdital: "19/12/2025",
    ultimaProva: "22/02/2026",
    banca: "FEPESE",
    obs: "Polícia Científica SC — 60 vagas de perito oficial criminal (cargo unificado), das quais 30 imediatas em medicina legal e medicina legal/psiquiatria. Ciclo encerrado: prova aplicada em 22/02/2026.",
  },
  SP: {
    ultimoEdital: "set/2023",
    ultimaProva: "03/12/2023",
    banca: "Vunesp",
    obs: "PC-SP — 116 vagas de médico legista.",
  },
  SE: {
    ultimoEdital: "jan/2023",
    ultimaProva: "09/04/2023",
    banca: "Idecan",
    obs: "SSP-SE — 15 vagas de perito médico-legal.",
  },
  TO: {
    ultimoEdital: "2014",
    ultimaProva: "2014",
    banca: "Fundação Aroeira",
    obs: "PC-TO — 12 vagas de médico legista (9 imediatas + 3 CR) no último certame.",
  },
};
