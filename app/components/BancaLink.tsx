"use client";

// Renderiza o nome da banca como link para o site oficial, quando reconhecida.
// Se não houver correspondência (ex.: banca extinta) ou nome vazio, mostra o
// texto puro (ou "—"), sem quebrar.

import { resolverBanca } from "../monitor/lib/bancas";

export default function BancaLink({
  nome,
  className,
}: {
  nome: string | null;
  className?: string;
}) {
  if (!nome) return <>—</>;
  const banca = resolverBanca(nome);
  if (!banca) return <>{nome}</>;
  return (
    <a
      href={banca.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={`Site oficial — ${banca.nome}`}
    >
      {nome} ↗
    </a>
  );
}
