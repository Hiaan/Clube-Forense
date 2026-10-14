import { paginasConectadas } from "@/lib/painel/meta";
import { dataHora } from "@/lib/painel/formato";
import { conectarPaginaPorToken, removerPaginaPorToken } from "../acoes-meta";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Páginas conectadas por token de quem tem acesso a elas, sem passar pela BM da T9. */
export default async function SecaoPaginasToken() {
  const paginas = await paginasConectadas();
  return (
    <section className="painel-cartao p-6">
      <h2 className="font-display text-lg font-extrabold">Páginas conectadas sem a BM</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Para quando a Página do cliente não pode ser atribuída ao usuário do sistema (BM restrita, por exemplo). Quem tem acesso à Página gera um
        token pelo app T9 Painel e cola aqui; o painel guarda um token permanente da Página e busca os leads dela com ele.
      </p>

      {paginas.length > 0 && (
        <ul className="mt-3 divide-y divide-white/6 text-sm">
          {paginas.map((p) => (
            <li key={p.pagina_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{p.nome ?? p.pagina_id}</span>
                <span className="text-white/45">
                  {" "}
                  · por {p.conectada_por ?? "—"} em {dataHora(p.atualizado_em, "pt")}
                </span>
              </span>
              <form action={removerPaginaPorToken}>
                <input type="hidden" name="pagina" value={p.pagina_id} />
                <BotaoEnviar className="text-xs text-white/45 hover:text-[#ff8a90]" confirmar="Desconectar esta Página? Os leads dela param de vir.">
                  Desconectar
                </BotaoEnviar>
              </form>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-white/70 hover:text-white">Como gerar o token</summary>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-white/60">
          <li>
            Entre no Facebook com o perfil que tem acesso à Página. Se ele ainda não tiver função no app T9 Painel, adicione em developers.facebook.com
            → T9 Painel → Funções do app (Desenvolvedor) e aceite o convite nesse perfil.
          </li>
          <li>
            Abra <span className="text-white/80">developers.facebook.com/tools/explorer</span>, escolha o app <strong>T9 Painel</strong> e, em
            Permissões, adicione: <code className="text-xs">pages_show_list, pages_read_engagement, leads_retrieval, pages_manage_ads, pages_manage_metadata, ads_read</code>.
          </li>
          <li>Clique em &ldquo;Generate Access Token&rdquo;, marque a Página do cliente na janela da Meta e confirme.</li>
          <li>Copie o token gerado e cole abaixo.</li>
        </ol>
      </details>

      <FormComEstado acao={conectarPaginaPorToken} className="mt-4" limparAoSalvar>
        <label className="block">
          <span className="painel-rotulo">Token de acesso do usuário</span>
          <input name="token" type="password" autoComplete="off" placeholder="EAA…" className="painel-campo" />
        </label>
        <BotaoEnviar enviando="Conectando..." className="botao-painel mt-3">
          Conectar Páginas
        </BotaoEnviar>
      </FormComEstado>
    </section>
  );
}
