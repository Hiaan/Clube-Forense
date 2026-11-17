import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /preparatorio-rj, /preparatorio-mg…: a página de cada estado mora em
  // /preparatorio/estado/[uf]. Rewrite em lista vale depois das pastas, então
  // /preparatorio-ac e /preparatorio-to (escritas à mão) continuam com as delas.
  async rewrites() {
    return [
      {
        source: "/preparatorio-:uf([a-z]{2})",
        destination: "/preparatorio/estado/:uf",
      },
    ];
  },
  images: {
    // As fotos dos aprovados e as imagens dos estados ficam no Blob da Vercel.
    // Sem liberar o domínio aqui, o <Image> responde 400 e a foto aparece
    // quebrada — foi exatamente o que aconteceu na primeira foto que subiu.
    //
    // `**` casa qualquer número de subdomínios no começo, e é o que cobre as
    // duas formas de endereço que o Blob usa (com e sem o ".public.").
    remotePatterns: [{ protocol: "https", hostname: "**.vercel-storage.com" }],
  },
};

export default nextConfig;
