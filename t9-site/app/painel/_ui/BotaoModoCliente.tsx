"use client";

import { usePathname } from "next/navigation";
import { alternarModoCliente } from "../acoes-conteudo";

/** Liga/desliga o "ver como cliente" e volta para a mesma tela. */
export default function BotaoModoCliente({ rotulo, className = "", formClassName = "" }: { rotulo: string; className?: string; formClassName?: string }) {
  const caminho = usePathname();
  return (
    <form action={alternarModoCliente} className={formClassName}>
      <input type="hidden" name="voltar" value={caminho} />
      <button className={className}>{rotulo}</button>
    </form>
  );
}
