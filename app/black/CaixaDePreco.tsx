"use client";

// A caixa de preço — onde a decisão acontece.
//
// O PREÇO VEM DO RELÓGIO, E NÃO DO HTML. É o mesmo gancho do contador: o lote
// que vale é função da hora, então o valor é calculado no navegador e muda
// sozinho quando o prazo vira. Preço escrito no servidor ficaria velho no
// primeiro minuto do lote seguinte, para quem estivesse com a página aberta.
//
// A ÂNCORA É CONTADA, NÃO INVENTADA. "De R$ X por R$ Y" só persuade quando o X
// se explica: aqui ele é a conta que a própria pessoa faria — quantos editais
// estão inclusos hoje, vezes o preço de um preparatório avulso. O número de
// editais vem do nosso monitor, ao vivo, e por isso a âncora sobe sozinha a
// cada concurso novo autorizado.

import { LOTES, PRECO_POR_EDITAL, reais, reaisComCentavos } from "./oferta";
import { useLote } from "./Contador";

export default function CaixaDePreco({
  editaisInclusos,
  id,
}: {
  editaisInclusos: number;
  id?: string;
}) {
  const { lote } = useLote();
  const indice = lote ? LOTES.findIndex((l) => l.nome === lote.nome) : 0;
  const mostrado = lote ?? LOTES[0];
  const avulso = editaisInclusos * PRECO_POR_EDITAL;

  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-3xl border border-[#ffcd07]/30 bg-gradient-to-b from-[#15151a] to-[#0b0b0d] p-6 shadow-[0_30px_80px_-20px_rgba(255,205,7,0.25)] sm:p-9"
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#ffcd07]/10 blur-3xl" />

      <div className="relative">
        {/* Os três lotes como escada: mostra onde a pessoa está e o que
            acontece se ela voltar amanhã. Escassez que se verifica sozinha. */}
        <div className="flex items-center gap-1.5">
          {LOTES.map((l, i) => {
            const passou = lote ? i < indice : false;
            const atual = lote ? i === indice : i === 0;
            return (
              <div key={l.nome} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    atual ? "bg-[#ffcd07]" : passou ? "bg-white/25" : "bg-white/10"
                  }`}
                />
                <p
                  className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    atual ? "text-[#ffcd07]" : "text-white/35"
                  }`}
                >
                  {l.nome}
                  {passou && " · esgotado"}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-7 text-sm text-white/50">
          Os {editaisInclusos} preparatórios já inclusos, comprados um a um, sairiam por
        </p>
        <p className="text-xl font-bold text-white/40 line-through decoration-[#ff4d4d]/70 decoration-2">
          {reais(avulso)}
        </p>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-[#ffcd07]">
          {mostrado.nome} — tudo incluso por
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            {mostrado.parcelas}x {reaisComCentavos(mostrado.valorParcela)}
          </span>
        </p>
        <p className="mt-1.5 text-base text-white/60">
          ou <strong className="font-bold text-white">{reais(mostrado.avista)}</strong> à vista
        </p>

        <a
          href={mostrado.checkout}
          className="mt-7 block w-full rounded-2xl bg-[#ffcd07] px-6 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
        >
          Quero todos os editais
        </a>

        <p className="mt-4 text-center text-xs leading-relaxed text-white/45">
          Compra segura pela Eduzz · Cartão, Pix ou boleto
          <br />
          Garantia incondicional de 7 dias
        </p>
      </div>
    </div>
  );
}
