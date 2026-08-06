"use client";

// O React limpa os campos de um <form action={...}> assim que a ação termina.
// Num formulário de criação isso é bom; nos do painel é o contrário: a tela de
// login apagava o e-mail quando a senha errava, e a de edição piscava os campos
// depois de salvar. Enviar por onSubmit — montando o FormData à mão — mantém o
// comportamento da ação e tira a limpeza automática.

import { startTransition, type FormEvent } from "react";

export function enviarSemLimpar(acao: (dados: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => acao(dados));
  };
}
