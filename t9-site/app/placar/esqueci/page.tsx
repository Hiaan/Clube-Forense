import Link from "next/link";
import type { Metadata } from "next";
import { esqueciSenha } from "../acoes";
import Caixa from "../_ui/Caixa";
import Form from "../_ui/Form";
import Enviar from "../_ui/Enviar";
import { botao, campo, link, rotulo } from "../_ui/estilo";

export const metadata: Metadata = { title: "Esqueci a senha" };

export default function Esqueci() {
  return (
    <Caixa titulo="Esqueceu a senha?" subtitulo="Mandamos um link para você criar uma nova.">
      <Form acao={esqueciSenha} className="space-y-4">
        <label className="block">
          <span className={rotulo}>E-mail da conta</span>
          <input name="email" type="email" required autoComplete="email" className={campo} />
        </label>
        <Enviar enviando="Enviando..." className={`${botao} w-full`}>
          Enviar link
        </Enviar>
      </Form>
      <p className="mt-6 text-center text-sm">
        <Link href="/placar/entrar" className={link}>
          Voltar para o login
        </Link>
      </p>
    </Caixa>
  );
}
