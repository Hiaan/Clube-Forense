import { empresasDoUsuario } from "@/lib/painel/auth";
import Cabecalho from "../_ui/Cabecalho";
import Abas from "../_ui/Abas";
import { contextoEmpresa } from "./contexto";

export default async function LayoutEmpresa({ children, params }: { children: React.ReactNode; params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, t } = await contextoEmpresa(params);
  const empresas = await empresasDoUsuario(usuario);
  const base = `/painel/${empresa.slug}`;
  return (
    <>
      <Cabecalho usuario={usuario} empresas={empresas} atual={empresa}>
        <Abas
          abas={[
            { href: base, rotulo: t.menu.visao },
            { href: `${base}/campanhas`, rotulo: t.menu.campanhas },
            { href: `${base}/leads`, rotulo: t.menu.leads },
            { href: `${base}/plano`, rotulo: t.menu.plano },
          ]}
        />
      </Cabecalho>
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6">{children}</main>
    </>
  );
}
