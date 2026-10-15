// Aviso de post velho, no topo da leitura.
//
// POR QUE CALCULADO, E NÃO ESCRITO NO TEXTO. A tentação era pôr a frase dentro
// do corpo dos posts migrados, que é onde ela precisa aparecer hoje. Mas aí a
// frase nasce certa e envelhece errada: daqui a um ano o aviso de "post de
// agosto de 2025" continuaria igual nos antigos e faltaria nos que
// envelheceram no meio-tempo. Calculado pela data de publicação, vale para o
// acervo inteiro e para o que ainda vai ser escrito, sem ninguém lembrar de
// nada.
//
// SEIS MESES É O CORTE. Notícia de concurso azeda rápido — entre a autorização
// e o edital o estágio muda várias vezes —, mas avisar cedo demais colocaria
// tarja em post que ainda é a melhor informação disponível. Seis meses é o
// ponto em que a chance de o estágio ter mudado passa a ser maior que a de não
// ter.

import Link from "next/link";

import { estadoComArtigo } from "./lib/taxonomia";

const MESES_ATE_ENVELHECER = 6;

/** Quantos meses se passaram. `null` quando a data não presta. */
function mesesDesde(iso: string | null): number | null {
  if (!iso) return null;
  const quando = new Date(iso);
  if (Number.isNaN(quando.getTime())) return null;
  return (Date.now() - quando.getTime()) / (30.44 * 86_400_000);
}

/** "agosto de 2025" — mês por extenso, que é como se fala de post antigo. */
function mesPorExtenso(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function AvisoPostAntigo({
  publicadoEm,
  uf,
}: {
  publicadoEm: string | null;
  uf: string | null;
}) {
  const meses = mesesDesde(publicadoEm);
  if (meses === null || meses < MESES_ATE_ENVELHECER) return null;

  const estado = estadoComArtigo(uf);

  return (
    <aside
      role="note"
      className="mt-6 rounded-xl border border-[#ffcd07] bg-[#fff9db] px-5 py-4 text-sm leading-relaxed text-gray-800"
    >
      <strong className="font-bold">
        Este post é de {mesPorExtenso(publicadoEm as string)}.
      </strong>{" "}
      Concurso muda rápido, e o que está escrito aqui valia naquela data.{" "}
      {/* O link vai para o estado do post quando há um; sem estado, para o mapa
          inteiro — melhor a visão geral que nenhum caminho adiante. */}
      <Link
        href={uf ? `/?uf=${uf}` : "/"}
        className="font-bold text-gray-900 underline decoration-2 underline-offset-2 hover:bg-[#ffcd07]"
      >
        {estado
          ? `Veja em que etapa ${estado} está hoje no mapa`
          : "Veja o mapa dos concursos"}
      </Link>
      .
    </aside>
  );
}
