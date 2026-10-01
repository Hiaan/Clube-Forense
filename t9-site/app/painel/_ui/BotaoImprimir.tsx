"use client";

export default function BotaoImprimir({ rotulo }: { rotulo: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="botao-painel botao-painel-sec nao-imprimir">
      {rotulo}
    </button>
  );
}
