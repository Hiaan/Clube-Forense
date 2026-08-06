"use client";

// Campo de foto: escolhe, reduz no navegador e sobe.
//
// A redução acontece ANTES do envio. Uma foto de celular tem de 3 a 8 MB e
// 4000px de lado; guardada assim, ela custa espaço na store e demora a abrir no
// site — para um avatar de 96px na tela. Reduzida, chega com algo entre 60 e
// 200 KB, e o servidor nunca precisa lidar com arquivo grande.

import Image from "next/image";
import { useRef, useState } from "react";

import type { Pasta } from "../../lib/blob";

/** Maior lado da imagem guardada. Suficiente para retina num card de 200px. */
const LADO_MAXIMO = 600;
const QUALIDADE = 0.85;

/**
 * Reduz a imagem e devolve um JPEG.
 *
 * PNG com transparência vira JPEG com fundo branco — para foto de pessoa e
 * brasão de estado isso é o certo, e evita PNG de 2 MB que não comprime.
 */
async function reduzir(arquivo: File): Promise<File> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext("2d");
  if (!ctx) return arquivo; // navegador sem canvas: manda o original

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((ok) =>
    tela.toBlob(ok, "image/jpeg", QUALIDADE),
  );
  if (!blob) return arquivo;

  return new File([blob], "foto.jpg", { type: "image/jpeg" });
}

export default function CampoFoto({
  nome,
  pasta,
  valorInicial,
  rotulo = "Foto",
  redondo = false,
}: {
  /** Nome do campo escondido que vai junto no formulário. */
  nome: string;
  pasta: Pasta;
  valorInicial: string | null;
  rotulo?: string;
  redondo?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(valorInicial);
  const [subindo, setSubindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  async function escolher(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setSubindo(true);
    try {
      const reduzida = await reduzir(arquivo).catch(() => arquivo);
      const corpo = new FormData();
      corpo.append("arquivo", reduzida);
      corpo.append("pasta", pasta);

      const resp = await fetch("/api/admin/upload", { method: "POST", body: corpo });
      const dados = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(dados.erro ?? "Falha ao subir a imagem.");
      setUrl(dados.url as string);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao subir a imagem.");
    } finally {
      setSubindo(false);
      // Sem isto, escolher o mesmo arquivo de novo não dispara o evento.
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {rotulo}
      </span>

      {/* O valor que o formulário grava é a URL, não o arquivo. */}
      <input type="hidden" name={nome} value={url ?? ""} />

      <div className="flex items-center gap-3">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-gray-200 bg-gray-50 ${
            redondo ? "rounded-full" : "rounded-xl"
          }`}
        >
          {url ? (
            <Image
              src={url}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-[10px] text-gray-400">sem foto</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              disabled={subindo}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              {subindo ? "Enviando…" : url ? "Trocar" : "Escolher imagem"}
            </button>
            {url && !subindo && (
              <button
                type="button"
                onClick={() => setUrl(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                Remover
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-400">
            JPG, PNG ou WEBP. É reduzida no seu computador antes de subir.
          </span>
        </div>
      </div>

      {erro && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {erro}
        </p>
      )}

      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => escolher(e.target.files?.[0])}
      />
    </div>
  );
}
