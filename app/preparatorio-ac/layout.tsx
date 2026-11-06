// Moldura do preparatório da PC-AC: como a do preparatório geral, sem o
// cabeçalho do mapa.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Preparatório PC-AC — perito médico-legista da Polícia Civil do Acre | Clube Forense",
  description:
    "Edital publicado: 4 vagas para perito médico-legista, salário de R$ 14.629,25 e prova em 24/01/2027. Estude com professores que já são médicos legistas.",
  openGraph: {
    title: "Preparatório PC-AC · perito médico-legista | Clube Forense",
    description:
      "4 vagas, R$ 14.629,25 e prova em 24/01/2027. Prepare-se para o edital da Polícia Civil do Acre com professores médicos legistas.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PreparatorioAcreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
