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

import { ESTADO_POR_UF } from "../monitor/lib/estados";
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

/** Um edital da oferta, com a situação que o monitor tiver dele. */
export interface EditalDaFaixa {
  uf: string;
  /** Nome curto do órgão, como o Clube apresenta (PC-PA, PCI-ES, PO-MA). */
  sigla: string;
  /** Nome por extenso — vai para o texto alternativo do distintivo. */
  orgao: string;
  /**
   * O que o monitor sabe deste estado. `null` quando ele ainda o classifica
   * abaixo de concurso andando — e aí o cartão não mostra etapa nenhuma, em
   * vez de mostrar uma que contradiz a oferta.
   */
  estado: EstadoStatus | null;
}

/**
 * Os distintivos dos órgãos, todos com arte do próprio Clube.
 *
 * ELES SUBSTITUÍRAM OS BRASÕES ANTIGOS, que eram de outra campanha e de outro
 * desenho. Cada arquivo é o distintivo do órgão que realiza o concurso, num
 * quadrado com fundo preto — por isso a moldura do cartão é preta e do mesmo
 * tamanho: o fundo da arte vira o fundo da peça, e o distintivo flutua.
 *
 * Estado sem arquivo cai na pastilha com a UF, e é por isso que a pastilha
 * continua aqui: a lista é do Clube, e quem acrescentar um estado amanhã não
 * pode quebrar a faixa por esquecer de mandar a imagem.
 */
const COM_DISTINTIVO = new Set(["AC", "DF", "ES", "MA", "MG", "PA", "RJ", "TO"]);

function Cartao({ edital }: { edital: EditalDaFaixa }) {
  const { uf, sigla, orgao, estado } = edital;
  const cor = estado ? NIVEL_COR[estado.nivel] : "#b38f00";
  // O nome vem da tabela de estados, não do monitor: o cartão precisa dizer
  // "Minas Gerais" mesmo quando o monitor ainda não tem etapa para ele.
  const nome = ESTADO_POR_UF[uf]?.nome ?? uf;

  return (
    <article className="flex w-[300px] shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.15)]">
      {COM_DISTINTIVO.has(uf) ? (
        <Image
          src={`/black/orgaos/${uf}.webp`}
          alt={`Distintivo — ${orgao}`}
          width={256}
          height={256}
          sizes="72px"
          className="h-[72px] w-[72px] shrink-0 rounded-xl bg-black object-contain"
        />
      ) : (
        <span
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-xl text-sm font-black text-white"
          style={{ backgroundColor: cor }}
        >
          {uf}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-base font-black leading-tight text-gray-900">{sigla}</p>
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {nome}
        </p>
        <p className="mt-1.5 truncate text-[13px] font-semibold" style={{ color: cor }}>
          {estado ? linhaDoConcurso(estado) : "Preparatório incluso"}
        </p>
      </div>
    </article>
  );
}

export default function CarrosselEditais({ editais }: { editais: EditalDaFaixa[] }) {
  // Com poucos estados a faixa ficaria curta demais para parecer contínua; a
  // repetição extra resolve sem mudar o que está escrito em cada cartão.
  const fila = editais.length >= 6 ? editais : [...editais, ...editais];

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
              <Cartao key={`${copia}-${e.uf}-${i}`} edital={e} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
