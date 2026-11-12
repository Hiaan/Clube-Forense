"use client";

// Pixel da Meta (Facebook/Instagram) do Medicina Forensis.
//
// Fica no layout raiz para ver a jornada inteira: chegou pela página do grupo,
// depois foi para a mentoria e agendou. É um pixel próprio, separado do Clube
// Forense, para que público e conversões dos dois não se misturem.
//
// O script é injetado à mão, como no site do Clube: nesta versão do Next o
// `<Script>` não chegou a inserir o fbevents.js lá. O PageView é contado aqui,
// uma vez por rota, porque a navegação entre páginas não recarrega a tela.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Identificador público do pixel, o mesmo que vai no HTML. */
export const PIXEL_ID = "1811508133728500";

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
 * Dispara um evento padrão da Meta. Usado nos formulários:
 * `Lead` (deixou nome, e-mail e WhatsApp), `Schedule` (confirmou a reunião) e
 * `CompleteRegistration` (entrou no grupo).
 */
export function eventoPixel(nome: string, dados?: Record<string, unknown>) {
  try {
    window.fbq?.("track", nome, dados);
  } catch {
    // Bloqueador de anúncio ou falha da Meta não pode travar o formulário.
  }
}

export default function PixelMeta() {
  const rota = usePathname();

  useEffect(() => {
    instalar();
  }, []);

  useEffect(() => {
    window.fbq?.("track", "PageView");
  }, [rota]);

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
