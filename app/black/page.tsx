// A página de vendas da Black Forense. O conteúdo mora em PaginaBlack, que a
// página dos alunos (/alunoclube) reaproveita no modo "aluno".

import PaginaBlack from "./PaginaBlack";

// A lista de editais vem da coleta, que tem cache próprio de uma hora. A página
// é dinâmica para que um concurso autorizado hoje apareça hoje.
export const dynamic = "force-dynamic";

export default function BlackPage() {
  return <PaginaBlack />;
}
