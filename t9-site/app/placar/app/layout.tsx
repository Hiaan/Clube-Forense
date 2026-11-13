import Link from "next/link";
import { exigirConta } from "@/lib/placar/conta";
import { sair } from "../acoes";
import Marca from "../_ui/Marca";
import Abas from "./Abas";

export const metadata = { robots: { index: false, follow: false } };

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const { usuario, agencia, acesso } = await exigirConta();
  const aviso =
    acesso.motivo === "teste"
      ? `Teste grátis: ${acesso.diasRestantes === 1 ? "falta 1 dia" : `faltam ${acesso.diasRestantes} dias`}.`
      : acesso.motivo === "tolerancia"
        ? "O pagamento da mensalidade está pendente."
        : !acesso.liberado
          ? acesso.motivo === "teste-acabou"
            ? "Seu teste grátis acabou."
            : "Sua assinatura venceu."
          : null;
  return (
    <>
      {aviso && (
        <div className={`px-4 py-2.5 text-center text-sm ${acesso.liberado ? "bg-[#EEF2FF] text-[#1E40C4]" : "bg-amber-50 text-amber-900"}`}>
          {aviso}{" "}
          <Link href="/placar/app/plano" className="font-semibold underline underline-offset-2">
            {acesso.liberado ? "Escolher um plano" : "Assinar para continuar"}
          </Link>
        </div>
      )}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <Link href="/placar/app" aria-label="Placar, início">
            <Marca />
          </Link>
          <Abas />
          <details className="relative ml-auto">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white" aria-label="Sua conta">
              {(usuario.nome ?? usuario.email).charAt(0).toUpperCase()}
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <p className="truncate px-3 py-2 text-sm text-gray-600">{agencia.nome}</p>
              <form action={sair}>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50">Sair</button>
              </form>
            </div>
          </details>
        </div>
      </header>
      {children}
    </>
  );
}
