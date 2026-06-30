// Dados de demonstração usados como fallback quando NENHUMA fonte externa pôde
// ser consultada (ex.: ambiente de desenvolvimento com rede restrita). Em
// produção, na Vercel, o coletor busca dados reais e estes não são usados.

import type { Mencao } from "./tipos";

export const MENCOES_DEMO: Mencao[] = [
  {
    uf: "MA",
    titulo:
      "[DEMONSTRAÇÃO] PC do Maranhão publica edital com vagas para perito médico-legista",
    link: "https://www.diariooficial.ma.gov.br/",
    fonte: "Exemplo",
    data: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    nivel: "edital",
    resumo:
      "Dado de exemplo exibido porque as fontes externas estão indisponíveis neste ambiente. Em produção, esta menção viria de uma busca real.",
  },
  {
    uf: "SP",
    titulo:
      "[DEMONSTRAÇÃO] Governo de São Paulo autoriza concurso da perícia com banca em definição",
    link: "https://www.imprensaoficial.com.br/",
    fonte: "Exemplo",
    data: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    nivel: "banca",
    resumo: "Dado de exemplo. Substituído por dados reais quando publicado.",
  },
  {
    uf: "BA",
    titulo:
      "[DEMONSTRAÇÃO] Bahia estuda novo concurso para médico legista da Polícia Técnica",
    link: "https://www.egba.ba.gov.br/diario-oficial",
    fonte: "Exemplo",
    data: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    nivel: "previsto",
    resumo: "Dado de exemplo. Substituído por dados reais quando publicado.",
  },
  {
    uf: "PR",
    titulo:
      "[DEMONSTRAÇÃO] Repercussão sobre carreira de médico-legista no Paraná",
    link: "https://www.documentos.dioe.pr.gov.br/",
    fonte: "Exemplo",
    data: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    nivel: "noticia",
    resumo: "Dado de exemplo. Substituído por dados reais quando publicado.",
  },
];
