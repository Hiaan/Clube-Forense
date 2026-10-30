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
  "Mentoria individualizada em Medicina Legal com o Dr. Miguel Souza: médico legista de carreira, doutorando em Perícias Forenses, instrutor da Academia de Polícia e professor de mais de 240 aprovados. Encontros semanais, só com você, até o dia da prova.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Mentoria Individualizada em Medicina Legal | Dr. Miguel Souza",
  description: descricao,
  openGraph: {
    title: "Mentoria Individualizada em Medicina Legal — Dr. Miguel Souza",
    description:
      "Pela primeira vez, o professor de mais de 240 médicos legistas aprovados vai acompanhar só você, toda semana, até o dia da prova.",
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
