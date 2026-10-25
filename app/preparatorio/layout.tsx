// Moldura do preparatório: a página de venda do curso avulso, sem o cabeçalho
// do mapa — pelo mesmo motivo da Black, menu em página de venda é porta de
// saída.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Preparatório Aprova Legista — concursos de médico legista | Clube Forense",
  description:
    "Tudo o que você precisa para ser aprovado em qualquer concurso para médico legista do Brasil, com professores que já são médicos legistas.",
  openGraph: {
    title: "Preparatório Aprova Legista | Clube Forense",
    description:
      "Estude com professores que já são médicos legistas. Material pré-edital, atualização pós-edital, questões, mapas mentais e muito mais.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PreparatorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
