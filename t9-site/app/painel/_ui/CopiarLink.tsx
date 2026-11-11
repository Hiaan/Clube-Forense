"use client";

import { useState } from "react";

/** Link público (proposta, contrato) com botão de copiar. */
export default function CopiarLink({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input readOnly value={link} className="painel-campo !min-h-[38px] min-w-0 flex-1 !text-xs" onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        className="botao-painel botao-painel-sec !min-h-[38px]"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }}
      >
        {copiado ? "Copiado ✓" : "Copiar link"}
      </button>
    </div>
  );
}
