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
  // Título, descrição e prévia ficam em cada página (lib/metadados.ts), no idioma dela.
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
