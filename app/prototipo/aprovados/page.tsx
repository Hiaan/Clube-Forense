// Bancada de testes do mapa interativo dos aprovados.
//
// Fica fora da Black de propósito, a pedido do Clube: aqui o mapa é ajustado
// sozinho e, aprovado, entra na página de vendas com uma linha
// (<MapaAprovados />). Sem link em lugar nenhum e fora do Google.

import type { Metadata } from "next";

import MapaAprovados from "../../components/MapaAprovados";

export const metadata: Metadata = {
  title: "Protótipo — mapa dos aprovados | Clube Forense",
  robots: { index: false, follow: false },
};

export default function PrototipoAprovados() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
          por que escolher o Clube Forense?
        </p>
        <h2 className="mt-3 text-center text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
          Desde 2024, nos primeiros lugares de todos os concursos
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
          Não importa o número de vagas do concurso: aqui você estará no topo.
        </p>
        <div className="mt-12">
          <MapaAprovados />
        </div>
      </section>
    </div>
  );
}
