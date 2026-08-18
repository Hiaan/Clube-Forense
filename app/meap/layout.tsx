import Script from "next/script";
import { Inter, Sora } from "next/font/google";

import { META_PIXEL_ID } from "./conteudo";
import "./meap.css";

// As duas fontes da landing page de captura. Vêm por next/font, que baixa e
// serve os arquivos do próprio domínio — sem requisição ao Google no navegador
// do visitante e sem o salto de layout que a fonte externa causaria.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export default function MeapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O escopo `.meap` isola esta identidade do resto do site, que roda no
  // amarelo do Clube Forense.
  return (
    <div className={`meap ${sora.variable} ${inter.variable}`}>
      {/*
        Pixel da Meta Ads, só nesta rota — é aqui que o tráfego pago chega, e
        o resto do site (Clube Forense) não deve carregar esse script.
        `afterInteractive` deixa a página interativa primeiro e injeta o
        script logo em seguida; é a estratégia que o próprio Next recomenda
        para pixels de analytics, que não bloqueiam nada visualmente.
      */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* Só entra se o JavaScript não carregar — o script acima já contabiliza
          o PageView para a imensa maioria dos visitantes. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element --
            Pixel de rastreamento de 1x1: next/image otimizaria uma imagem que
            não é para ser vista, e ainda exigiria liberar o domínio da Meta
            em remotePatterns por causa de um `<img>` invisível. */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>

      {children}
    </div>
  );
}
