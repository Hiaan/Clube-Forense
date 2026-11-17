// Os preparatórios por estado: um produto da Eduzz para cada UF.
//
// Cada linha vira uma página /preparatorio-xx (ver PaginaEstado e o rewrite
// em next.config.ts). Acre e Tocantins têm página com seção própria, escrita
// à mão (preparatorio-ac, preparatorio-to); as pastas deles vencem o rewrite,
// e as linhas daqui servem só para o sitemap e o llms.txt.
//
// LINKS: os 27 produtos do cupom BLACK passados pelo Clube em 17/11/2026
// (de R$ 4.997 por R$ 3.447); o do Maranhão veio logo depois, no mesmo dia.
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

const BLACK = (codigo: string) => `https://chk.eduzz.com/${codigo}?cupom=BLACK`;

export const GERAL = BLACK("2325387");

export const ESTADOS_PREPARATORIO: EstadoPreparatorio[] = [
  { uf: "AC", orgao: "Polícia Civil do Acre", doOrgao: "da Polícia Civil do Acre", sigla: "PC-AC", cargo: "Perito Médico-Legista", checkout: BLACK("8WPNN43E0P"), propria: true },
  { uf: "AL", orgao: "Perícia Oficial de Alagoas", doOrgao: "da Perícia Oficial de Alagoas", cargo: "Perito Médico-Legista", checkout: BLACK("1W32261592") },
  { uf: "AP", orgao: "Polícia Técnico-Científica do Amapá", doOrgao: "da Polícia Técnico-Científica do Amapá", sigla: "Politec-AP", cargo: "Perito Médico-Legista", checkout: BLACK("E0DKKO1691") },
  { uf: "AM", orgao: "Polícia Civil do Amazonas", doOrgao: "da Polícia Civil do Amazonas", sigla: "PC-AM", cargo: "Perito Legista", checkout: BLACK("69K11Q3EWO") },
  { uf: "BA", orgao: "Departamento de Polícia Técnica da Bahia", doOrgao: "do Departamento de Polícia Técnica da Bahia", sigla: "DPT-BA", cargo: "Perito Médico-Legista", checkout: BLACK("39VKKA7KWR") },
  { uf: "CE", orgao: "Perícia Forense do Ceará", doOrgao: "da Perícia Forense do Ceará", sigla: "Pefoce", cargo: "Médico Legista", checkout: BLACK("40Q3VK5P0B") },
  { uf: "DF", orgao: "Polícia Civil do Distrito Federal", doOrgao: "da Polícia Civil do Distrito Federal", sigla: "PCDF", cargo: "Perito Médico-Legista", checkout: BLACK("39YBQJ1DWO") },
  { uf: "ES", orgao: "Polícia Científica do Espírito Santo", doOrgao: "da Polícia Científica do Espírito Santo", sigla: "PCI-ES", cargo: "Médico Legista", checkout: BLACK("801EB1ANW7") },
  { uf: "GO", orgao: "Polícia Científica de Goiás", doOrgao: "da Polícia Científica de Goiás", sigla: "SPTC-GO", cargo: "Médico Legista", checkout: BLACK("2383204") },
  { uf: "MA", orgao: "Perícia Oficial do Maranhão", doOrgao: "da Perícia Oficial do Maranhão", sigla: "PO-MA", cargo: "Médico Legista", checkout: BLACK("2450939") },
  { uf: "MT", orgao: "Perícia Oficial e Identificação Técnica de Mato Grosso", doOrgao: "da Politec de Mato Grosso", sigla: "POLITEC-MT", cargo: "Perito Médico-Legista", checkout: BLACK("6W4G5J5N0Z") },
  { uf: "MS", orgao: "Coordenadoria-Geral de Perícias de Mato Grosso do Sul", doOrgao: "da Perícia Oficial de Mato Grosso do Sul", cargo: "Perito Médico-Legista", cargoOficial: "Perito Oficial Forense, função Perito Médico Legista", checkout: BLACK("Z0B11V8R9A") },
  { uf: "MG", orgao: "Polícia Civil de Minas Gerais", doOrgao: "da Polícia Civil de Minas Gerais", sigla: "PC-MG", cargo: "Médico Legista", checkout: BLACK("2427875") },
  { uf: "PA", orgao: "Polícia Científica do Pará", doOrgao: "da Polícia Científica do Pará", cargo: "Perito Médico-Legista", checkout: BLACK("Q9NDX72K01") },
  { uf: "PB", orgao: "Polícia Civil da Paraíba", doOrgao: "da Polícia Civil da Paraíba", sigla: "PC-PB", cargo: "Perito Médico-Legal", cargoOficial: "Perito Oficial Médico-Legal", checkout: BLACK("80177GBK07") },
  { uf: "PR", orgao: "Polícia Científica do Paraná", doOrgao: "da Polícia Científica do Paraná", cargo: "Médico Legista", cargoOficial: "Perito Oficial Criminal, área Medicina", checkout: BLACK("39ZRRZN7WE") },
  { uf: "PE", orgao: "Polícia Científica de Pernambuco", doOrgao: "da Polícia Científica de Pernambuco", sigla: "POLITEC-PE", cargo: "Médico Legista", checkout: BLACK("7WXQR5DG9A") },
  { uf: "PI", orgao: "Polícia Civil do Piauí", doOrgao: "da Polícia Civil do Piauí", sigla: "PC-PI", cargo: "Perito Médico-Legista", checkout: BLACK("E9OB186V0B") },
  { uf: "RJ", orgao: "Polícia Civil do Rio de Janeiro", doOrgao: "da Polícia Civil do Rio de Janeiro", sigla: "PCERJ", cargo: "Perito Legista", checkout: BLACK("801EZD46W7") },
  { uf: "RN", orgao: "Instituto Técnico-Científico de Perícia do Rio Grande do Norte", doOrgao: "do ITEP do Rio Grande do Norte", sigla: "ITEP-RN", cargo: "Perito Médico-Legista", checkout: BLACK("39YNNVG3WO") },
  { uf: "RS", orgao: "Instituto-Geral de Perícias do Rio Grande do Sul", doOrgao: "do Instituto-Geral de Perícias do RS", sigla: "IGP-RS", cargo: "Perito Médico-Legista", checkout: BLACK("R9JY57QY9X") },
  { uf: "RO", orgao: "Polícia Civil de Rondônia", doOrgao: "da Polícia Civil de Rondônia", sigla: "PC-RO", cargo: "Médico Legista", checkout: BLACK("6W4GGQ760Z") },
  { uf: "RR", orgao: "Polícia Civil de Roraima", doOrgao: "da Polícia Civil de Roraima", sigla: "PC-RR", cargo: "Médico Legista", checkout: BLACK("7WXGGE220A") },
  { uf: "SC", orgao: "Polícia Científica de Santa Catarina", doOrgao: "da Polícia Científica de Santa Catarina", cargo: "Médico Legista", cargoOficial: "Perito Oficial Criminal, área Medicina Legal", checkout: BLACK("39ZQ536B9E") },
  { uf: "SP", orgao: "Superintendência da Polícia Técnico-Científica de São Paulo", doOrgao: "da Polícia Técnico-Científica de São Paulo", sigla: "SPTC-SP", cargo: "Médico Legista", checkout: BLACK("69K11QPEWO") },
  { uf: "SE", orgao: "Secretaria de Segurança Pública de Sergipe", doOrgao: "da Perícia de Sergipe", cargo: "Perito Médico-Legal", checkout: BLACK("80177G8K07") },
  { uf: "TO", orgao: "Polícia Civil do Tocantins", doOrgao: "da Polícia Civil do Tocantins", sigla: "PC-TO", cargo: "Médico Legista", checkout: BLACK("Z0BB2EJ30A"), propria: true },
];

export function estadoPreparatorio(uf: string): EstadoPreparatorio | null {
  return ESTADOS_PREPARATORIO.find((e) => e.uf === uf.toUpperCase()) ?? null;
}

/** "/preparatorio-rj". */
export function caminhoPreparatorio(uf: string): string {
  return `/preparatorio-${uf.toLowerCase()}`;
}
