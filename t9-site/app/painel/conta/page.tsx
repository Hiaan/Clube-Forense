import { exigirUsuario } from "@/lib/painel/auth";
import { umaLinha } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { fmt } from "@/lib/i18n";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { CONFIG_IDIOMA, IDIOMAS } from "@/lib/i18n";
import { definirMinhaSenha, mudarIdioma } from "../acoes";
import FormComEstado from "../_ui/FormComEstado";
import Cabecalho from "../_ui/Cabecalho";
import { BotaoEnviar } from "../_ui/Botoes";

export default async function Conta() {
  const usuario = await exigirUsuario();
  const t = TEXTOS_PAINEL[usuario.idioma];
  const senha = await umaLinha<{ senha_em: string | null }>("select senha_em from usuarios where id = $1", [usuario.id]);
  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{t.conta.titulo}</h1>
        <dl className="painel-cartao mt-8 grid gap-4 p-6 text-sm">
          <div>
            <dt className="painel-rotulo">{t.conta.email}</dt>
            <dd>{usuario.email}</dd>
          </div>
          <div>
            <dt className="painel-rotulo">{t.conta.perfil}</dt>
            <dd>{t.conta.perfis[usuario.perfil]}</dd>
          </div>
        </dl>
        <form action={mudarIdioma} className="painel-cartao mt-4 p-6">
          <label htmlFor="idioma" className="painel-rotulo">
            {t.conta.idioma}
          </label>
          <div className="flex gap-3">
            <select id="idioma" name="idioma" defaultValue={usuario.idioma} className="painel-campo">
              {IDIOMAS.map((i) => (
                <option key={i} value={i}>
                  {CONFIG_IDIOMA[i].nome}
                </option>
              ))}
            </select>
            <BotaoEnviar enviando={t.geral.salvando}>{t.geral.salvar}</BotaoEnviar>
          </div>
        </form>
        <FormComEstado acao={definirMinhaSenha} limparAoSalvar className="painel-cartao mt-4 p-6">
          <h2 className="font-display text-lg font-extrabold">{t.conta.senhaTitulo}</h2>
          <p className="mt-1 text-sm text-white/55">
            {senha?.senha_em ? fmt(t.conta.senhaDefinida, { data: dataHora(senha.senha_em, usuario.idioma) }) : t.conta.senhaNenhuma} {t.conta.senhaTexto}
          </p>
          {/* Para o gerenciador de senhas do navegador associar a senha ao e-mail. */}
          <input type="email" name="usuario" autoComplete="username" value={usuario.email} readOnly hidden />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="painel-rotulo">{t.conta.senhaNova}</span>
              <input name="senha" type="password" required minLength={8} autoComplete="new-password" className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">{t.conta.senhaConfirmar}</span>
              <input name="confirmar" type="password" required minLength={8} autoComplete="new-password" className="painel-campo" />
            </label>
          </div>
          <BotaoEnviar enviando={t.geral.salvando} className="botao-painel mt-5">
            {t.conta.senhaSalvar}
          </BotaoEnviar>
        </FormComEstado>
      </main>
    </>
  );
}
