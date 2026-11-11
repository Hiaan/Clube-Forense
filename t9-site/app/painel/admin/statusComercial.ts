// Rótulos e cores das situações de propostas e contratos (listas, detalhes e páginas públicas).

export const ROTULO_PROPOSTA = { rascunho: "Rascunho", enviada: "Enviada", aceita: "Aceita", recusada: "Recusada" } as const;
export const ROTULO_CONTRATO = { rascunho: "Rascunho", enviado: "Enviado", assinado: "Assinado", cancelado: "Cancelado" } as const;

export const COR_STATUS: Record<string, string> = {
  rascunho: "border-white/15 text-white/60",
  enviada: "border-sky-400/30 text-sky-200",
  enviado: "border-sky-400/30 text-sky-200",
  aceita: "border-emerald-400/30 text-emerald-200",
  assinado: "border-emerald-400/30 text-emerald-200",
  recusada: "border-[#ff2d38]/30 text-[#ffb3b7]",
  cancelado: "border-[#ff2d38]/30 text-[#ffb3b7]",
  vencida: "border-amber-400/30 text-amber-200",
};
