import Link from "next/link";
import type { Metadata } from "next";
import { entrar } from "../acoes";
import Caixa from "../_ui/Caixa";
import Form from "../_ui/Form";
import Enviar from "../_ui/Enviar";
import { botao, campo, link, rotulo } from "../_ui/estilo";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <Caixa titulo="Entrar no Placar">
      <Form acao={entrar} className="space-y-4">
        <label className="block">
          <span className={rotulo}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Senha</span>
          <input name="senha" type="password" required autoComplete="current-password" className={campo} />
        </label>
        <Enviar enviando="Entrando..." className={`${botao} w-full`}>
          Entrar
        </Enviar>
      </Form>
      <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/placar/esqueci" className={link}>
          Esqueci a senha
        </Link>
        <Link href="/placar/cadastro" className={link}>
          Criar conta grátis
        </Link>
      </div>
    </Caixa>
  );
}
