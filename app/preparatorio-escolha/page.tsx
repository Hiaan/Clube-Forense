// /preparatorio-escolha: o mapa para escolher o preparatório do seu concurso.
//
// É a porta de entrada da campanha de encerramento da Black: quem já sabe o
// concurso clica no estado e cai na página dele (/preparatorio-xx); quem quer
// todos vai para a Black Vitalícia, no botão grande ao lado do mapa. As cores
// são as do mapa dos concursos — a etapa de cada estado vem do monitor.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import BotaoWhatsApp from "../black/BotaoWhatsApp";
import Contador from "../black/Contador";
import {
  EDITAIS_DA_BLACK,
  LOTES,
  reais,
  reaisComCentavos,
} from "../black/oferta";
import DadosEstruturados from "../components/DadosEstruturados";
import EventosDeVenda from "../components/EventosDeVenda";
import { grafo } from "../lib/schema";
import { TOTAL_APROVADOS } from "../monitor/lib/aprovados";
import { coletar } from "../monitor/lib/coletor";
import { NIVEL_COR, NIVEL_LABEL, NIVEL_TINTA, type Nivel } from "../monitor/lib/tipos";
import {
  ESTADOS_PREPARATORIO,
  caminhoPreparatorio,
} from "../preparatorio/estados";
import { FIM_BLACK, PRECO_BLACK, PRECO_CHEIO } from "../preparatorio/oferta";
import MapaEscolha, { type EstadoNoMapa } from "./MapaEscolha";

// A etapa de cada estado vem do monitor, a cada visita.
export const dynamic = "force-dynamic";

const SITE = "https://mapa.clubeforense.com.br";

export const metadata: Metadata = {
  title: "Escolha o seu concurso de médico legista — preparatórios na Black | Clube Forense",
  description: `Clique no estado do seu concurso e veja o preparatório de médico legista dele: de ${reais(PRECO_CHEIO)} por ${reais(PRECO_BLACK)} na Black Friday. Ou leve todos os editais autorizados, com acesso vitalício.`,
  alternates: { canonical: "/preparatorio-escolha" },
  openGraph: {
    title: "Qual concurso de médico legista você vai prestar?",
    description: `Escolha o estado no mapa: preparatórios de ${reais(PRECO_CHEIO)} por ${reais(PRECO_BLACK)} na Black Friday.`,
    type: "website",
    images: ["/preparatorio/opengraph-image.jpg"],
  },
  robots: { index: true, follow: true },
};

/** Etapas em que o concurso está andando: o estado ganha destaque na lista. */
const QUENTES: Nivel[] = ["edital", "banca", "comissao", "autorizado"];

export default async function PreparatorioEscolhaPage() {
  const relatorio = await coletar();
  const black = LOTES[0];
  const fim = FIM_BLACK ?? black.fecha;
  const fimCurto = new Date(fim).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const estados: EstadoNoMapa[] = ESTADOS_PREPARATORIO.map((e) => {
    const s = relatorio.estados.find((x) => x.uf === e.uf);
    const nivel: Nivel = s?.nivel ?? "sem";
    return {
      uf: e.uf,
      nome: s?.nome ?? e.uf,
      etapa: nivel === "sem" ? "Pré-edital" : NIVEL_LABEL[nivel],
      cor: nivel === "sem" ? "#3a342e" : NIVEL_COR[nivel],
      tinta: nivel === "sem" ? "#b8afa5" : NIVEL_TINTA[nivel],
      href: caminhoPreparatorio(e.uf),
      quente: QUENTES.includes(nivel),
    };
  });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0b0b0d] text-white">
      <DadosEstruturados
        json={grafo({
          "@type": "ItemList",
          name: "Preparatórios para médico legista por estado — Clube Forense",
          itemListElement: estados.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Preparatório ${e.nome}`,
            url: `${SITE}${e.href}`,
          })),
        })}
      />

      <div className="bg-[#ffcd07] py-2 text-center text-xs font-black uppercase tracking-[0.18em] text-gray-900 sm:text-sm">
        Black Friday · preparatórios de {reais(PRECO_CHEIO)} por {reais(PRECO_BLACK)} até {fimCurto}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#ffcd07]/10 blur-[130px]" />

        <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
          <Image
            src="/logo-fundo-escuro.png"
            alt="Clube Forense"
            width={162}
            height={28}
            priority
            className="mx-auto h-7 w-auto lg:mx-0"
          />

          <div className="mt-8 text-center lg:text-left">
            <span className="badge-pulse inline-flex rounded-full border border-[#ffcd07]/30 bg-[#ffcd07]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ffcd07]">
              Escolha o seu concurso
            </span>
            <h1 className="mt-5 text-[30px] font-black leading-[1.08] tracking-tight sm:text-5xl">
              Qual concurso de{" "}
              <span className="text-[#ffcd07]">médico legista</span> você vai
              prestar?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/65 lg:mx-0">
              Clique no estado e veja o preparatório dele, com professores que
              já são médicos legistas e o método de mais de{" "}
              {Math.floor(TOTAL_APROVADOS / 10) * 10} aprovados.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <MapaEscolha estados={estados} />

            <div className="space-y-5 lg:sticky lg:top-6">
              {/* Preparatório individual */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd07]">
                  preparatório de um concurso
                </p>
                <p className="mt-3 text-base font-semibold text-white/50">
                  de <span className="line-through">{reais(PRECO_CHEIO)}</span> por
                </p>
                <p className="text-5xl font-black tracking-tight">
                  {reais(PRECO_BLACK)}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Black Friday, até {fimCurto}. Escolha o estado no mapa para
                  ver o preparatório e garantir o seu.
                </p>
                <p className="mt-3 text-[13px] font-semibold text-white/45">
                  Termina em <Contador compacto ate={fim} />
                </p>
              </div>

              {/* Black Vitalícia: o botão grande */}
              <div className="rounded-3xl border-2 border-[#ffcd07] bg-gradient-to-b from-[#1d1a10] to-[#0b0b0d] p-6 shadow-[0_30px_80px_-30px_rgba(255,205,7,0.45)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd07]">
                  quer todos?
                </p>
                <p className="mt-2 text-2xl font-black leading-tight">
                  Leve todos os {EDITAIS_DA_BLACK.length} editais autorizados,
                  com <span className="text-[#ffcd07]">acesso vitalício</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {EDITAIS_DA_BLACK.map((e) => e.sigla).join(", ")}: um
                  pagamento só, para estudar para todos eles.
                </p>
                <p className="mt-4 text-base text-white/50">
                  de{" "}
                  <span className="line-through">
                    {reais(EDITAIS_DA_BLACK.length * PRECO_CHEIO)}
                  </span>{" "}
                  por
                </p>
                <p className="text-4xl font-black tracking-tight text-[#ffcd07]">
                  {reais(black.avista)}
                </p>
                <p className="text-sm text-white/60">
                  ou {black.parcelas}x de {reaisComCentavos(black.valorParcela)}
                </p>
                <Link
                  href="/black"
                  className="mt-5 block rounded-2xl bg-[#ffcd07] px-6 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
                >
                  Quero todos os editais
                </Link>
                <p className="mt-3 text-center text-xs text-white/40">
                  Black Vitalícia · garantia de 7 dias
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 py-8 pb-24 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Clube Forense · CNPJ 53.323.379/0001-37
      </footer>

      <EventosDeVenda produto="Preparatórios — escolha do estado" valor={PRECO_BLACK} />
      <BotaoWhatsApp
        elevado={false}
        mensagem="Olá! Quero ajuda para escolher o preparatório do meu concurso."
      />
    </div>
  );
}
