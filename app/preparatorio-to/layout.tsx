// Moldura do preparatório da PC-TO: como a do preparatório geral, sem o
// cabeçalho do mapa.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Preparatório PC-TO — médico legista da Polícia Civil do Tocantins | Clube Forense",
  description:
    "Banca Cebraspe definida para o concurso da Polícia Civil do Tocantins. Prepare-se para médico legista (perito oficial, subsídio inicial de R$ 15.763,91) com professores que já são médicos legistas.",
  openGraph: {
    title: "Preparatório PC-TO · médico legista | Clube Forense",
    description:
      "Banca Cebraspe definida. Comece antes do edital, com professores médicos legistas.",
    type: "website",
  },
  alternates: { canonical: "/preparatorio-to" },
  robots: { index: true, follow: true },
};

export default function PreparatorioTocantinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
