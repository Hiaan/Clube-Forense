import Link from "next/link";
import type { Metadata } from "next";
import { cadastrar } from "../acoes";
import Caixa from "../_ui/Caixa";
import Form from "../_ui/Form";
import Enviar from "../_ui/Enviar";
import { botao, campo, link, rotulo } from "../_ui/estilo";

export const metadata: Metadata = { title: "Criar conta" };

export default function Cadastro() {
  return (
    <Caixa titulo="Teste grátis por 7 dias" subtitulo="Sem cartão. Em 5 minutos o primeiro relatório está configurado.">
      <Form acao={cadastrar} className="space-y-4">
        <label className="block">
          <span className={rotulo}>Nome da agência</span>
          <input name="agencia" required autoComplete="organization" className={campo} placeholder="Ex.: Agência Alfa" />
        </label>
        <label className="block">
          <span className={rotulo}>Seu nome</span>
          <input name="nome" required autoComplete="name" className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>WhatsApp</span>
          <input name="telefone" inputMode="tel" autoComplete="tel" className={campo} placeholder="(83) 99999-9999" />
        </label>
        <label className="block">
          <span className={rotulo}>Senha (mínimo 8 caracteres)</span>
          <input name="senha" type="password" required minLength={8} autoComplete="new-password" className={campo} />
        </label>
        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input name="termos" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[#2F5BEA]" />
          <span>
            Li e aceito os termos de uso e a{" "}
            <Link href="/privacidade" className={link}>
              política de privacidade
            </Link>
            .
          </span>
        </label>
        <Enviar enviando="Criando..." className={`${botao} w-full`}>
          Criar conta grátis
        </Enviar>
      </Form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Já tem conta?{" "}
        <Link href="/placar/entrar" className={link}>
          Entrar
        </Link>
      </p>
    </Caixa>
  );
}
