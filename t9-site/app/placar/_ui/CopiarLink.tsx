"use client";

import { useState } from "react";
import { botaoSec, campo } from "./estilo";

export default function CopiarLink({ link, rotulo = "Copiar link" }: { link: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <input readOnly value={link} aria-label="Link do painel do cliente" className={`${campo} min-w-0 flex-1 text-sm`} onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        className={botaoSec}
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }}
      >
        {copiado ? "Copiado ✓" : rotulo}
      </button>
    </div>
  );
}
