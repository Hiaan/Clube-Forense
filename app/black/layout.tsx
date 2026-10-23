// Moldura da página da Black Forense.
//
// A página de oferta não usa o cabeçalho do mapa nem o do blog, e isso é
// deliberado: menu é convite para sair, e numa página de venda cada link que
// não leva ao botão é uma fuga. O que fica no topo é a marca, o acesso de quem
// já é aluno e o próprio botão.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Black Forense 2026 — todos os editais de médico-legista | Clube Forense",
  description:
    "Acesso ao preparatório de todos os concursos de médico-legista autorizados hoje, mais todo edital que sair nos próximos 2 anos. Professores que são médicos-legistas, mais de 25 mil questões comentadas e o Dr. Bonet.",
  openGraph: {
    title: "Black Forense 2026 — todos os editais de médico-legista",
    description:
      "Um preço, todos os editais autorizados e os que ainda vão sair nos próximos 2 anos.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function BlackLayout({ children }: { children: React.ReactNode }) {
  // Cada bloco da página carrega o próprio fundo (a capa é preta, o miolo é
  // claro), então a moldura fica neutra — sem isso, o branco das seções claras
  // ficaria com uma borda preta embaixo em telas altas.
  return <div className="min-h-screen bg-white">{children}</div>;
}
