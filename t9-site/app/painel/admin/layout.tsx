import { exigirEquipe } from "@/lib/painel/auth";
import Cabecalho from "../_ui/Cabecalho";
import Abas from "../_ui/Abas";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const usuario = await exigirEquipe();
  const abas = [{ href: "/painel/admin", rotulo: "Carteira" }];
  if (usuario.perfil === "admin") {
    abas.push(
      { href: "/painel/admin/financeiro", rotulo: "Financeiro" },
      { href: "/painel/admin/nova", rotulo: "Novo cliente" },
      { href: "/painel/admin/equipe", rotulo: "Equipe T9" },
    );
  }
  return (
    <>
      <Cabecalho usuario={usuario}>
        <Abas abas={abas} />
      </Cabecalho>
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6">{children}</main>
    </>
  );
}
