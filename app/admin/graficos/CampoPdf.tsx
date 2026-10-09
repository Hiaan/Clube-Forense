"use client";

// Campo de PDF: escolhe um arquivo e sobe.
//
// Irmão do CampoFoto, com uma diferença que explica por que não é o mesmo
// componente: foto a gente reduz antes de enviar, PDF não. Qualquer mexida no
// arquivo — recomprimir, reescrever páginas — arriscaria entregar ao aluno um
// edital diferente do que a banca publicou, e é justamente isso que não pode
// acontecer com um documento oficial. O arquivo sobe byte a byte como veio, e
// o preço disso é o limite de 4 MB da rota.

import { useRef, useState } from "react";

import { TAMANHO_MAXIMO_PDF, type Pasta } from "../../lib/blob";

/** Só para a mensagem: "2,3 MB" é mais legível que o número de bytes. */
function megas(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Nome do arquivo dentro da URL do Blob.
 *
 * Serve para a tela confirmar o que está guardado hoje sem precisar abrir o
 * PDF. Em URL estranha devolve null, e aí a tela cai para um rótulo genérico —
 * nunca quebra por causa de um nome.
 */
function nomeNaUrl(url: string): string | null {
  try {
    const partes = new URL(url).pathname.split("/");
    return decodeURIComponent(partes.at(-1) ?? "") || null;
  } catch {
    return null;
  }
}

export default function CampoPdf({
  nome,
  pasta,
  uf,
  valorInicial,
  rotulo = "PDF",
}: {
  /** Nome do campo escondido que vai junto no formulário. */
  nome: string;
  pasta: Pasta;
  /** Entra no nome do arquivo na store, para o conteúdo dela ser legível. */
  uf?: string;
  valorInicial: string | null;
  rotulo?: string;
}) {
  const [url, setUrl] = useState<string | null>(valorInicial);
  const [subindo, setSubindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  async function escolher(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);

    // Barra aqui antes de gastar o upload. O servidor confere de novo — esta
    // checagem é conveniência, não segurança —, mas avisar na hora da escolha
    // evita a espera de um envio que já se sabe que vai falhar.
    if (arquivo.type !== "application/pdf") {
      setErro("O edital precisa ser um PDF.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_PDF) {
      setErro(
        `PDF de ${megas(arquivo.size)} — o limite é 4 MB. Comprima o arquivo ` +
          "ou deixe só o link do edital.",
      );
      return;
    }

    setSubindo(true);
    try {
      const corpo = new FormData();
      corpo.append("arquivo", arquivo);
      corpo.append("pasta", pasta);
      if (uf) corpo.append("uf", uf);

      const resp = await fetch("/api/admin/upload", { method: "POST", body: corpo });
      const dados = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(dados.erro ?? "Falha ao subir o PDF.");
      setUrl(dados.url as string);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao subir o PDF.");
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

      <div className="flex items-start gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-gray-200 bg-gray-50">
          <span className={`text-[11px] font-bold ${url ? "text-gray-700" : "text-gray-400"}`}>
            {url ? "PDF" : "vazio"}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              disabled={subindo}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              {subindo ? "Enviando…" : url ? "Trocar PDF" : "Escolher PDF"}
            </button>
            {url && !subindo && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  Conferir ↗
                </a>
                <button
                  type="button"
                  onClick={() => setUrl(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  Remover
                </button>
              </>
            )}
          </div>

          {/* Confirma o que está guardado agora. Sem isto, "Trocar PDF" não diz
              se existe um arquivo lá nem qual é. */}
          <span className="truncate text-[11px] text-gray-400">
            {url
              ? (nomeNaUrl(url) ?? "arquivo guardado")
              : "Até 4 MB. Acima disso, use só o campo de link acima."}
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
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => escolher(e.target.files?.[0])}
      />
    </div>
  );
}
