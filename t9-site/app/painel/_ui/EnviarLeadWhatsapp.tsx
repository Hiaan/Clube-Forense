"use client";

import { useActionState } from "react";
import type { Estado } from "../admin/acoes";

/** Botão compacto da aba Leads: manda o lead para o WhatsApp do cliente e mostra o resultado ali mesmo. */
export default function EnviarLeadWhatsapp({
  acao,
  lead,
  enviadoEm,
}: {
  acao: (anterior: Estado, dados: FormData) => Promise<Estado>;
  lead: number;
  enviadoEm: string | null;
}) {
  const [estado, enviar, enviando] = useActionState(acao, {});
  return (
    <form
      action={enviar}
      onSubmit={(e) => {
        if (enviadoEm && !window.confirm("Este lead já foi enviado para o WhatsApp do cliente. Enviar de novo?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="lead" value={lead} />
      {enviadoEm && <span className="block text-xs text-emerald-300/80">✓ {enviadoEm}</span>}
      <button type="submit" disabled={enviando} className="mt-0.5 text-xs whitespace-nowrap text-white/55 underline-offset-2 hover:text-white hover:underline disabled:opacity-50">
        {enviando ? "Enviando..." : enviadoEm ? "Reenviar" : "Enviar manualmente"}
      </button>
      {estado.mensagem && (
        <span role={estado.ok ? "status" : "alert"} className={`mt-1 block max-w-[220px] text-xs ${estado.ok ? "text-emerald-300" : "text-[#ffb3b7]"}`}>
          {estado.mensagem}
        </span>
      )}
    </form>
  );
}
