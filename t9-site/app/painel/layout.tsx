import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel | T9 ADS Company",
  robots: { index: false, follow: false },
};

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return <div className="painel-fundo text-white">{children}</div>;
}
