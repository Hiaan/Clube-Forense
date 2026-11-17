// /preparatorio-xx: o preparatório de um estado, para os que não têm página
// própria. O endereço público é /preparatorio-xx (rewrite em next.config.ts);
// este caminho interno só existe porque um segmento dinâmico não pode ser
// metade de um nome ("preparatorio-[uf]").

import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { listarPublicados } from "../../../lib/postsRepo";
import { coletar } from "../../../monitor/lib/coletor";
import { concursoDoEstado } from "../../concursoDoEstado";
import { caminhoPreparatorio, estadoPreparatorio } from "../../estados";
import PaginaPreparatorio from "../../PaginaPreparatorio";

// A etapa do concurso vem do monitor, e o preço depende do dia.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ uf: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = estadoPreparatorio((await params).uf);
  if (!e) return {};
  const titulo = `Preparatório ${e.sigla ?? e.uf} — ${e.cargo.toLowerCase()} ${e.doOrgao} | Clube Forense`;
  const descricao = `Prepare-se para o concurso de ${e.cargo.toLowerCase()} ${e.doOrgao} com professores que já são médicos legistas: material pré-edital com base nos últimos concursos, eBooks, mapas mentais e banco de questões.`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminhoPreparatorio(e.uf) },
    openGraph: {
      title: `Preparatório ${e.sigla ?? e.uf} · ${e.cargo.toLowerCase()} | Clube Forense`,
      description: descricao,
      type: "website",
      images: ["/preparatorio/opengraph-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PreparatorioEstadoPage({
  params,
  searchParams,
}: Props) {
  const e = estadoPreparatorio((await params).uf);
  if (!e) notFound();
  // Acre e Tocantins têm página escrita à mão: este caminho leva para lá.
  if (e.propria) permanentRedirect(caminhoPreparatorio(e.uf));

  const [relatorio, blog] = await Promise.all([
    coletar(),
    listarPublicados({ uf: e.uf, limite: 3 }).catch(() => ({ posts: [], total: 0 })),
  ]);
  const estado = relatorio.estados.find((x) => x.uf === e.uf) ?? null;
  const q = await searchParams;

  return (
    <PaginaPreparatorio
      concurso={concursoDoEstado(e, estado, blog.posts)}
      previa={typeof q.versao === "string" ? q.versao : undefined}
    />
  );
}
