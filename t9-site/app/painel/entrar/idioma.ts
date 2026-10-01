import { headers } from "next/headers";
import { IDIOMAS, type Idioma } from "@/lib/i18n";

/** Idioma das telas de login: o escolhido no seletor ou o do navegador. */
export async function idiomaDoVisitante(escolhido?: string): Promise<Idioma> {
  if (IDIOMAS.includes(escolhido as Idioma)) return escolhido as Idioma;
  const aceitos = ((await headers()).get("accept-language") ?? "").toLowerCase();
  const primeiro = aceitos.split(",")[0]?.slice(0, 2);
  return IDIOMAS.includes(primeiro as Idioma) ? (primeiro as Idioma) : "pt";
}
