// A página de vendas do preparatório para a PC-AC: o mesmo curso do
// /preparatorio, focado no edital da Polícia Civil do Acre (ver
// PaginaPreparatorio, modo `acre`).

import PaginaPreparatorio from "../preparatorio/PaginaPreparatorio";

// A versão do preço depende do dia.
export const dynamic = "force-dynamic";

export default async function PreparatorioAcrePage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  return (
    <PaginaPreparatorio
      acre
      previa={typeof q.versao === "string" ? q.versao : undefined}
    />
  );
}
