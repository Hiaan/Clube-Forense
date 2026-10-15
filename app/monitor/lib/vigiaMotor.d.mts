// Tipos do vigiaMotor.mjs (JavaScript puro, copiado do vigia local).

export interface ItemVigia {
  canal: "noticia" | "diario";
  uf?: string;
  ufConsulta?: string;
  fonte: string;
  titulo: string;
  texto: string;
  link: string;
  data: string | null;
}

export const ESTADOS: Record<string, string>;
export function relevancia(texto: string): "direto" | "carreira" | null;
export function ufDoTexto(texto: string): string | null;
export function noticias(): Promise<{ itens: ItemVigia[]; ok: number; total: number }>;
export function diarios(): Promise<{ itens: ItemVigia[]; ok: number; total: number; falhas: string[] }>;
