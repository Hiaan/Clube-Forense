// "Quer apenas um edital?" — o caminho para o aluno que não quer a Black
// inteira. Não há checkout de edital único na página: quem fecha é o Lucas,
// no WhatsApp de atendimento do Clube, com a mensagem já escrita.

import { WHATSAPP_EDITAL_UNICO } from "./cupons";

export default function BotaoEditalUnico({
  claro = false,
}: {
  /** Versão para fundo claro. */
  claro?: boolean;
}) {
  return (
    <a
      href={WHATSAPP_EDITAL_UNICO}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        claro
          ? "border-gray-200 bg-white hover:border-gray-900"
          : "border-white/15 bg-white/[0.04] hover:border-[#25d366]/70 hover:bg-white/[0.07]"
      }`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25d366] text-white">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46Z" />
        </svg>
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-black ${claro ? "text-gray-900" : "text-white"}`}
        >
          Quer apenas um edital?
        </span>
        <span
          className={`block text-xs leading-snug ${claro ? "text-gray-600" : "text-white/60"}`}
        >
          Chame o Lucas e garanta o edital único na Black
        </span>
      </span>
    </a>
  );
}
