import { exigirAdmin } from "@/lib/painel/auth";
import { consulta } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { adicionarMembro, removerMembro } from "../acoes";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";

export default async function Equipe() {
  const eu = await exigirAdmin();
  const membros = await consulta<{ id: number; email: string; nome: string | null; perfil: string; ultimo_acesso: string | null; empresas: number }>(
    `select u.id, u.email, u.nome, u.perfil, u.ultimo_acesso, (select count(*)::int from acessos a where a.usuario_id = u.id) as empresas
       from usuarios u where u.perfil in ('admin', 'gestor') order by u.perfil, u.email`,
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Equipe T9</h1>
      <p className="mt-1 text-white/55">
        Administradores veem todos os clientes. Gestores veem só os clientes atribuídos a eles (na página de cada cliente).
      </p>

      <ul className="painel-cartao mt-6 divide-y divide-white/6">
        {membros.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{m.nome ?? m.email}</p>
              <p className="truncate text-xs text-white/50">
                {m.nome ? `${m.email} · ` : ""}
                {m.perfil === "admin" ? "Administrador" : `Gestor · ${m.empresas} cliente(s)`} ·{" "}
                {m.ultimo_acesso ? `último acesso ${dataHora(m.ultimo_acesso, "pt")}` : "nunca entrou"}
              </p>
            </div>
            {m.id !== eu.id && (
              <form action={removerMembro}>
                <input type="hidden" name="usuario" value={m.id} />
                <BotaoEnviar className="text-xs text-[#ff8a90] hover:underline" confirmar={`Remover ${m.email} da equipe?`}>
                  Remover
                </BotaoEnviar>
              </form>
            )}
          </li>
        ))}
      </ul>

      <FormComEstado acao={adicionarMembro} limparAoSalvar className="painel-cartao mt-6 p-6">
        <h2 className="font-display text-lg font-extrabold">Adicionar à equipe</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1.3fr_1fr_auto]">
          <label>
            <span className="painel-rotulo">E-mail</span>
            <input name="email" type="email" required className="painel-campo" />
          </label>
          <label>
            <span className="painel-rotulo">Nome</span>
            <input name="nome" className="painel-campo" />
          </label>
          <label>
            <span className="painel-rotulo">Perfil</span>
            <select name="perfil" className="painel-campo">
              <option value="gestor">Gestor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
        </div>
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-5">
          Adicionar
        </BotaoEnviar>
      </FormComEstado>
    </div>
  );
}
