"use client";

// "Não é você?": apaga o passe do aluno e volta para a entrada do CPF.

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { sairAluno } from "./acoes";

export default function SairAluno({ rotulo }: { rotulo?: string }) {
  const router = useRouter();
  const [saindo, iniciar] = useTransition();
  return (
    <>
      Oferta liberada{rotulo ? ` para ${rotulo}` : ""} ·{" "}
      <button
        type="button"
        disabled={saindo}
        onClick={() =>
          iniciar(async () => {
            try {
              await Promise.race([
                sairAluno(),
                new Promise<never>((_, falha) =>
                  setTimeout(() => falha(new Error("prazo")), 10_000),
                ),
              ]);
              router.refresh();
            } catch {
              // Página de uma versão anterior do site: recarrega na nova.
              window.location.reload();
            }
          })
        }
        className="underline decoration-white/30 underline-offset-2 hover:text-white"
      >
        usar outro CPF
      </button>
    </>
  );
}
