// Os avisos da Black dos alunos: exclusividade, reembolso e o que não entra.
// Aparecem na entrada (antes do CPF) e de novo junto da oferta.

import { NAO_INCLUI } from "./cupons";

function lista(itens: string[]): string {
  return itens.length < 2
    ? itens.join("")
    : `${itens.slice(0, -1).join(", ")} nem ${itens.at(-1)}`;
}

export default function AvisoAluno({ claro = false }: { claro?: boolean }) {
  const caixa = claro
    ? "border-gray-200 bg-white text-gray-600"
    : "border-white/10 bg-white/[0.03] text-white/60";
  const forte = claro ? "text-gray-900" : "text-white";
  return (
    <div
      className={`space-y-3 rounded-2xl border p-5 text-left text-sm leading-relaxed ${caixa}`}
    >
      <p>
        <strong className={`font-black ${forte}`}>
          ⚠ Página exclusiva para alunos do Clube Forense.
        </strong>{" "}
        Se você ainda não é aluno do Clube, ou recebeu este link de outra
        pessoa, a sua compra será reembolsada e você não poderá seguir com esta
        promoção.
      </p>
      <p>
        <strong className={`font-black ${forte}`}>O que entra:</strong> os
        preparatórios de todos os editais autorizados ou anunciados até 2028,
        com as atualizações pós-edital e o acesso à plataforma no período
        descrito na oferta.
      </p>
      <p>
        <strong className={`font-black ${forte}`}>O que não entra:</strong> esta
        oferta não inclui {lista(NAO_INCLUI)}.
      </p>
    </div>
  );
}
