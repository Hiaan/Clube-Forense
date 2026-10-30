import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";

import { SITE } from "../lib/site";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--fonte-serif",
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--fonte-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fonte-mono",
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
  themeColor: "#0b1210",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
