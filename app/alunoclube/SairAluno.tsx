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
            await sairAluno();
            router.refresh();
          })
        }
        className="underline decoration-white/30 underline-offset-2 hover:text-white"
      >
        usar outro CPF
      </button>
    </>
  );
}
