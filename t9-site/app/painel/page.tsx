import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { bancoConfigurado } from "@/lib/painel/db";
import { ehEquipe, empresasDoUsuario, usuarioAtual } from "@/lib/painel/auth";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import Cabecalho from "./_ui/Cabecalho";

/** Porta de entrada: manda cada perfil para o lugar certo. */
export default async function InicioPainel() {
  await connection(); // sempre por requisição (depende da sessão e do banco)
  if (!bancoConfigurado()) {
    return <p className="p-10 text-center text-white/70">{TEXTOS_PAINEL.pt.geral.bancoAusente}</p>;
  }
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  if (ehEquipe(usuario)) redirect("/painel/admin");

  const empresas = await empresasDoUsuario(usuario);
  if (empresas.length === 1) redirect(`/painel/${empresas[0].slug}`);

  const t = TEXTOS_PAINEL[usuario.idioma].geral;
  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto max-w-xl px-4 py-16">
        {empresas.length === 0 ? (
          <p className="painel-cartao p-6 text-white/75">{t.semEmpresas}</p>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold">{t.escolherEmpresa}</h1>
            <ul className="mt-6 grid gap-3">
              {empresas.map((e) => (
                <li key={e.id}>
                  <Link href={`/painel/${e.slug}`} className="painel-cartao block px-5 py-4 font-medium hover:border-white/25">
                    {e.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
