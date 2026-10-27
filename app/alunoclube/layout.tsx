// Moldura da Black dos alunos: a mesma da Black (cursor de lupa, digital no
// clique, fita no topo), fora do Google e sem prévia que entregue o preço.

import type { Metadata } from "next";

import DigitalNoClique from "../black/DigitalNoClique";
import FitaDeProgresso from "../black/FitaDeProgresso";

export const metadata: Metadata = {
  title: "Black Vitalícia para alunos | Clube Forense",
  description: "Oferta exclusiva para alunos do Clube Forense.",
  // Página de aluno, com link circulando em grupo: não deve aparecer em busca.
  robots: { index: false, follow: false },
};

export default function AlunoClubeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cursor-lupa min-h-screen bg-white">
      <FitaDeProgresso />
      {children}
      <DigitalNoClique />
    </div>
  );
}
