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
import {
  NIVEL_COR,
  NIVEL_LABEL,
  type EstadoStatus,
} from "../monitor/lib/tipos";

/** "2027-01-10" → "10 de janeiro de 2027". Data por extenso lê-se como notícia. */
function porExtenso(v: string | null | undefined): string | null {
  if (!v?.trim()) return null;
  const d = new Date(v.length <= 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  if (c?.previsao?.trim()) {
    // A previsão costuma ser escrita no painel começando pela própria etapa
    // ("Comissão formada; banca em definição"), e colada depois do rótulo ela
    // virava "Comissão formada · Comissão formada; banca…". Tira a repetição.
    const resto = c.previsao
      .trim()
      .replace(
        new RegExp(
          `^${etapa.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[;:,.·—–-]?\\s*`,
          "i",
        ),
        "",
      );
    return resto ? `${etapa} · ${resto}` : etapa;
  }
  return etapa;
}

/** Um edital da oferta, com a situação que o monitor tiver dele. */
export interface EditalDaFaixa {
  uf: string;
  /** Nome curto do órgão, como o Clube apresenta (PC-PA, PCI-ES, PO-MA). */
  sigla: string;
  /** Nome por extenso — vai para o texto alternativo do distintivo. */
  orgao: string;
  /** Banca confirmada pelo Clube, para quando a ficha ainda não tem. */
  banca?: string;
  /**
   * O que o monitor sabe deste estado. `null` quando ele ainda o classifica
   * abaixo de concurso andando — e aí o cartão não mostra etapa nenhuma, em
   * vez de mostrar uma que contradiz a oferta.
   */
  estado: EstadoStatus | null;
}

/**
 * Os distintivos dos órgãos, com arte do próprio Clube.
 *
 * Os arquivos vieram em quadrados de fundo preto e foram recortados: o preto
 * ligado à borda da imagem virou transparência, e o preto de dentro do
 * distintivo — gravação, faixa escura, sombra de relevo — ficou opaco. É o que
 * deixa o distintivo inteiro, sem moldura, por cima da faixa.
 *
 * Estado sem arquivo cai na pastilha com a UF, e é por isso que a pastilha
 * continua aqui: a lista é do Clube, e quem acrescentar um estado amanhã não
 * pode quebrar a faixa por esquecer de mandar a imagem.
 */
const COM_DISTINTIVO = new Set([
  "AC",
  "AM",
  "DF",
  "ES",
  "MA",
  "MG",
  "MT",
  "PA",
  "PE",
  "RJ",
  "TO",
]);

/**
 * Um edital, em forma de lower third — a tarja de televisão que apresenta
 * quem está falando.
 *
 * A PRIMEIRA VERSÃO ERA UM CARTÃO BRANCO com o distintivo num quadradinho, e
 * o distintivo, que é a peça mais forte do conjunto, virava ícone. Agora ele é
 * o protagonista: grande, à esquerda, saindo para cima e para baixo da tarja
 * escura, que nasce de trás dele e corre para a direita com sigla, estado e
 * situação — do jeito que um telejornal apresenta um convidado. A ponta
 * cortada em diagonal e o filete amarelo no topo são o que dá o desenho de
 * tarja, e não de caixa.
 */
function Cartao({ edital }: { edital: EditalDaFaixa }) {
  const { uf, sigla, orgao, estado, banca } = edital;

  // A banca que o Clube já confirmou entra quando o monitor ainda não sabe
  // dela — e só nesse caso: ficha com banca no painel volta a mandar sozinha.
  const usarBancaConfirmada = Boolean(
    banca && !estado?.curadoria?.banca?.trim(),
  );
  const cor = usarBancaConfirmada
    ? NIVEL_COR.banca
    : estado
      ? NIVEL_COR[estado.nivel]
      : "#ffcd07";
  const linha = usarBancaConfirmada
    ? `${NIVEL_LABEL.banca} · Banca ${banca}`
    : estado
      ? linhaDoConcurso(estado)
      : "Preparatório incluso";
  // O nome vem da tabela de estados, não do monitor: o cartão precisa dizer
  // "Minas Gerais" mesmo quando o monitor ainda não tem etapa para ele.
  const nome = ESTADO_POR_UF[uf]?.nome ?? uf;

  return (
    <article className="relative h-[132px] w-[360px] shrink-0">
      {/* A tarja. Começa no meio do distintivo, para ele parecer estar na
          frente dela e não ao lado. */}
      <div
        className="absolute inset-y-[26px] left-[52px] right-0 overflow-hidden bg-[#0b0b0d] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]"
        style={{
          clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)",
        }}
      >
        <span className="absolute inset-x-0 top-0 h-[3px] bg-[#ffcd07]" />
        <div className="flex h-full flex-col justify-center pl-[80px] pr-8">
          <p className="truncate text-lg font-black leading-tight text-white">
            {sigla}
          </p>
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            {nome}
          </p>
          <p
            className="mt-1 truncate text-[12px] font-semibold"
            style={{ color: cor }}
          >
            {linha}
          </p>
        </div>
      </div>

      {COM_DISTINTIVO.has(uf) ? (
        <Image
          src={`/black/orgaos/${uf}.webp`}
          alt={`Distintivo — ${orgao}`}
          width={256}
          height={256}
          sizes="124px"
          // SEM SOMBRA, de propósito. Havia uma, para descolar o distintivo
          // do fundo; sobre o cinza-claro da seção ela virava um borrão à
          // esquerda e embaixo de cada distintivo — o "traço" que aparecia no
          // site. O distintivo já tem relevo e brilho próprios; não precisa.
          className="absolute left-0 top-1/2 z-10 h-[124px] w-[124px] -translate-y-1/2 object-contain"
        />
      ) : (
        <span
          className="absolute left-[14px] top-1/2 z-10 grid h-[96px] w-[96px] -translate-y-1/2 place-items-center rounded-2xl text-xl font-black text-gray-900"
          style={{ backgroundColor: cor }}
        >
          {uf}
        </span>
      )}
    </article>
  );
}

export default function CarrosselEditais({
  editais,
}: {
  editais: EditalDaFaixa[];
}) {
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
        className="carousel-track flex w-max gap-6 px-4 py-2 motion-reduce:animate-none"
        // Mesma razão da faixa do topo: o ritmo padrão da classe corre demais
        // para quem está lendo o nome de um estado de cada vez.
        style={{ animationDuration: "80s" }}
      >
        {[0, 1].map((copia) => (
          <div
            key={copia}
            className="flex shrink-0 gap-6"
            aria-hidden={copia === 1}
          >
            {fila.map((e, i) => (
              <Cartao key={`${copia}-${e.uf}-${i}`} edital={e} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
