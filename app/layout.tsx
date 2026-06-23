import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aprova Legista | Mentoria para Médico Legista — PC Maranhão",
  description:
    "A mentoria feita por médicos legistas para futuros médicos legistas. Plataforma completa com IA Dr. Bonnet, cronograma automático e acompanhamento até a aprovação. PC Maranhão 2025.",
  keywords: [
    "médico legista",
    "concurso médico legista",
    "PC Maranhão",
    "polícia civil maranhão",
    "medicina legal concurso",
    "aprova legista",
    "mentoria médico legista",
  ],
  openGraph: {
    title: "Aprova Legista — Mentoria para Médico Legista PC Maranhão",
    description:
      "100% dos 1º lugares nos últimos concursos para médico legista. Metodologia exclusiva com IA, videoaulas, flashcards e acompanhamento pós-prova.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#070a12] text-[#eef0f8]">
        {children}
      </body>
    </html>
  );
}
