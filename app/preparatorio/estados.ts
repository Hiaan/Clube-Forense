// Os preparatórios por estado: um produto da Eduzz para cada UF.
//
// Cada linha vira uma página /preparatorio-xx (ver PaginaEstado e o rewrite
// em next.config.ts). Acre e Tocantins têm página com seção própria, escrita
// à mão (preparatorio-ac, preparatorio-to); as pastas deles vencem o rewrite,
// e as linhas daqui servem só para o sitemap e o llms.txt.
//
// LINKS: os kits da Appmax com o cupom BLACK (planilha LINKS-BLACK, de
// 26/11/2026): de R$ 4.997 (12x R$ 510,86) por R$ 3.447 (12x R$ 352,40).
//
// O NOME DO CARGO e do órgão são os do último concurso de cada estado
// (nomenclaturas.ts), escritos por extenso para caber num título: "Perito
// Oficial Criminal — área Medicina" vira "Médico Legista" na capa, e a ficha
// explica o nome oficial.

export interface EstadoPreparatorio {
  uf: string;
  /** "Polícia Civil do Rio de Janeiro". */
  orgao: string;
  /** Artigo + órgão, para "como Médico Legista da Polícia Civil do RJ". */
  doOrgao: string;
  /** Sigla curta, quando há uma que o candidato reconhece. */
  sigla?: string;
  /** Como o cargo aparece na capa. */
  cargo: string;
  /** Nome oficial, quando é diferente do da capa. */
  cargoOficial?: string;
  checkout: string;
  /** Página com seção própria (não usa a genérica). */
  propria?: boolean;
  /** Link provisório, à espera do produto do estado. */
  provisorio?: boolean;
}

// CHECKOUT NA APPMAX desde 26/11/2026 (antes, Eduzz). O código é o do kit
// na Appmax; o cupom BLACK vai como `coupon`.
const BLACK = (kit: string) =>
  `https://clubeforense.carrinho.app/one-checkout/ocmsb/${kit}?coupon=BLACK`;

export const GERAL = BLACK("39357454");

export const ESTADOS_PREPARATORIO: EstadoPreparatorio[] = [
  { uf: "AC", orgao: "Polícia Civil do Acre", doOrgao: "da Polícia Civil do Acre", sigla: "PC-AC", cargo: "Perito Médico-Legista", checkout: BLACK("39357790"), propria: true },
  { uf: "AL", orgao: "Perícia Oficial de Alagoas", doOrgao: "da Perícia Oficial de Alagoas", cargo: "Perito Médico-Legista", checkout: BLACK("39357767") },
  { uf: "AP", orgao: "Polícia Técnico-Científica do Amapá", doOrgao: "da Polícia Técnico-Científica do Amapá", sigla: "Politec-AP", cargo: "Perito Médico-Legista", checkout: BLACK("39357752") },
  { uf: "AM", orgao: "Polícia Civil do Amazonas", doOrgao: "da Polícia Civil do Amazonas", sigla: "PC-AM", cargo: "Perito Legista", checkout: BLACK("39357818") },
  { uf: "BA", orgao: "Departamento de Polícia Técnica da Bahia", doOrgao: "do Departamento de Polícia Técnica da Bahia", sigla: "DPT-BA", cargo: "Perito Médico-Legista", checkout: BLACK("39357717") },
  { uf: "CE", orgao: "Perícia Forense do Ceará", doOrgao: "da Perícia Forense do Ceará", sigla: "Pefoce", cargo: "Médico Legista", checkout: BLACK("39358047") },
  { uf: "DF", orgao: "Polícia Civil do Distrito Federal", doOrgao: "da Polícia Civil do Distrito Federal", sigla: "PCDF", cargo: "Perito Médico-Legista", checkout: BLACK("39358113") },
  { uf: "ES", orgao: "Polícia Científica do Espírito Santo", doOrgao: "da Polícia Científica do Espírito Santo", sigla: "PCI-ES", cargo: "Médico Legista", checkout: BLACK("39357985") },
  { uf: "GO", orgao: "Polícia Científica de Goiás", doOrgao: "da Polícia Científica de Goiás", sigla: "SPTC-GO", cargo: "Médico Legista", checkout: BLACK("39358268") },
  { uf: "MA", orgao: "Perícia Oficial do Maranhão", doOrgao: "da Perícia Oficial do Maranhão", sigla: "PO-MA", cargo: "Médico Legista", checkout: BLACK("39358283") },
  { uf: "MT", orgao: "Perícia Oficial e Identificação Técnica de Mato Grosso", doOrgao: "da Politec de Mato Grosso", sigla: "POLITEC-MT", cargo: "Perito Médico-Legista", checkout: BLACK("39357901") },
  { uf: "MS", orgao: "Coordenadoria-Geral de Perícias de Mato Grosso do Sul", doOrgao: "da Perícia Oficial de Mato Grosso do Sul", cargo: "Perito Médico-Legista", cargoOficial: "Perito Oficial Forense, função Perito Médico Legista", checkout: BLACK("39357660") },
  { uf: "MG", orgao: "Polícia Civil de Minas Gerais", doOrgao: "da Polícia Civil de Minas Gerais", sigla: "PC-MG", cargo: "Médico Legista", checkout: BLACK("39358245") },
  { uf: "PA", orgao: "Polícia Científica do Pará", doOrgao: "da Polícia Científica do Pará", cargo: "Perito Médico-Legista", checkout: BLACK("39358138") },
  { uf: "PB", orgao: "Polícia Civil da Paraíba", doOrgao: "da Polícia Civil da Paraíba", sigla: "PC-PB", cargo: "Perito Médico-Legal", cargoOficial: "Perito Oficial Médico-Legal", checkout: BLACK("39357871") },
  { uf: "PR", orgao: "Polícia Científica do Paraná", doOrgao: "da Polícia Científica do Paraná", cargo: "Médico Legista", cargoOficial: "Perito Oficial Criminal, área Medicina", checkout: BLACK("39357624") },
  { uf: "PE", orgao: "Polícia Científica de Pernambuco", doOrgao: "da Polícia Científica de Pernambuco", sigla: "POLITEC-PE", cargo: "Médico Legista", checkout: BLACK("39357940") },
  { uf: "PI", orgao: "Polícia Civil do Piauí", doOrgao: "da Polícia Civil do Piauí", sigla: "PC-PI", cargo: "Perito Médico-Legista", checkout: BLACK("39358176") },
  { uf: "RJ", orgao: "Polícia Civil do Rio de Janeiro", doOrgao: "da Polícia Civil do Rio de Janeiro", sigla: "PCERJ", cargo: "Perito Legista", checkout: BLACK("39358078") },
  { uf: "RN", orgao: "Instituto Técnico-Científico de Perícia do Rio Grande do Norte", doOrgao: "do ITEP do Rio Grande do Norte", sigla: "ITEP-RN", cargo: "Perito Médico-Legista", checkout: BLACK("39357602") },
  { uf: "RS", orgao: "Instituto-Geral de Perícias do Rio Grande do Sul", doOrgao: "do Instituto-Geral de Perícias do RS", sigla: "IGP-RS", cargo: "Perito Médico-Legista", checkout: BLACK("39358160") },
  { uf: "RO", orgao: "Polícia Civil de Rondônia", doOrgao: "da Polícia Civil de Rondônia", sigla: "PC-RO", cargo: "Médico Legista", checkout: BLACK("39357584") },
  { uf: "RR", orgao: "Polícia Civil de Roraima", doOrgao: "da Polícia Civil de Roraima", sigla: "PC-RR", cargo: "Médico Legista", checkout: BLACK("39357538") },
  { uf: "SC", orgao: "Polícia Científica de Santa Catarina", doOrgao: "da Polícia Científica de Santa Catarina", cargo: "Médico Legista", cargoOficial: "Perito Oficial Criminal, área Medicina Legal", checkout: BLACK("39358011") },
  { uf: "SP", orgao: "Superintendência da Polícia Técnico-Científica de São Paulo", doOrgao: "da Polícia Técnico-Científica de São Paulo", sigla: "SPTC-SP", cargo: "Médico Legista", checkout: BLACK("39357486") },
  { uf: "SE", orgao: "Secretaria de Segurança Pública de Sergipe", doOrgao: "da Perícia de Sergipe", cargo: "Perito Médico-Legal", checkout: BLACK("39357506") },
  { uf: "TO", orgao: "Polícia Civil do Tocantins", doOrgao: "da Polícia Civil do Tocantins", sigla: "PC-TO", cargo: "Médico Legista", checkout: BLACK("39358224"), propria: true },
];

/**
 * Distintivos dos órgãos que já existem no site (os da faixa de editais da
 * Black, em public/black/orgaos). Para um estado novo, basta o arquivo
 * `UF.webp` lá e a sigla aqui.
 */
const BRASOES: Record<string, string> = {
  AC: "AC", AM: "AM-v2", DF: "DF", ES: "ES", MA: "MA", MG: "MG",
  MT: "MT", PA: "PA", PE: "PE-v2", RJ: "RJ", TO: "TO",
};

export function brasaoDoEstado(uf: string): string | undefined {
  const arquivo = BRASOES[uf.toUpperCase()];
  return arquivo ? `/black/orgaos/${arquivo}.webp` : undefined;
}

export function estadoPreparatorio(uf: string): EstadoPreparatorio | null {
  return ESTADOS_PREPARATORIO.find((e) => e.uf === uf.toUpperCase()) ?? null;
}

/** "/preparatorio-rj". */
export function caminhoPreparatorio(uf: string): string {
  return `/preparatorio-${uf.toLowerCase()}`;
}
