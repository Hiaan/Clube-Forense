// Os concursos inclusos, passando em carrossel.
//
// POR QUE CARROSSEL E NÃO GRADE. Em grade, nove estados viram uma tabela que o
// olho varre em diagonal e esquece. Passando, cada cartão tem um instante só
// para si e a seção ganha a sensação que o dado merece: isto aqui está vivo e
// continua chegando. É o mesmo recurso que o site do preparatório usa para os
// editais — aqui com os números reais de cada estado em vez de uma arte
// estática, e com o movimento parando quando o ponteiro chega perto, para
// ninguém ter que correr atrás da informação.
//
// EM CSS, SEM JAVASCRIPT. A animação é a `marquee` de globals.css, com a
// classe `carousel-track`, que já vem com a pausa no hover. Uma lista que anda
// sozinha não precisa de estado em React, e assim a seção continua sendo
// renderizada no servidor — com os dados do monitor já dentro do HTML.
//
// A LISTA É DUPLICADA de propósito: quando a primeira cópia termina de sair, a
// segunda está exatamente onde a primeira começou, e o laço não tem emenda.

import { NIVEL_COR, NIVEL_LABEL, type EstadoStatus } from "../monitor/lib/tipos";
import { reais } from "./oferta";

function Cartao({ estado }: { estado: EstadoStatus }) {
  const c = estado.curadoria;
  const cor = NIVEL_COR[estado.nivel];

  return (
    <article className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
      <div className="h-1.5 w-full" style={{ backgroundColor: cor }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-black leading-tight text-gray-900">{estado.nome}</p>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-100 font-mono text-xs font-black text-gray-500">
            {estado.uf}
          </span>
        </div>

        <p
          className="mt-1 text-[11px] font-black uppercase tracking-wider"
          style={{ color: cor }}
        >
          {NIVEL_LABEL[estado.nivel]}
        </p>

        <dl className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
          {c?.vagasImediatas ? (
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Vagas</dt>
              <dd className="font-bold text-gray-900">
                {c.vagasImediatas}
                {c.vagasCr ? ` + ${c.vagasCr} CR` : ""}
              </dd>
            </div>
          ) : null}
          {c?.salarioInicial ? (
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Salário</dt>
              <dd className="font-bold text-gray-900">{reais(c.salarioInicial)}</dd>
            </div>
          ) : null}
          {c?.banca ? (
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Banca</dt>
              <dd className="font-bold text-gray-900">{c.banca}</dd>
            </div>
          ) : null}
          {!c?.vagasImediatas && !c?.salarioInicial && !c?.banca && (
            <p className="text-gray-400">Vagas e banca ainda não divulgadas</p>
          )}
        </dl>
      </div>
    </article>
  );
}

export default function CarrosselEditais({ estados }: { estados: EstadoStatus[] }) {
  // Com poucos estados a faixa ficaria curta demais para parecer contínua; a
  // repetição extra resolve sem mudar o que está escrito em cada cartão.
  const fila = estados.length >= 6 ? estados : [...estados, ...estados];

  return (
    <div
      className="relative -mx-4 overflow-hidden"
      // A máscara desfaz as pontas: os cartões entram e saem da seção em vez de
      // serem cortados por uma linha reta.
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="carousel-track flex w-max gap-4 px-4 py-2 motion-reduce:animate-none">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0 gap-4" aria-hidden={copia === 1}>
            {fila.map((e, i) => (
              <Cartao key={`${copia}-${e.uf}-${i}`} estado={e} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
