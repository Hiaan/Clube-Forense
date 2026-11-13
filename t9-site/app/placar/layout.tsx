import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Placar | Relatórios de anúncios no WhatsApp", template: "%s | Placar" },
  description: "O resultado dos anúncios dos seus clientes chega sozinho no WhatsApp, com alertas de saldo e pagamento.",
};

export default function LayoutPlacar({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} min-h-screen bg-[#F6F7F9] text-gray-900 antialiased`} style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
