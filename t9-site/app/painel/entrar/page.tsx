import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/painel/auth";
import { bancoConfigurado } from "@/lib/painel/db";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import FormLogin from "./FormLogin";
import Moldura from "./Moldura";
import { idiomaDoVisitante } from "./idioma";

export default async function Entrar({ searchParams }: { searchParams: Promise<{ idioma?: string; erro?: string }> }) {
  const { idioma: escolhido, erro } = await searchParams;
  if (bancoConfigurado() && (await usuarioAtual())) redirect("/painel");
  const idioma = await idiomaDoVisitante(escolhido);
  const t = TEXTOS_PAINEL[idioma].login;

  return (
    <Moldura idioma={idioma} caminho="/painel/entrar">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t.titulo}</h1>
      <p className="mt-2 leading-relaxed text-white/65">{t.texto}</p>
      {erro === "link" && (
        <p role="alert" className="mt-5 rounded-xl border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-4 py-3 text-sm text-[#ffb3b7]">
          {t.linkInvalido}
        </p>
      )}
      <FormLogin t={t} idioma={idioma} />
    </Moldura>
  );
}
