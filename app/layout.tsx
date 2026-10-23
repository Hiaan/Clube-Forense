import type { Metadata } from "next";
import { Geist } from "next/font/google";

import PixelMeta from "./components/PixelMeta";
import { baseDoSite } from "./lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  // Endereço absoluto das imagens de prévia: o WhatsApp não segue caminho
  // relativo, e sem isto o og:image sairia apontando para lugar nenhum.
  metadataBase: new URL(baseDoSite()),
  title: "Monitor de Concursos — Médico-Legista | Clube Forense",
  description:
    "Radar dos concursos para perito médico-legista nas 27 unidades federativas: estágio do edital, curadoria verificada e notícias atualizadas.",
  // A lupa do Clube, sem o nome. A hélice da versão clara é escura e sumiria
  // numa aba escura; por isso o navegador em tema escuro recebe a versão de
  // hélice branca. O favicon.ico de app/ fica como reserva para quem ignora
  // estas duas.
  icons: {
    icon: [
      { url: "/icone-claro.png", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icone-escuro.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    // Atalho na tela do iPhone: a lupa branca sobre o preto do site, porque o
    // iOS preenche a transparência com preto e a hélice escura sumiria.
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="min-h-screen bg-white text-gray-900">
        {children}
        {/* Depois do conteúdo: medição nunca na frente do que a pessoa veio ler. */}
        <PixelMeta />
      </body>
    </html>
  );
}
