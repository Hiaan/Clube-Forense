import type { Metadata, Viewport } from "next";
import { Anton, Montserrat } from "next/font/google";

import { SITE } from "../lib/site";
import "./globals.css";

const sans = Montserrat({
  subsets: ["latin"],
  variable: "--fonte-sans",
  display: "swap",
});

const impacto = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--fonte-impacto",
  display: "swap",
});

const descricao =
  "Mentoria individualizada e personalizada em Medicina Legal com o Dr. Miguel Souza, médico legista de carreira, doutorando em Perícias Forenses e instrutor de Academia de Polícia. O plano nasce de uma reunião gratuita: perfil, rotina, pontos fortes e fracos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Mentoria Individualizada em Medicina Legal | Dr. Miguel Souza",
  description: descricao,
  openGraph: {
    title: "Mentoria Individualizada em Medicina Legal — Dr. Miguel Souza",
    description:
      "Não é a mesma mentoria para todo mundo: o seu plano de estudo nasce de uma reunião individual e gratuita.",
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a1828",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${impacto.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
