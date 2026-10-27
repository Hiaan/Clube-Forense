// Os avisos da Black dos alunos: exclusividade, reembolso e o que entra e não
// entra. Em evidência de propósito — é a regra do jogo, e quem comprar sem
// ser aluno precisa ter sido avisado com clareza antes de pagar. Aparecem na
// entrada (antes do CPF) e de novo junto da oferta, na hora da compra.

export default function AvisoAluno() {
  return (
    <div className="space-y-3 text-left">
      <div className="rounded-2xl border-2 border-red-400/60 bg-[#2a1214] p-5 sm:p-6">
        <p className="flex items-start gap-3 text-lg font-black leading-snug text-white sm:text-xl">
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-500 text-base text-white"
          >
            !
          </span>
          Página exclusiva para alunos do Clube Forense
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/85">
          Se você{" "}
          <strong className="font-black text-white">
            não é aluno do Clube
          </strong>{" "}
          ou{" "}
          <strong className="font-black text-white">
            recebeu este link de outra pessoa
          </strong>
          , a sua compra{" "}
          <strong className="font-black text-red-300">será reembolsada</strong>{" "}
          e você não poderá seguir com esta promoção.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-emerald-400/40 bg-[#0c2219] p-5">
          <p className="flex items-center gap-2 text-base font-black text-white">
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs text-white"
            >
              ✓
            </span>
            O que entra
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
            Os preparatórios de todos os editais autorizados ou anunciados até
            2028, com as atualizações pós-edital e o acesso à plataforma no
            período descrito na oferta.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-red-400/40 bg-[#2a1214] p-5">
          <p className="flex items-center gap-2 text-base font-black text-white">
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white"
            >
              ✕
            </span>
            O que não entra
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
            Esta oferta não inclui as futuras turmas de mentoria e de intensivão
            que o Clube abrir — elas são vendidas à parte.
          </p>
        </div>
      </div>
    </div>
  );
}
