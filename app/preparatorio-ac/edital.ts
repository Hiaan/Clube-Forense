// Os números do edital da PC-AC que a página de venda do Acre mostra.
//
// Tirados do próprio edital (Edital nº 001 SEAD/PCAC, de 05/11/2026,
// publicado no Diário Oficial do Acre de 06/11/2026), e não de matéria de
// portal. Quando sair retificação, é aqui que se troca.

export const EDITAL_AC = {
  orgao: "Polícia Civil do Acre",
  sigla: "PC-AC",
  cargo: "Perito Médico-Legista",
  banca: "Idecan",
  // O número de vagas fica fora da página de propósito, a pedido do Clube:
  // vaga pouca assusta mais do que convence. As áreas e regionais ficam.
  areas: [
    {
      area: "Medicina Legal Geral",
      onde: "Regionais do Baixo Acre (Rio Branco e região) e do Juruá (Cruzeiro do Sul e região)",
    },
    {
      area: "Medicina Legal – Psiquiatria",
      onde: "Regional do Baixo Acre · exige residência ou título de especialista em Psiquiatria",
    },
  ],
  salario: 14629.25,
  taxa: 105,
  inscricoes: "11/11 a 14/12/2026",
  dataProva: "24/01/2027",
  /** A prova de legista é à tarde, das 13h às 18h no horário do Acre (UTC-5). */
  inicioProva: "2027-01-24T13:00:00-05:00",
  /** Checkout do preparatório da PC-AC, com o cupom BLACK (passado em 06/11/2026). */
  checkout: "https://chk.eduzz.com/8WPNN43E0P?cupom=BLACK",
  editalUrl:
    "https://agencia.ac.gov.br/wp-content/uploads/2026/11/Edital-no-001-PCAC-Edital-de-abertura-05-11-2026.pdf",
  materia: "/blog/edital-pc-ac-2026-perito-medico-legista",
} as const;
