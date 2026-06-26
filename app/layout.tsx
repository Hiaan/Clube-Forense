import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mentoria Aprova Legista | PC Maranhão — Clube Forense",
  description: "A mentoria que mais aprova médicos-legistas no Brasil. Prepare-se para a Polícia Civil do Maranhão com professores aprovados, plataforma exclusiva e suporte pós-prova.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  );
}
