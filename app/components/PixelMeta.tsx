"use client";

// Pixel da Meta (Facebook/Instagram) nas páginas públicas.
//
// POR QUE NO LAYOUT RAIZ, E NÃO PÁGINA POR PÁGINA. O pixel precisa ver a
// jornada inteira — chegou pelo anúncio no mapa, leu dois posts do blog,
// voltou e se cadastrou. Espalhar a tag por página deixaria uma de fora na
// próxima que a gente criar, e um pixel com buraco mede menos do que parece.
//
// O PAINEL FICA FORA, DE PROPÓSITO. Quem administra o site entra no /admin
// várias vezes por dia; essas visitas entrariam no mesmo público de
// remarketing e no mesmo denominador das conversões. O custo de medir errado é
// gastar verba mirando a própria casa.
//
// POR QUE O SCRIPT É INJETADO À MÃO, E NÃO PELO next/script. Era com
// `<Script strategy="afterInteractive">`, que é o caminho recomendado — e que
// nesta versão do Next não inseriu nada: o chunk do componente carregava, o
// <noscript> aparecia, e `window.fbq` continuava indefinido com zero
// requisições à Meta (conferido no navegador). Um pixel que não dispara é pior
// que nenhum, porque ninguém repara. Injetado aqui, o comportamento é o que se
// lê: cria a fila, carrega o fbevents.js, conta a visualização.
//
// A CONTAGEM A CADA ROTA NÃO É DUPLICIDADE. A navegação do site é feita pelo
// roteador, sem recarregar a página; sem este efeito, só a primeira tela de
// cada visita seria contada. O trecho oficial da Meta chama `PageView` ao
// carregar, e por isso ele foi retirado daqui — quem conta é o efeito, uma vez
// por rota.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** O pixel do Clube Forense. Identificador público, igual ao que vai no HTML. */
const PIXEL_ID = "2344530515754208";

/** Rotas que não são do público: medir administração suja a medição. */
const FORA = ["/admin"];

type Fbq = ((...args: unknown[]) => void) & {
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
  push?: unknown;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Cria a fila do fbq e carrega o fbevents.js. Roda uma vez por visita. */
function instalar() {
  if (window.fbq) return;

  const fila: Fbq = Object.assign(
    (...args: unknown[]) => {
      // Depois que o fbevents.js carrega, ele troca `callMethod` pela função de
      // verdade; antes disso, tudo o que a gente chama fica na fila.
      if (fila.callMethod) fila.callMethod(...args);
      else fila.queue?.push(args);
    },
    { queue: [] as unknown[], loaded: true, version: "2.0" },
  );
  fila.push = fila;

  window.fbq = fila;
  window._fbq ??= fila;

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(tag);

  fila("init", PIXEL_ID);
}

/**
 * Dispara um evento padrão da Meta (ViewContent, InitiateCheckout, Contact…).
 *
 * Instala o pixel se ainda não estiver instalado: os componentes da página
 * rodam antes deste, que fica no fim do layout raiz, e o evento não pode se
 * perder por chegar primeiro. A fila do fbq guarda tudo na ordem.
 */
export function rastrear(evento: string, dados?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (FORA.some((p) => window.location.pathname.startsWith(p))) return;
  instalar();
  window.fbq?.("track", evento, dados);
}

/**
 * A última rota já contada.
 *
 * Fora do componente de propósito: um `useRef` zera quando o componente
 * remonta, e foi exatamente isso que apareceu no teste — uma navegação do
 * roteador registrou DUAS visualizações. Aqui a marca sobrevive à remontagem e
 * só se perde no recarregamento da página, que é quando uma visualização nova
 * é mesmo para ser contada.
 */
let ultimaContada: string | null = null;

export default function PixelMeta() {
  const rota = usePathname();
  const medir = !FORA.some((p) => rota?.startsWith(p));

  useEffect(() => {
    if (!medir) return;
    instalar();
    if (ultimaContada === rota) return;
    ultimaContada = rota;
    window.fbq?.("track", "PageView");
  }, [rota, medir]);

  if (!medir) return null;

  // Caminho para quem bloqueia script: uma imagem de 1 pixel, que é o jeito que
  // a própria Meta documenta. Sem isto, parte do tráfego simplesmente não
  // existe nos relatórios.
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
