import type { Metadata, Viewport } from "next";
import { Archivo, Lexend } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "T9 ADS Company | Tráfego, estrutura e escala para sua empresa",
  description:
    "Entendemos o seu negócio, estruturamos o caminho e construímos tráfego pago, CRM, funis, automações e dashboards para sua empresa escalar. Agende uma consultoria gratuita.",
  openGraph: {
    title: "Entenda o que a T9 faz",
    description:
      "Tráfego pago, páginas de vendas, CRM, funis e automações. Em 4 semanas, sua empresa começa a operar de outra forma.",
    images: ["/og.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070102",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${lexend.variable} sem-js`}>
      <head>
        {/* Só esconde os elementos animados quando o JavaScript está disponível. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('sem-js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
