// A página de vendas do preparatório. O conteúdo mora em PaginaPreparatorio,
// que a página do Acre (/preparatorio-ac) reaproveita.

import PaginaPreparatorio from "./PaginaPreparatorio";

// Dinâmica por dois motivos: a versão do preço depende do dia, e a situação
// dos concursos vem da coleta do monitor.
export const dynamic = "force-dynamic";

export default async function PreparatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  return (
    <PaginaPreparatorio
      previa={typeof q.versao === "string" ? q.versao : undefined}
    />
  );
}
