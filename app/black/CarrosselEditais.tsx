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
// UMA LINHA POR CONCURSO, E ESSA FOI A CORREÇÃO MAIS IMPORTANTE DAQUI. A
// primeira versão trazia vagas, salário e banca em cada cartão, e os estados
// que ainda não divulgaram nada ficavam com um "vagas e banca ainda não
// divulgadas" ocupando o mesmo espaço — ou seja, o cartão anunciava a própria
// falta de informação. A arte que o Clube usa no preparatório resolve isso em
// uma linha por concurso ("Banca CEBRASPE | Prova: 10 de janeiro de 2027"), e
// é esse formato aqui: sigla do órgão, estado e a frase mais avançada que a
// ficha permitir. Sem ficha, fica só a etapa — que é verdade e basta.
//
// EM CSS, SEM JAVASCRIPT. A animação é a `marquee` de globals.css, com a
// classe `carousel-track`, que já vem com a pausa no hover. Uma lista que anda
// sozinha não precisa de estado em React, e assim a seção continua sendo
// renderizada no servidor — com os dados do monitor já dentro do HTML.

import Image from "next/image";

import { orgaoDaUf } from "../blog/lib/taxonomia";
import { NIVEL_COR, NIVEL_LABEL, type EstadoStatus } from "../monitor/lib/tipos";

/** "2027-01-10" → "10 de janeiro de 2027". Data por extenso lê-se como notícia. */
function porExtenso(v: string | null | undefined): string | null {
  if (!v?.trim()) return null;
  const d = new Date(v.length <= 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * A frase do concurso: a informação mais avançada que a ficha tiver.
 *
 * A ordem é a do que o candidato quer saber primeiro — data marcada ganha de
 * banca, que ganha de previsão, que ganha da etapa sozinha.
 */
function linhaDoConcurso(estado: EstadoStatus): string {
  const c = estado.curadoria;
  const etapa = NIVEL_LABEL[estado.nivel];
  const prova = porExtenso(c?.dataProva);
  const inscricoes = porExtenso(c?.inscricoesAte);
  const banca = c?.banca?.trim();

  if (banca && prova) return `Banca ${banca} · Prova em ${prova}`;
  if (inscricoes) return `Inscrições até ${inscricoes}`;
  if (banca) return `${etapa} · Banca ${banca}`;
  if (c?.previsao?.trim()) return `${etapa} · ${c.previsao.trim()}`;
  return etapa;
}

/**
 * Os brasões que o Clube já usa no carrossel do preparatório.
 *
 * Só existem para seis estados, e é por isso que o cartão sabe viver sem: o
 * monitor cobre os 27, e um estado autorizado amanhã não pode ficar de fora da
 * faixa por falta de arte. Sem brasão, entra a pastilha da UF na cor da etapa —
 * que é o mesmo código visual do mapa.
 */
const COM_BRASAO = new Set(["DF", "TO", "PE", "PA", "RJ", "MA"]);

function Cartao({ estado }: { estado: EstadoStatus }) {
  const cor = NIVEL_COR[estado.nivel];
  const sigla = orgaoDaUf(estado.uf)?.curto ?? estado.uf;

  return (
    <article className="flex w-[300px] shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.15)]">
      {COM_BRASAO.has(estado.uf) ? (
        <Image
          src={`/black/orgaos/${estado.uf}.webp`}
          alt=""
          width={360}
          height={360}
          sizes="56px"
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
          style={{ backgroundColor: cor }}
        >
          {estado.uf}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-base font-black leading-tight text-gray-900">{sigla}</p>
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {estado.nome}
        </p>
        <p className="mt-1.5 truncate text-[13px] font-semibold" style={{ color: cor }}>
          {linhaDoConcurso(estado)}
        </p>
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
      <div
        className="carousel-track flex w-max gap-4 px-4 py-2 motion-reduce:animate-none"
        // Mesma razão da faixa do topo: o ritmo padrão da classe corre demais
        // para quem está lendo o nome de um estado de cada vez.
        style={{ animationDuration: "80s" }}
      >
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
