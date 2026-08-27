import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monitor de Concursos — Médico-Legista | Clube Forense",
  description:
    "Radar dos concursos para perito médico-legista nas 27 unidades federativas: estágio do edital, curadoria verificada e notícias atualizadas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  );
}
