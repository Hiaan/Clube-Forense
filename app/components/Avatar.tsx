"use client";

// Avatar de aluno aprovado: a foto em /public/aprovados/<slug>.<ext> quando ela
// existe, senão um círculo com as iniciais e uma cor determinística pelo nome.
//
// Para adicionar a foto de alguém:
//   1. coloque o arquivo em public/aprovados/<slug>.jpg (ou .jpeg/.png/.webp)
//      Ex.: "Dr. Lucas Mesquita" -> public/aprovados/lucas-mesquita.jpg
//   2. rode `npm run fotos` para reindexar
//
// O índice (fotosAprovados.ts, gerado) diz quais slugs têm arquivo e em qual
// formato. É ele que evita o que acontecia antes: sem saber o que existe, o
// componente pedia .jpg, .jpeg, .png e .webp em sequência e só then desistia —
// até 4 requisições 404 por pessoa sem foto. Agora quem não tem foto não gera
// requisição alguma, e quem tem é pedido no formato certo de primeira.

import { useState } from "react";

import { FOTOS_APROVADOS } from "./fotosAprovados";

/** Gera o slug do nome (sem título Dr./Dra., sem acento, com hífens). */
export function slugDoNome(nome: string): string {
  return nome
    .replace(/^dr[a]?\.?\s*/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function iniciais(nome: string): string {
  const limpo = nome.replace(/^dr[a]?\.?\s*/i, "").trim();
  const partes = limpo.split(/\s+/).filter(Boolean);
  const ini = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return ini.toUpperCase();
}

const CORES = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#8b5cf6",
  "#db2777",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
];

function corDoNome(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
  return CORES[h % CORES.length];
}

export default function Avatar({
  nome,
  size = 28,
}: {
  nome: string;
  size?: number;
}) {
  const slug = slugDoNome(nome);
  const extensao = FOTOS_APROVADOS[slug];
  // `falhou` é rede de segurança: o índice diz que o arquivo existe, mas se ele
  // vier corrompido ou for removido sem reindexar, ainda caímos nas iniciais.
  const [falhou, setFalhou] = useState(false);

  if (!extensao || falhou) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
        style={{
          width: size,
          height: size,
          backgroundColor: corDoNome(nome),
          fontSize: size * 0.4,
        }}
        aria-hidden
      >
        {iniciais(nome)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/aprovados/${slug}.${extensao}`}
      alt={nome}
      width={size}
      height={size}
      onError={() => setFalhou(true)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
