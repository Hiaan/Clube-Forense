import { exigirUsuario } from "@/lib/painel/auth";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { CONFIG_IDIOMA, IDIOMAS } from "@/lib/i18n";
import { mudarIdioma } from "../acoes";
import Cabecalho from "../_ui/Cabecalho";
import { BotaoEnviar } from "../_ui/Botoes";

export default async function Conta() {
  const usuario = await exigirUsuario();
  const t = TEXTOS_PAINEL[usuario.idioma];
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
      </main>
    </>
  );
}
