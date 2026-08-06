// Peças de superfície do painel: o cartão branco e o número em destaque.

import Icone, { type NomeIcone } from "./Icone";

export function Cartao({
  titulo,
  descricao,
  acao,
  children,
  className = "",
}: {
  titulo?: string;
  descricao?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      {(titulo || acao) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-semibold text-gray-900">{titulo}</h2>}
            {descricao && <p className="mt-0.5 text-sm text-gray-500">{descricao}</p>}
          </div>
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Número do topo do painel.
 *
 * `rodape` é a linha pequena embaixo — o contexto que impede o número de ser
 * lido errado ("3" não quer dizer nada sem "de 27").
 */
export function Numero({
  rotulo,
  valor,
  rodape,
  icone,
  destaque = false,
}: {
  rotulo: string;
  valor: number | string;
  rodape?: string;
  icone: NomeIcone;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-500">{rotulo}</p>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            destaque ? "bg-[#fff9db] text-[#8a6500]" : "bg-gray-100 text-gray-500"
          }`}
        >
          <Icone nome={icone} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{valor}</p>
      {rodape && <p className="mt-1 text-xs text-gray-400">{rodape}</p>}
    </div>
  );
}
