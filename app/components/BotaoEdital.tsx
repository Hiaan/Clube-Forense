// Botão para o edital do estado.
//
// Um link só serve aos dois momentos: enquanto o edital não sai, ele aponta
// para o anterior — que é o documento que a pessoa estuda. Por isso o rótulo
// muda com o estágio do funil, e não o campo no painel.

import type { Nivel } from "../monitor/lib/tipos";

const TEMAS = {
  escuro: {
    // Publicado ganha o amarelo: quando o edital saiu, ele é a coisa mais
    // importante do card.
    publicado: "bg-[#ffcd07] text-gray-900 hover:brightness-95",
    anterior: "border border-white/15 text-white hover:bg-white/[0.08]",
  },
  claro: {
    publicado: "bg-gray-900 text-[#ffcd07] hover:bg-gray-800",
    anterior:
      "border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900",
  },
} as const;

export default function BotaoEdital({
  url,
  nivel,
  tema = "escuro",
}: {
  url: string;
  nivel: Nivel;
  tema?: keyof typeof TEMAS;
}) {
  const publicado = nivel === "edital";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
        TEMAS[tema][publicado ? "publicado" : "anterior"]
      }`}
    >
      {publicado ? "Acessar edital" : "Acessar último edital"} ↗
    </a>
  );
}
