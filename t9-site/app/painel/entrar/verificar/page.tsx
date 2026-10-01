import Link from "next/link";
import { tokenValido } from "@/lib/painel/auth";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { confirmarLogin } from "../../acoes";
import { BotaoEnviar } from "../../_ui/Botoes";
import Moldura from "../Moldura";
import { idiomaDoVisitante } from "../idioma";

// O link do e-mail abre esta tela em vez de entrar direto: antivírus e prévias de
// e-mail costumam "visitar" links, e isso gastaria o token antes da pessoa clicar.
export default async function Verificar({ searchParams }: { searchParams: Promise<{ token?: string; idioma?: string }> }) {
  const { token = "", idioma: escolhido } = await searchParams;
  const idioma = await idiomaDoVisitante(escolhido);
  const t = TEXTOS_PAINEL[idioma].login;
  const valido = await tokenValido(token);

  return (
    <Moldura idioma={idioma} caminho={`/painel/entrar/verificar?token=${encodeURIComponent(token)}`}>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t.confirmarTitulo}</h1>
      {valido ? (
        <form action={confirmarLogin} className="mt-6">
          <p className="leading-relaxed text-white/65">{t.confirmarTexto}</p>
          <input type="hidden" name="token" value={token} />
          <BotaoEnviar className="botao-painel mt-6 w-full !min-h-[50px] !text-base">{t.confirmar}</BotaoEnviar>
        </form>
      ) : (
        <>
          <p className="mt-3 leading-relaxed text-white/65">{t.linkInvalido}</p>
          <Link href={`/painel/entrar?idioma=${idioma}`} className="botao-painel mt-6 w-full !min-h-[50px]">
            {t.pedirNovo}
          </Link>
        </>
      )}
    </Moldura>
  );
}
