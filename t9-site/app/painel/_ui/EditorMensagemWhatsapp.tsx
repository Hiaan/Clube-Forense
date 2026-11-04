"use client";

import { useState } from "react";
import type { Estado } from "../admin/acoes";
import FormComEstado from "./FormComEstado";
import { BotaoEnviar } from "./Botoes";
import type { TextosPainel } from "@/lib/painel/textos";

/** Editor da primeira mensagem para o lead: modelos prontos, prévia ao vivo, liga/desliga e teste. */
export default function EditorMensagemWhatsapp({
  empresaId,
  empresa,
  inicial,
  ativo,
  modelos,
  t,
  salvar,
  testar,
}: {
  empresaId: number;
  empresa: string;
  inicial: string;
  ativo: boolean;
  modelos: { id: string; titulo: string; texto: string }[];
  t: TextosPainel["waCliente"];
  salvar: (anterior: Estado, dados: FormData) => Promise<Estado>;
  testar: (anterior: Estado, dados: FormData) => Promise<Estado>;
}) {
  const [mensagem, setMensagem] = useState(inicial);
  const previa = mensagem
    .replace(/\{nome\}/g, t.exemploNome)
    .replace(/\{empresa\}/g, empresa)
    .trim();

  return (
    <>
      <section className="painel-cartao mt-4 p-6">
        <h2 className="font-display text-lg font-extrabold">{t.mensagemTitulo}</h2>
        <p className="mt-1 text-sm text-white/55">{t.mensagemTexto}</p>

        <p className="painel-rotulo mt-5">{t.modelos}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {modelos.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMensagem(m.texto)}
              aria-pressed={mensagem === m.texto}
              className={`rounded-2xl border p-4 text-left text-sm transition-colors ${
                mensagem === m.texto ? "border-[#ff2d38]/60 bg-[#ff2d38]/10" : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="block font-semibold">{m.titulo}</span>
              <span className="mt-1.5 block text-xs leading-relaxed text-white/55">{m.texto}</span>
              <span className="mt-2 block text-xs text-[#ff8a90]">{t.usar} →</span>
            </button>
          ))}
        </div>

        <FormComEstado acao={salvar} className="mt-5">
          <input type="hidden" name="empresa" value={empresaId} />
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="painel-rotulo">{t.suaMensagem}</span>
              <textarea
                name="mensagem"
                rows={6}
                maxLength={1000}
                required
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="painel-campo !min-h-[150px] leading-relaxed"
              />
            </label>
            <div>
              <span className="painel-rotulo">{t.previa}</span>
              <div className="rounded-2xl bg-[#0b141a] p-4">
                <p className="ml-auto w-fit max-w-[90%] rounded-xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-white">
                  {previa || "…"}
                </p>
              </div>
            </div>
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm">
            <input type="checkbox" name="ativo" defaultChecked={ativo} className="mt-0.5 size-4 accent-[#ff2d38]" />
            <span>
              <span className="font-medium text-white">{t.ativar}</span>
              <span className="mt-0.5 block text-xs text-white/50">{t.ativarDica}</span>
            </span>
          </label>
          <BotaoEnviar enviando="..." className="botao-painel mt-5">
            {t.salvar}
          </BotaoEnviar>
        </FormComEstado>
      </section>

      <section className="painel-cartao mt-4 p-6">
        <h2 className="font-display text-lg font-extrabold">{t.testeTitulo}</h2>
        <p className="mt-1 text-sm text-white/55">{t.testeTexto}</p>
        <FormComEstado acao={testar} className="mt-4">
          <input type="hidden" name="empresa" value={empresaId} />
          <input type="hidden" name="mensagem" value={mensagem} />
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] flex-1">
              <span className="painel-rotulo">{t.testeNumero}</span>
              <input name="numero" type="tel" inputMode="tel" required className="painel-campo" placeholder="(83) 99999-9999" />
            </label>
            <BotaoEnviar enviando="..." className="botao-painel botao-painel-sec">
              {t.testar}
            </BotaoEnviar>
          </div>
        </FormComEstado>
      </section>
    </>
  );
}
