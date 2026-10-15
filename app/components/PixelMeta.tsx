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
// A SEGUNDA CHAMADA DE PageView NÃO É DUPLICIDADE. O código-base da Meta conta
// uma visualização quando carrega, e só então; daí para frente a navegação
// aqui é feita pelo roteador, sem recarregar a página, e nenhuma outra seria
// contada. O efeito abaixo marca cada troca de rota — pulando a primeira, que
// o código-base já contou.

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** O pixel do Clube Forense. Identificador público, igual ao que vai no HTML. */
const PIXEL_ID = "2344530515754208";

/** Rotas que não são do público: medir administração suja a medição. */
const FORA = ["/admin"];

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown };
  }
}

export default function PixelMeta() {
  const rota = usePathname();
  const primeira = useRef(true);
  const medir = !FORA.some((p) => rota?.startsWith(p));

  useEffect(() => {
    if (!medir) return;
    // A primeira rota já foi contada pelo código-base, que roda no carregamento.
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [rota, medir]);

  if (!medir) return null;

  return (
    <>
      <Script id="pixel-meta" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>

      {/* Caminho para quem bloqueia script: uma imagem de 1 pixel, que é o
          jeito que a própria Meta documenta. Sem isto, parte do tráfego
          simplesmente não existe nos relatórios. */}
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
    </>
  );
}
