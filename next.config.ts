import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As fotos dos aprovados e as imagens dos estados ficam no Blob da Vercel.
    // Sem liberar o domínio aqui, o <Image> responde 400 e a foto aparece
    // quebrada — foi exatamente o que aconteceu na primeira foto que subiu.
    //
    // `**` casa qualquer número de subdomínios no começo, e é o que cobre as
    // duas formas de endereço que o Blob usa (com e sem o ".public.").
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel-storage.com" },
      // Fotos da Queren na página do MEAP, servidas pelo Wix da página de
      // captura enquanto não forem trazidas para /public.
      { protocol: "https", hostname: "static.wixstatic.com" },
    ],
  },

  /**
   * No domínio da Queren a raiz serve a página do MEAP.
   *
   * Este repositório atende dois sites: `/` é o Monitor de Concursos do Clube
   * Forense e `/meap` é a página de vendas. Como os dois saem do mesmo código,
   * a regra precisa olhar o host — sem isso, apontar o domínio para cá faria a
   * visitante cair no monitor de concursos.
   *
   * É `rewrite` e não `redirect` de propósito: a URL continua sendo a raiz do
   * domínio, sem `/meap` aparecendo na barra. O caminho `/meap` segue
   * respondendo normalmente, então os links já existentes não quebram.
   *
   * Precisa ser `beforeFiles`. A forma curta de `rewrites` cai em `afterFiles`,
   * que só roda quando nenhuma rota casou — e `/` casa, porque a página do
   * monitor existe. `beforeFiles` roda antes do sistema de arquivos e é o único
   * lugar de onde dá para sobrepor uma página que já existe.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "(www\\.)?engquerencosta\\.com\\.br",
            },
          ],
          destination: "/meap",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
