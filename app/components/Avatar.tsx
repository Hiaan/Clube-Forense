"use client";

// Avatar de aluno aprovado. Tenta carregar a foto em /public/aprovados/<slug>.jpg
// (slug = nome sem título, sem acento, com hífens). Se o arquivo não existir,
// cai para um círculo com as iniciais e uma cor determinística pelo nome.
//
// Para adicionar a foto de alguém, basta colocar o arquivo:
//   public/aprovados/<slug>.jpg   (ou .png/.webp — ver ordem de tentativa)
// Ex.: "Dr. Lucas Mesquita" -> public/aprovados/lucas-mesquita.jpg

import { useState } from "react";

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

// Formatos tentados, em ordem.
const EXTENSOES = ["jpg", "jpeg", "png", "webp"];

export default function Avatar({
  nome,
  size = 28,
}: {
  nome: string;
  size?: number;
}) {
  const slug = slugDoNome(nome);
  const [tentativa, setTentativa] = useState(0);
  const semFoto = tentativa >= EXTENSOES.length;

  if (semFoto) {
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
      src={`/aprovados/${slug}.${EXTENSOES[tentativa]}`}
      alt={nome}
      width={size}
      height={size}
      onError={() => setTentativa((t) => t + 1)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
