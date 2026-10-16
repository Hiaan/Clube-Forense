import { exigirAdmin } from "@/lib/painel/auth";
import { consulta } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { adicionarMembro, alternarTodosClientes, definirSenhaMembro, removerMembro } from "../acoes";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";

export default async function Equipe() {
  const eu = await exigirAdmin();
  const membros = await consulta<{
    id: number;
    email: string;
    nome: string | null;
    perfil: string;
    ultimo_acesso: string | null;
    empresas: number;
    todos_clientes: boolean;
    tem_senha: boolean;
  }>(
    `select u.id, u.email, u.nome, u.perfil, u.ultimo_acesso, u.todos_clientes, u.senha_hash is not null as tem_senha,
            (select count(*)::int from acessos a where a.usuario_id = u.id) as empresas
       from usuarios u where u.perfil in ('admin', 'gestor') order by u.perfil, u.email`,
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Equipe T9</h1>
      <p className="mt-1 text-white/55">
        Administradores veem tudo, inclusive o financeiro. Gestores veem os clientes atribuídos a eles (ou todos, se marcado), mas nunca o
        financeiro: cobranças, mensalidades e quanto cada cliente paga ficam só com o administrador.
      </p>

      <ul className="painel-cartao mt-6 divide-y divide-white/6">
        {membros.map((m) => (
          <li key={m.id} className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{m.nome ?? m.email}</p>
                <p className="truncate text-xs text-white/50">
                  {m.nome ? `${m.email} · ` : ""}
                  {m.perfil === "admin" ? "Administrador" : m.todos_clientes ? "Gestor · todos os clientes" : `Gestor · ${m.empresas} cliente(s)`} ·{" "}
                  {m.tem_senha ? "com senha" : "sem senha"} · {m.ultimo_acesso ? `último acesso ${dataHora(m.ultimo_acesso, "pt")}` : "nunca entrou"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {m.perfil === "gestor" && (
                  <form action={alternarTodosClientes}>
                    <input type="hidden" name="usuario" value={m.id} />
                    <BotaoEnviar className="text-xs text-white/55 hover:text-white">
                      {m.todos_clientes ? "Ver só os atribuídos" : "Ver todos os clientes"}
                    </BotaoEnviar>
                  </form>
                )}
                {m.id !== eu.id && (
                  <form action={removerMembro}>
                    <input type="hidden" name="usuario" value={m.id} />
                    <BotaoEnviar className="text-xs text-[#ff8a90] hover:underline" confirmar={`Remover ${m.email} da equipe?`}>
                      Remover
                    </BotaoEnviar>
                  </form>
                )}
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-white/55 hover:text-white">{m.tem_senha ? "Trocar a senha" : "Definir senha"}</summary>
              <FormComEstado acao={definirSenhaMembro} limparAoSalvar className="mt-3">
                <input type="hidden" name="usuario" value={m.id} />
                <div className="flex flex-wrap items-end gap-3">
                  <label className="min-w-[220px] flex-1">
                    <span className="painel-rotulo">Nova senha (mínimo 8 caracteres)</span>
                    <input name="senha" type="password" required minLength={8} autoComplete="new-password" className="painel-campo" />
                  </label>
                  <BotaoEnviar enviando="Salvando..." className="botao-painel botao-painel-sec">
                    Salvar senha
                  </BotaoEnviar>
                </div>
              </FormComEstado>
            </details>
          </li>
        ))}
      </ul>

      <FormComEstado acao={adicionarMembro} limparAoSalvar className="painel-cartao mt-6 p-6">
        <h2 className="font-display text-lg font-extrabold">Adicionar à equipe</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="painel-rotulo">E-mail</span>
            <input name="email" type="email" required autoComplete="off" className="painel-campo" />
          </label>
          <label>
            <span className="painel-rotulo">Nome</span>
            <input name="nome" className="painel-campo" />
          </label>
          <label>
            <span className="painel-rotulo">Perfil</span>
            <select name="perfil" className="painel-campo">
              <option value="gestor">Gestor (sem acesso ao financeiro)</option>
              <option value="admin">Administrador (vê tudo)</option>
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Senha de acesso (mínimo 8 caracteres)</span>
            <input name="senha" type="password" minLength={8} autoComplete="new-password" className="painel-campo" />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/75 sm:col-span-2">
            <input type="checkbox" name="todos" defaultChecked className="size-4 accent-[#ff2d38]" />
            Gestor vê todos os clientes (inclusive os que forem cadastrados depois)
          </label>
        </div>
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-5">
          Adicionar
        </BotaoEnviar>
      </FormComEstado>
    </div>
  );
}
