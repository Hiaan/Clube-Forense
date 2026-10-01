"use client";

import { useState } from "react";

/** Miniatura do criativo. Se a imagem não carregar (ex.: Drive não compartilhado), mostra o formato. */
export default function Miniatura({ src, alt, apagada, reserva }: { src: string | null; alt: string; apagada: boolean; reserva: string }) {
  const [falhou, setFalhou] = useState(false);
  if (!src || falhou) return <div className="grid h-full place-items-center text-sm text-white/35">{reserva}</div>;
  return (
    // Vem do Blob privado (rota com checagem de acesso) ou do Drive: <img> simples, sem otimização.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFalhou(true)}
      className={`h-full w-full object-cover ${apagada ? "opacity-60 grayscale-[40%]" : ""}`}
    />
  );
}
