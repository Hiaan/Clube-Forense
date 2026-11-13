import type { Metadata } from "next";
import { redefinirSenha } from "../acoes";
import Caixa from "../_ui/Caixa";
import Form from "../_ui/Form";
import Enviar from "../_ui/Enviar";
import { botao, campo, rotulo } from "../_ui/estilo";

export const metadata: Metadata = { title: "Senha nova" };

export default async function Redefinir({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <Caixa titulo="Crie uma senha nova">
      <Form acao={redefinirSenha} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <label className="block">
          <span className={rotulo}>Senha nova (mínimo 8 caracteres)</span>
          <input name="senha" type="password" required minLength={8} autoComplete="new-password" className={campo} />
        </label>
        <Enviar enviando="Salvando..." className={`${botao} w-full`}>
          Salvar e entrar
        </Enviar>
      </Form>
    </Caixa>
  );
}
