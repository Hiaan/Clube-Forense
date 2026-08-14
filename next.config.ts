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
};

export default nextConfig;
