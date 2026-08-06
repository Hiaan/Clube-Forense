// Moldura das telas do painel: barra lateral + área de conteúdo.
//
// A tela de login fica fora deste grupo de rotas de propósito — é a única de
// /admin que abre sem sessão, e não deve mostrar a navegação.
//
// A checagem de sessão está aqui, e não em cada página: um layout envolve todas
// as rotas abaixo dele, então uma tela nova nasce protegida. Quem grava confere
// de novo, na própria ação — um formulário pode ser enviado sem passar por
// página nenhuma.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import NavLateral from "../NavLateral";
import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../lib/admin";

export const dynamic = "force-dynamic";

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb] lg:flex-row">
      <NavLateral email={process.env.ADMIN_EMAIL ?? null} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
