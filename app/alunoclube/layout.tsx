// Moldura da Black dos alunos: a da Black (digital no clique, fita no topo e
// barra de rolagem zebrada), sem o cursor de lupa, e fora do Google.

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
    <div className="fita-zebrada min-h-screen bg-white">
      <FitaDeProgresso />
      {children}
      <DigitalNoClique />
    </div>
  );
}
