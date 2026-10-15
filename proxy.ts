// Roteamento por domínio.
//
// A mesma aplicação responde em dois endereços: mapa.clubeforense.com.br, que
// serve o mapa na raiz, e blog.clubeforense.com.br, que precisa servir o blog
// na raiz. Sem isto, quem digitasse o domínio do blog cairia no mapa.
//
// A REESCRITA É SÓ DA RAIZ, de propósito. A tentação é reescrever tudo
// (`/post-x` → `/blog/post-x`), e isso cria uma armadilha silenciosa: os links
// internos do blog são escritos como `/blog/...`, então no domínio do blog eles
// virariam `/blog/blog/...`. Reescrevendo apenas `/`, o endereço curto leva à
// home e todo o resto continua com um caminho só, igual nos dois domínios — que
// é também o que a URL canônica de cada post declara.
//
// Nota de convenção: em versões anteriores este arquivo se chamava
// `middleware.ts`. O nome mudou para `proxy.ts`, e o antigo está obsoleto.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Qual host é o do blog.
 *
 * Por variável de ambiente, com um padrão: o domínio ainda vai ser apontado, e
 * um código que só funciona depois de alguém lembrar de criar a variável é um
 * código que vai ficar quebrado por uma semana sem ninguém entender por quê.
 */
const HOST_BLOG = process.env.HOST_BLOG ?? "blog.clubeforense.com.br";

export function proxy(request: NextRequest) {
  // `host` já vem sem protocolo; a porta aparece em desenvolvimento e não deve
  // atrapalhar a comparação.
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host === HOST_BLOG && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/blog", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Sem matcher, isto rodaria também em `_next/static` e nas imagens, pagando
  // uma execução por arquivo servido para não fazer nada em 99% delas.
  matcher: ["/"],
};
