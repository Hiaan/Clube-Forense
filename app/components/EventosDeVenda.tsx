"use client";

// Os eventos de venda do pixel numa página de oferta.
//
//   ViewContent       — a pessoa abriu a página da oferta (uma vez por visita
//                       à página), com o produto e o preço do momento;
//   InitiateCheckout  — clicou num link de checkout da Eduzz; o valor vem do
//                       próprio botão (`data-valor`), que sabe o preço do lote
//                       ou da versão que está valendo naquele instante;
//   Contact           — clicou para falar no WhatsApp.
//
// A COMPRA (Purchase) NÃO É DISPARADA AQUI, e não tem como ser: o pagamento
// acontece na Eduzz, fora deste site. Quem dispara a compra é a própria Eduzz,
// com o pixel configurado no produto — e só ela sabe se o pagamento foi
// aprovado.
//
// Os cliques são ouvidos no documento inteiro, e não botão por botão: assim
// todo link de checkout ou de WhatsApp da página conta, inclusive os que
// forem criados depois, sem ninguém lembrar de marcar.

import { useEffect } from "react";

import { rastrear } from "./PixelMeta";

export default function EventosDeVenda({
  produto,
  valor,
}: {
  /** Nome do produto como deve aparecer no Gerenciador de Eventos. */
  produto: string;
  /** Preço à vista do momento, em reais. */
  valor: number;
}) {
  useEffect(() => {
    // Depois do PageView, que o pixel do layout conta no mesmo instante.
    const id = setTimeout(() =>
      rastrear("ViewContent", {
        content_name: produto,
        content_type: "product",
        value: valor,
        currency: "BRL",
      }),
    );

    function aoClicar(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link) return;
      const href = link.href;
      if (href.includes("eduzz.com")) {
        const v = Number(link.dataset.valor);
        rastrear("InitiateCheckout", {
          content_name: produto,
          value: Number.isFinite(v) && v > 0 ? v : valor,
          currency: "BRL",
          num_items: 1,
        });
      } else if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        rastrear("Contact", { content_name: produto });
      }
    }

    document.addEventListener("click", aoClicar, true);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", aoClicar, true);
    };
    // O ViewContent é da visita à página, não de cada troca de lote: o preço
    // que importa é o de quando ela chegou.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produto]);

  return null;
}
