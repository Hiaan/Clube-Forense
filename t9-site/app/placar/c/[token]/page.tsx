import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { uma, type Agencia, type Cliente } from "@/lib/placar/banco";
import { acessoDe } from "@/lib/placar/conta";
import Painel, { PERIODOS, type ChavePeriodo } from "../../_ui/Painel";

export const metadata: Metadata = { title: "Resultados", robots: { index: false, follow: false } };

// Painel do cliente final: abre pelo link secreto, sem login, com a marca da agência.
export default async function PainelPublico({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ p?: string }> }) {
  const { token } = await params;
  const c = await uma<Cliente>("select * from placar.clientes where token = $1", [token]);
  if (!c) notFound();
  const a = (await uma<Agencia>("select * from placar.agencias where id = $1", [c.agencia_id]))!;
  const { p } = await searchParams;
  const periodo = (p && p in PERIODOS ? p : "7") as ChavePeriodo;
  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-5 py-4">
          {a.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo da agência
            <img src={`/placar/marca/${a.id}`} alt={a.nome} className="h-10 w-auto max-w-[140px] rounded object-contain" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] text-sm font-bold text-white" style={{ background: a.cor }} aria-hidden="true">
              {a.nome.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-base font-bold">{c.nome}</h1>
            <p className="text-[13px] text-gray-500">Resultados dos seus anúncios, por {a.nome}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6 pb-16">
        {acessoDe(a).liberado ? (
          <Painel cliente={c} periodo={periodo} base={`/placar/c/${token}`} />
        ) : (
          <p className="rounded-[14px] border border-gray-200 bg-white p-6 text-gray-600">Este painel está indisponível no momento. Fale com {a.nome}.</p>
        )}
        {c.sincronizado_em && (
          <p className="mt-4 text-[13px] text-gray-500">
            Atualizado em {new Date(c.sincronizado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}.
          </p>
        )}
      </main>
    </>
  );
}
