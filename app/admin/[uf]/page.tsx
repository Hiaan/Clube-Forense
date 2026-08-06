// Edição de um estado.

import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import FormEstado, { type MencaoSugerida } from "./FormEstado";
import NavAdmin from "../NavAdmin";
import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../lib/admin";
import { lerEstado } from "../../lib/estadosRepo";
import { coletar } from "../../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../../monitor/lib/estados";
import { NIVEL_LABEL } from "../../monitor/lib/tipos";

export const dynamic = "force-dynamic";

/** Quantas manchetes do robô mostrar como sugestão. Mais que isso vira ruído. */
const MAX_SUGESTOES = 8;

export default async function EditarEstado({
  params,
}: {
  params: Promise<{ uf: string }>;
}) {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) redirect("/admin/login");

  const uf = (await params).uf.toUpperCase();
  const estado = ESTADO_POR_UF[uf];
  if (!estado) notFound();

  // A coleta é a mesma do site (cache de 1h nos feeds), então abrir esta tela
  // não dispara uma busca nova a cada clique. Se ela falhar, a edição continua
  // possível — só ficamos sem as sugestões.
  const [gravado, relatorio] = await Promise.all([
    lerEstado(uf),
    coletar().catch(() => null),
  ]);

  const doEstado = relatorio?.estados.find((e) => e.uf === uf) ?? null;

  const sugestoes: MencaoSugerida[] = (doEstado?.mencoes ?? [])
    // A própria curadoria entra na coleta como uma menção; oferecê-la de volta
    // como sugestão seria devolver ao painel o que saiu dele.
    .filter((m) => !m.daCuradoria)
    .slice(0, MAX_SUGESTOES)
    .map((m) => ({
      titulo: m.titulo,
      resumo: m.resumo,
      fonte: m.fonte,
      link: m.link,
      data: m.data,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <NavAdmin atual="estados" />

      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← Estados
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">
          <span className="font-mono text-gray-400">{uf}</span> {estado.nome}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {doEstado
            ? `O robô classificou como “${NIVEL_LABEL[doEstado.nivel]}” a partir de ${doEstado.mencoes.length} menção(ões).`
            : "Sem coleta disponível agora — a edição funciona do mesmo jeito."}
        </p>
      </div>

      {gravado === null && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Este estado ainda não tem linha no banco. Salvar cria a linha.
        </div>
      )}

      <FormEstado uf={uf} nome={estado.nome} inicial={gravado} sugestoes={sugestoes} />
    </div>
  );
}
