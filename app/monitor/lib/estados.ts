// As 27 unidades federativas do Brasil com o link do respectivo Diário Oficial.
//
// Os links de Diário Oficial servem como referência para verificação manual.
// Alguns portais mudam de domínio com o tempo — vale revisar periodicamente.

export interface Estado {
  uf: string;
  nome: string;
  diarioOficial: string;
}

export const ESTADOS: Estado[] = [
  { uf: "AC", nome: "Acre", diarioOficial: "https://diario.ac.gov.br/" },
  { uf: "AL", nome: "Alagoas", diarioOficial: "https://www.imprensaoficial.al.gov.br/" },
  { uf: "AP", nome: "Amapá", diarioOficial: "https://diofe.portal.ap.gov.br/" },
  { uf: "AM", nome: "Amazonas", diarioOficial: "https://www.imprensaoficial.am.gov.br/" },
  { uf: "BA", nome: "Bahia", diarioOficial: "https://www.egba.ba.gov.br/diario-oficial" },
  { uf: "CE", nome: "Ceará", diarioOficial: "https://www.imprensaoficial.ce.gov.br/" },
  { uf: "DF", nome: "Distrito Federal", diarioOficial: "https://www.dodf.df.gov.br/" },
  { uf: "ES", nome: "Espírito Santo", diarioOficial: "https://dio.es.gov.br/" },
  { uf: "GO", nome: "Goiás", diarioOficial: "https://diariooficial.abc.go.gov.br/" },
  { uf: "MA", nome: "Maranhão", diarioOficial: "https://diariooficial.ma.gov.br/" },
  { uf: "MT", nome: "Mato Grosso", diarioOficial: "https://www.iomat.mt.gov.br/" },
  { uf: "MS", nome: "Mato Grosso do Sul", diarioOficial: "https://www.spdo.ms.gov.br/diariodoe/" },
  { uf: "MG", nome: "Minas Gerais", diarioOficial: "https://www.jornalminasgerais.mg.gov.br/" },
  { uf: "PA", nome: "Pará", diarioOficial: "https://www.ioepa.com.br/" },
  { uf: "PB", nome: "Paraíba", diarioOficial: "https://auniao.pb.gov.br/servicos/diario-oficial" },
  { uf: "PR", nome: "Paraná", diarioOficial: "https://www.documentos.dioe.pr.gov.br/" },
  { uf: "PE", nome: "Pernambuco", diarioOficial: "https://www.cepe.com.br/diariooficial" },
  { uf: "PI", nome: "Piauí", diarioOficial: "https://www.diariooficial.pi.gov.br/" },
  { uf: "RJ", nome: "Rio de Janeiro", diarioOficial: "https://www.ioerj.com.br/" },
  { uf: "RN", nome: "Rio Grande do Norte", diarioOficial: "https://www.diariooficial.rn.gov.br/" },
  { uf: "RS", nome: "Rio Grande do Sul", diarioOficial: "https://www.diariooficial.rs.gov.br/" },
  { uf: "RO", nome: "Rondônia", diarioOficial: "https://diof.ro.gov.br/" },
  { uf: "RR", nome: "Roraima", diarioOficial: "https://www.imprensaoficial.rr.gov.br/" },
  { uf: "SC", nome: "Santa Catarina", diarioOficial: "https://doe.sea.sc.gov.br/" },
  { uf: "SP", nome: "São Paulo", diarioOficial: "https://www.imprensaoficial.com.br/" },
  { uf: "SE", nome: "Sergipe", diarioOficial: "https://www.segrase.se.gov.br/" },
  { uf: "TO", nome: "Tocantins", diarioOficial: "https://www.to.gov.br/diariooficial" },
];

export const ESTADO_POR_UF: Record<string, Estado> = Object.fromEntries(
  ESTADOS.map((e) => [e.uf, e]),
);

/** Mapa de nome (minúsculo, sem acento) -> sigla, para casar menções a estados. */
export const NOME_PARA_UF: Record<string, string> = Object.fromEntries(
  ESTADOS.map((e) => [normalizar(e.nome), e.uf]),
);

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
