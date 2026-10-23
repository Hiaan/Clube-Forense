// O botão redondo do WhatsApp, no canto da tela.
//
// É o canal de quem tem uma dúvida antes de pagar — e dúvida sem resposta é
// compra que não acontece. O link já abre a conversa com a mensagem pronta,
// para a equipe saber de onde a pessoa veio.
//
// Mora junto da barra fixa porque divide o rodapé com ela: quando a barra
// sobe, o botão sobe junto, em vez de ficar escondido atrás dela.

import { WHATSAPP } from "./oferta";

export default function BotaoWhatsApp({ elevado }: { elevado: boolean }) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Clube Forense no WhatsApp"
      title="Fale com a gente no WhatsApp"
      className={`fixed right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-6px_rgba(0,0,0,0.55)] ring-4 ring-white/10 transition-[bottom,transform] duration-300 hover:scale-105 sm:right-6 ${
        elevado ? "bottom-[88px]" : "bottom-5 sm:bottom-6"
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16.004 3C8.832 3 3.002 8.83 3.002 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.72A12.96 12.96 0 0 0 16.004 29C23.172 29 29 23.17 29 16S23.172 3 16.004 3Zm0 23.62c-1.98 0-3.92-.53-5.61-1.54l-.4-.24-3.96 1.02 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.38 16c0-5.86 4.77-10.62 10.63-10.62 5.85 0 10.61 4.76 10.61 10.62 0 5.86-4.77 10.62-10.62 10.62Zm5.83-7.95c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
