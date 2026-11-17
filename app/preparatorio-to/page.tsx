// A página de vendas do preparatório para a PC-TO: o mesmo curso do
// /preparatorio, focado no concurso da Polícia Civil do Tocantins (ver
// PaginaPreparatorio e concurso.tsx).

import PaginaPreparatorio from "../preparatorio/PaginaPreparatorio";
import { CONCURSO_TO } from "./pagina";

// A versão do preço depende do dia.
export const dynamic = "force-dynamic";

export default async function PreparatorioTocantinsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  return (
    <PaginaPreparatorio
      concurso={CONCURSO_TO}
      previa={typeof q.versao === "string" ? q.versao : undefined}
    />
  );
}
