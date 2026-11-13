import { NextResponse, type NextRequest } from "next/server";

// painel.t9company.com.br abre o painel do cliente (as rotas de /painel) sem o
// prefixo no endereço. No domínio principal, /painel continua funcionando.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  // placar.<domínio> abre o Placar (produto à parte) sem o /placar no endereço.
  if (host.startsWith("placar.")) {
    const { pathname } = request.nextUrl;
    if (pathname === "/placar" || pathname.startsWith("/placar/")) return NextResponse.next();
    const destino = request.nextUrl.clone();
    destino.pathname = pathname === "/" ? "/placar" : `/placar${pathname}`;
    return NextResponse.rewrite(destino);
  }
  if (!host.startsWith("painel.")) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/painel" || pathname.startsWith("/painel/")) return NextResponse.next();

  const destino = request.nextUrl.clone();
  destino.pathname = pathname === "/" ? "/painel" : `/painel${pathname}`;
  return NextResponse.rewrite(destino);
}

export const config = {
  // Fora: arquivos internos do Next, APIs e arquivos estáticos (imagens, ícones etc.).
  matcher: ["/((?!_next/|api/|.*\\.[a-z0-9]+$).*)"],
};
