import type { Metadata } from "next";
import Diagnostico from "../components/Diagnostico";

// Página de entrada dos anúncios: o diagnóstico gratuito, sem menu para não tirar o foco.
export const metadata: Metadata = {
  title: "Diagnóstico gratuito da sua empresa | T9 ADS Company",
  description:
    "Responda algumas perguntas sobre redes sociais, anúncios e atendimento e receba na hora uma nota para cada área e as três ações que mais devem trazer clientes.",
  alternates: { canonical: "/diagnostico" },
  openGraph: {
    title: "Diagnóstico gratuito | T9 ADS Company",
    description: "Descubra em 3 minutos o que está travando as vendas da sua empresa.",
    images: ["/og.jpg"],
    locale: "pt_BR",
    type: "website",
    url: "/diagnostico",
  },
};

export default function PaginaDiagnostico() {
  return (
    <div lang="pt-BR">
      <Diagnostico />
    </div>
  );
}
