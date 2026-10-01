import type { Idioma } from "@/lib/i18n";
import en from "./en";
import es from "./es";
import pt, { type Dicionario } from "./pt";

export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en, es };
export type { Dicionario };
