"use client";

// Mapa interativo do radar de concursos (abertura do site). Mapa geográfico do
// Brasil em SVG: cada estado tem seu contorno real, é clicável, colorido pelo
// estágio do funil do edital, e o painel ao lado resume a situação (curadoria +
// notícias do monitor).

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import BancaLink from "./BancaLink";
import BotaoEdital from "./BotaoEdital";
import BotaoImls, { type ImlsEstado } from "./BotaoImls";
import BotaoInfo from "./BotaoInfo";
import { fichaTemConteudo, type FichaConcurso } from "./ficha";
import Modal from "./Modal";
import ModalAcesso from "./ModalAcesso";
import SeletorEstado from "./SeletorEstado";
import { NIVEL_COR, NIVEL_LABEL, NIVEL_TINTA, type Nivel } from "../monitor/lib/tipos";
import type { AprovacaoSite } from "../lib/aprovadosSite";
import { MAPA_CENTROIDES, MAPA_PATHS, MAPA_VIEWBOX } from "./mapaBrasilPaths";

// Estrela (viewBox 24) usada como selo de "aprovados do Clube" no mapa.
const ESTRELA_D =
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.2L12 17.3 5.8 21l1.6-7.2L2 9.1l7.1-.6z";

export type { ImlsEstado };

/** O plano de cargos e carreiras do estado, como sai no site. */
export interface PlanoEstado {
  orgao: string | null;
  ano: number | null;
  fonte: string | null;
  classes: { classe: string; subsidio: number | null }[];
}

/** A parte do estado que fica atrás do cadastro. */
export interface DetalheEstado {
  ultimaMencao: string | null;
  destaque: { titulo: string; resumo: string; fonte: string } | null;
  historico: {
    ultimoEdital: string | null;
    ultimaProva: string | null;
    banca: string | null;
  } | null;
  /** `null` quando o estado ainda não tem plano cadastrado. */
  plano: PlanoEstado | null;
  /** `null` quando ainda não se cadastrou nenhuma unidade. */
  imls: ImlsEstado | null;
  /** Link do edital: o publicado quando há, o anterior enquanto não sai. */
  editalUrl: string | null;
  /**
   * Nota de corte cadastrada no painel. Já vem filtrada pela visibilidade — o
   * que o painel não quis mostrar nem chega até aqui.
   */
  notaCorte: { valor: number; rotulo: string | null } | null;
  /** Ficha do concurso — estágio, salário, vagas, banca, TAF, matérias. */
  ficha: FichaConcurso;
}

export interface EstadoMapa {
  uf: string;
  nome: string;
  nivel: Nivel;
  score: number;
  /** Imagem do estado escolhida no painel; sem ela, mostramos a sigla. */
  imagemUrl: string | null;
  /**
   * `null` significa "ainda não liberado". A página inicial só preenche isto
   * para o estado em destaque; os demais chegam vazios e são buscados em
   * /api/estado/<uf> depois do cadastro. É o que impede pular o muro lendo o
   * código-fonte da página.
   */
  detalhe: DetalheEstado | null;
  /**
   * Prova do estado no ranking, quando existe. Fica FORA de `detalhe` de
   * propósito: o convite para participar é o que dá vontade de entrar, e
   * escondê-lo atrás do cadastro seria esconder justamente o chamariz. A página
   * do ranking é que decide o que mostrar a quem ainda não entrou.
   */
  ranking: { aberta: boolean } | null;
}

const LEGENDA: Nivel[] = [
  "edital",
  "banca",
  "comissao",
  "autorizado",
  "solicitado",
  "estudo",
  "noticia",
  "sem",
];

/** Estados pequenos demais para rótulo interno confortável. */
const ROTULO_PEQUENO = new Set(["DF", "SE", "AL", "RJ", "ES", "RN"]);

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Quantas classes cabem no card antes de a tabela dominar tudo o que está
 * abaixo dela. Passando disso, o resto vai para o pop-up.
 */
const CLASSES_NO_CARD = 7;

function reais(v: number | null): string {
  return v == null
    ? "—"
    : v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      });
}

function TabelaPlano({ classes }: { classes: PlanoEstado["classes"] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-wide text-gray-500">
          <th className="pb-1 font-semibold">Classe</th>
          <th className="pb-1 text-right font-semibold">Subsídio</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {classes.map((c, i) => (
          <tr key={`${c.classe}-${i}`}>
            <td className="py-1.5 text-gray-300">{c.classe}</td>
            <td
              className="py-1.5 text-right font-semibold text-white"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {reais(c.subsidio)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * De onde saiu a tabela: lei, anexo e data de vigência.
 *
 * Texto, e não link. O campo já foi um endereço e virava um "Ver a fonte ↗",
 * mas o levantamento das leis estaduais guarda a referência por extenso — e
 * como link ela virava um href quebrado, do tipo "Lei nº 15.395/2026, Anexo
 * IV". Escrita por extenso a fonte também serve a quem lê no celular sem
 * querer sair da página.
 */
function Fonte({ texto }: { texto: string }) {
  return <p className="mt-2 text-[11px] leading-relaxed text-gray-500">{texto}</p>;
}

/** Tabela do plano de cargos e carreiras do estado. */
function PlanoCarreira({ plano }: { plano: PlanoEstado }) {
  const [verTudo, setVerTudo] = useState(false);

  const passou = plano.classes.length > CLASSES_NO_CARD;
  const visiveis = passou ? plano.classes.slice(0, CLASSES_NO_CARD) : plano.classes;
  const cabecalho = [plano.orgao, plano.ano].filter(Boolean).join(" · ");

  return (
    <>
      {/* Fechado por padrão: a tabela inteira aberta enchia o card e empurrava
          a notícia e os aprovados para fora da tela. Quem quer o salário
          clica. */}
      <details className="group mt-4 rounded-xl border border-white/10 bg-white/[0.05]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 transition hover:bg-white/[0.04]">
          <span
            aria-hidden
            className="text-[10px] text-gray-500 transition-transform group-open:rotate-90"
          >
            ▶
          </span>
          <span className="text-sm font-bold text-white">Cargos e Carreiras</span>
          <span className="text-[11px] text-gray-400">{cabecalho}</span>
          <span className="ml-auto text-[11px] text-gray-500">
            {plano.classes.length} classes
          </span>
        </summary>

        <div className="px-4 pb-4">
          <TabelaPlano classes={visiveis} />

          {/* Carreiras longas existem — algumas passam de vinte classes.
              Cortar em sete e jogar o resto no pop-up mantém o card do estado
              legível sem esconder nada de quem quer a tabela toda. */}
          {passou && (
            <button
              type="button"
              onClick={() => setVerTudo(true)}
              className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-[#ffcd07] transition hover:bg-white/[0.06]"
            >
              Ver as {plano.classes.length} classes
            </button>
          )}

          {plano.fonte && !passou && <Fonte texto={plano.fonte} />}
        </div>
      </details>

      {/* Fora do <details> de propósito: fechar a seção com o pop-up aberto
          esconderia o pop-up junto, porque um details fechado some com tudo
          que não é o summary. */}
      {verTudo && (
        <Modal
          sobretitulo={cabecalho || undefined}
          titulo="Cargos e Carreiras"
          aoFechar={() => setVerTudo(false)}
        >
          <div className="mt-4">
            <TabelaPlano classes={plano.classes} />
            {plano.fonte && <Fonte texto={plano.fonte} />}
          </div>
        </Modal>
      )}
    </>
  );
}

/** Quantas linhas do resumo cabem antes de o texto dominar o card. */
const LINHAS_RESUMO = 3;

/**
 * Resumo da notícia, cortado em três linhas com "ler mais".
 *
 * O botão só aparece quando o texto realmente passa do corte — um "ler mais"
 * sob duas linhas é ruído, e a diferença entre resumo curto e longo não dá
 * para prever daqui: depende da largura da tela e da fonte, então é medida no
 * próprio elemento.
 */
function ResumoNoticia({ texto }: { texto: string }) {
  const [aberto, setAberto] = useState(false);
  const [passa, setPassa] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Compara com a altura de três linhas, e não com a altura visível: aberto,
    // o parágrafo não tem corte nenhum, e a comparação com clientHeight diria
    // que ele não passa — o botão sumiria justamente para quem acabou de
    // usá-lo, deixando o texto expandido sem como fechar.
    //
    // Quem mede é o ResizeObserver, inclusive na primeira vez: ele dispara
    // sozinho ao começar a observar. Medir aqui direto seria mudar estado
    // dentro do efeito, que o React desaconselha e o lint barra.
    const observador = new ResizeObserver(() => {
      const linha = parseFloat(getComputedStyle(el).lineHeight) || 16;
      setPassa(el.scrollHeight > linha * LINHAS_RESUMO + 2);
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <p
        ref={ref}
        className={`mt-2 break-words text-xs leading-relaxed text-gray-400 [overflow-wrap:anywhere] ${
          aberto ? "" : "line-clamp-3"
        }`}
      >
        {texto}
      </p>
      {passa && (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="mt-1 text-[11px] font-semibold text-[#ffcd07] hover:underline"
        >
          {aberto ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </>
  );
}

function corDoNivel(nivel: Nivel): string {
  return nivel === "sem" ? "#25211d" : NIVEL_COR[nivel];
}

export default function MapaConcursos({
  estados,
  aprovados,
}: {
  estados: EstadoMapa[];
  /** Vem do servidor: tabela do painel quando existe, lista do código como piso. */
  aprovados: Record<string, AprovacaoSite>;
}) {
  const porUf = new Map(estados.map((e) => [e.uf, e]));
  // estados vêm ordenados por score desc — o primeiro é o mais quente, e é ele
  // que abre selecionado, servindo de vitrine do que há atrás do cadastro.
  const emDestaque = estados[0]?.uf ?? "MA";
  const [ufSelecionada, setUfSelecionada] = useState<string>(emDestaque);

  const [pedindoCadastro, setPedindoCadastro] = useState<string | null>(null);

  const estadoBase = porUf.get(ufSelecionada);
  const detalheAtual = estadoBase?.detalhe ?? null;
  const sel = estadoBase && {
    ...estadoBase,
    ultimaMencao: detalheAtual?.ultimaMencao ?? null,
    destaque: detalheAtual?.destaque ?? null,
    historico: detalheAtual?.historico ?? null,
    plano: detalheAtual?.plano ?? null,
    imls: detalheAtual?.imls ?? null,
    editalUrl: detalheAtual?.editalUrl ?? null,
    notaCorte: detalheAtual?.notaCorte ?? null,
    ficha: detalheAtual?.ficha ?? null,
  };

  /**
   * Quem já se cadastrou recebe os detalhes prontos do servidor; para os
   * demais, só o estado em destaque vem preenchido. Então "detalhe vazio"
   * significa "precisa cadastrar", e não há o que buscar no cliente.
   */
  function abrirEstado(uf: string) {
    setUfSelecionada(uf);
    if (!porUf.get(uf)?.detalhe) setPedindoCadastro(uf);
  }

  /**
   * Depois do cadastro o cookie já está no navegador. Recarregar é mais simples
   * e mais confiável que remontar o estado no cliente: o servidor devolve a
   * página inteira já liberada, mapa e painel.
   */
  function aposCadastro() {
    window.location.reload();
  }

  return (
    <section className="relative z-10 py-12 sm:py-16" id="radar">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffcd07]">
            Radar · Médico-Legista
          </p>
          {/* O verbo fica do NOSSO lado. "Saiba as novidades" pede uma ação de
              quem lê; a mensagem é o contrário — ele não precisa fazer nada.
              E são 26 estados MAIS o Distrito Federal: o DF não é estado, e
              quem lê isto estuda direito constitucional para a prova. */}
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Vigiamos os 26 estados e o DF. Você só olha o mapa.
          </h2>
          {/* O subtítulo é o que PROVA a promessa: "buscamos tudo por você" é
              genérico, nomear as fontes e a frequência é verificável. */}
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">
            Notícias, diários oficiais, sites das bancas e o Instagram dos
            governos — checados de hora em hora. Escolha o seu estado e veja em
            que etapa está o edital.
          </p>
        </div>

        {/* Acima do mapa, e não abaixo: no celular, embaixo ele só apareceria
            depois de uma tela inteira de rolagem, que é justamente quem mais
            precisa dele. */}
        <div className="mb-6">
          <SeletorEstado
            estados={estados}
            ufSelecionada={ufSelecionada}
            aoEscolher={abrirEstado}
          />
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:justify-items-center">
          {/* Mapa geográfico */}
          <div className="w-full max-w-[420px]">
            <svg
              viewBox={MAPA_VIEWBOX}
              className="h-auto w-full"
              role="group"
              aria-label="Mapa do Brasil por estágio do edital"
            >
              {Object.entries(MAPA_PATHS).map(([uf, d]) => {
                const e = porUf.get(uf);
                const nivel: Nivel = e?.nivel ?? "sem";
                return (
                  <path
                    key={uf}
                    d={d}
                    fill={corDoNivel(nivel)}
                    stroke="#0b0b0d"
                    strokeWidth={2}
                    tabIndex={0}
                    role="button"
                    aria-label={`${e?.nome ?? uf} — ${NIVEL_LABEL[nivel]}`}
                    onClick={() => abrirEstado(uf)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") abrirEstado(uf);
                    }}
                    className="cursor-pointer outline-none transition-[filter] hover:brightness-125 focus-visible:brightness-125"
                  >
                    <title>{`${e?.nome ?? uf} — ${NIVEL_LABEL[nivel]}`}</title>
                  </path>
                );
              })}

              {/* Contorno de destaque do estado selecionado */}
              {MAPA_PATHS[ufSelecionada] && (
                <path
                  d={MAPA_PATHS[ufSelecionada]}
                  fill="none"
                  stroke="#ffcd07"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              )}

              {/* Rótulos das siglas */}
              {Object.entries(MAPA_CENTROIDES).map(([uf, [x, y]]) => {
                const e = porUf.get(uf);
                const nivel = e?.nivel ?? "sem";
                const semNovidade = nivel === "sem";
                if (ROTULO_PEQUENO.has(uf)) return null;
                return (
                  <text
                    key={uf}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={22}
                    fontWeight={700}
                    // A sigla é escrita por cima do estado, e metade da escala
                    // de calor é clara demais para letra branca: num estado
                    // amarelo a sigla sumia.
                    fill={semNovidade ? "#736c64" : NIVEL_TINTA[nivel]}
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {uf}
                  </text>
                );
              })}

              {/* Selo de aprovados do Clube (estrela dourada acima da sigla) */}
              {Object.keys(aprovados).map((uf) => {
                const c = MAPA_CENTROIDES[uf];
                if (!c) return null;
                const [x, y] = c;
                const s = 1.15;
                return (
                  <path
                    key={`${uf}-estrela`}
                    d={ESTRELA_D}
                    fill="#ffcd07"
                    stroke="#0b0b0d"
                    strokeWidth={1.4}
                    transform={`translate(${x + 15 - 12 * s}, ${y - 20 - 12 * s}) scale(${s})`}
                    pointerEvents="none"
                  />
                );
              })}
            </svg>

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {LEGENDA.map((n) => (
                <span key={n} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: corDoNivel(n) }}
                  />
                  {NIVEL_LABEL[n]}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="text-[#ffcd07]">★</span>
                Aprovados do Clube
              </span>
            </div>
          </div>

          {/* Painel do estado selecionado */}
          {sel && (
            // Opaco, e não translúcido: o fundo de constelação passa por
            // trás desta seção, e um card transparente deixava as linhas
            // cruzarem a notícia e a tabela de salários.
            <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-[#121215] p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {sel.imagemUrl ? (
                    <Image
                      src={sel.imagemUrl}
                      alt={sel.nome}
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffcd07] text-sm font-black text-gray-900">
                      {sel.uf}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{sel.nome}</h3>
                    <p className="text-xs text-gray-400">
                      Última movimentação: {formatarData(sel.ultimaMencao)}
                    </p>
                  </div>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: sel.nivel === "sem" ? "#3d3833" : NIVEL_COR[sel.nivel],
                    // Metade da escala é clara demais para texto branco.
                    color: sel.nivel === "sem" ? "#ffffff" : NIVEL_TINTA[sel.nivel],
                  }}
                >
                  {NIVEL_LABEL[sel.nivel]}
                </span>
              </div>

              {/* Com o edital na rua, a barra deixa de medir distância: não há
                  mais o que percorrer. Ela fecha em 100% e troca de rótulo —
                  "proximidade do edital: 92/100" para um estado cujo edital
                  JÁ SAIU é a tela contradizendo a própria manchete. */}
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-[11px] text-gray-400">
                  <span>
                    {sel.nivel === "edital" ? "Edital publicado" : "Proximidade do edital"}
                  </span>
                  <span>{sel.nivel === "edital" ? "100/100" : `${sel.score}/100`}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: sel.nivel === "edital" ? "100%" : `${sel.score}%`,
                      backgroundColor: sel.nivel === "sem" ? "#3d3833" : NIVEL_COR[sel.nivel],
                    }}
                  />
                </div>
              </div>

              {sel.historico && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      Último edital
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">
                      {sel.historico.ultimoEdital ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      Última prova
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">
                      {sel.historico.ultimaProva ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      Banca
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white">
                      <BancaLink
                        nome={sel.historico.banca}
                        className="text-[#ffcd07] hover:underline"
                      />
                    </p>
                  </div>
                </div>
              )}

              {sel.notaCorte && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    Nota de corte
                  </p>
                  <p className="mt-0.5 text-xl font-black text-white">
                    {sel.notaCorte.valor.toLocaleString("pt-BR")}
                  </p>
                  {sel.notaCorte.rotulo && (
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {sel.notaCorte.rotulo}
                    </p>
                  )}
                </div>
              )}

              {sel.plano && sel.plano.classes.length > 0 && (
                <PlanoCarreira plano={sel.plano} />
              )}

              {(sel.imls ||
                sel.editalUrl ||
                sel.ranking ||
                (sel.ficha && fichaTemConteudo(sel.ficha))) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* Primeiro na fila quando a prova está acontecendo: nesse dia
                      é a única coisa que a pessoa veio fazer aqui. */}
                  {sel.ranking?.aberta && (
                    <Link
                      href={`/ranking/${sel.uf}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#ffcd07] px-3.5 py-2 text-xs font-bold text-gray-900 transition hover:brightness-95"
                    >
                      Participar do ranking →
                    </Link>
                  )}
                  {sel.imls && <BotaoImls imls={sel.imls} estado={sel.nome} />}
                  {sel.ficha && fichaTemConteudo(sel.ficha) && (
                    <BotaoInfo ficha={sel.ficha} estado={sel.nome} />
                  )}
                  {sel.editalUrl && (
                    <BotaoEdital url={sel.editalUrl} nivel={sel.nivel} />
                  )}
                  {sel.ranking && !sel.ranking.aberta && (
                    <Link
                      href={`/ranking/${sel.uf}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/[0.08]"
                    >
                      Ranking e notas
                    </Link>
                  )}
                </div>
              )}

              {aprovados[sel.uf] && (
                <div className="mt-4 rounded-xl border border-[#ffcd07]/30 bg-[#ffcd07]/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#ffcd07]">
                    <span>🏆</span>
                    {aprovados[sel.uf].orgao
                      ? `Aprovados na ${aprovados[sel.uf].orgao}`
                      : `${aprovados[sel.uf].total} aprovados do Clube Forense`}
                  </p>
                  {aprovados[sel.uf].orgao && (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Concurso nacional — não é do concurso do {sel.uf}.
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {aprovados[sel.uf].destaques.map((d) => (
                      <span
                        key={d}
                        className="rounded-full bg-[#ffcd07]/20 px-2 py-0.5 text-[11px] font-semibold text-[#ffcd07]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                    {aprovados[sel.uf].nomes.map((n) => (
                      <span key={n} className="flex items-center gap-1.5">
                        <Avatar nome={n} size={28} fotoUrl={aprovados[sel.uf].fotos[n]} />
                        <span className="text-xs text-gray-300">{n}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!detalheAtual ? (
                // Bloqueado. O texto diz o que há atrás, não só que está fechado.
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">
                    Situação completa de {sel.nome} disponível após o cadastro
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    Último edital, última prova, banca organizadora e a
                    movimentação mais recente — como você está vendo no estado em
                    destaque.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPedindoCadastro(sel.uf)}
                    className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#ffcd07] px-4 py-2 text-xs font-bold text-gray-900 transition hover:brightness-95"
                  >
                    Liberar acesso gratuito →
                  </button>
                </div>
              ) : sel.destaque ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold leading-snug text-white">
                    {sel.destaque.titulo}
                  </p>
                  {/* `key` remonta o resumo ao trocar de estado no mapa, que
                      é como o React zera "aberto" sem um efeito só para isso —
                      senão o estado novo herdaria o expandido do anterior. */}
                  <ResumoNoticia key={sel.uf} texto={sel.destaque.resumo} />
                  <p className="mt-2 text-[11px] font-medium text-gray-500">
                    Fonte: {sel.destaque.fonte}
                  </p>
                </div>
              ) : (
                <p className="mt-5 border-t border-white/10 pt-4 text-sm text-gray-400">
                  Nenhuma movimentação recente registrada para este estado. O
                  radar segue monitorando notícias, diários e redes oficiais.
                </p>
              )}

              {detalheAtual && (
                <a
                  href="#painel"
                  className="mt-5 inline-flex items-center gap-1 rounded-full bg-[#ffcd07] px-4 py-2 text-xs font-bold text-gray-900 transition hover:brightness-95"
                >
                  Ver todas as menções no painel ↓
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {pedindoCadastro && (
        <ModalAcesso
          estado={porUf.get(pedindoCadastro)?.nome ?? null}
          uf={pedindoCadastro}
          aoFechar={() => setPedindoCadastro(null)}
          aoEntrar={aposCadastro}
        />
      )}
    </section>
  );
}
