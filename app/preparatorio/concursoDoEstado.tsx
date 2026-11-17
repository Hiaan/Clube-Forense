// A página de preparatório de um estado, montada a partir do monitor.
//
// Acre e Tocantins têm a ficha escrita à mão. Os outros estados usam esta: a
// etapa do concurso, a banca, o salário e o último certame vêm do monitor (a
// mesma base que o mapa mostra, conferida no painel), os aprovados do Clube
// no estado vêm de aprovados.ts e as matérias, do blog. Quando a ficha do
// estado é atualizada no painel, a página acompanha sem ninguém publicar.
//
// O DISCURSO SEGUE A ETAPA. Edital publicado pede pressa; concurso andando
// (autorizado, comissão, banca) pede começar antes do edital; sem novidade,
// pede usar o tempo a favor. Nada aqui promete vaga ou data que o monitor não
// tenha.

import Link from "next/link";

import { reais } from "../black/oferta";
import { estadoComArtigo } from "../blog/lib/taxonomia";
import type { PostResumido } from "../lib/postsRepo";
import { APROVADOS, FORA_DO_MURAL } from "../monitor/lib/aprovados";
import { NIVEL_LABEL, type EstadoStatus, type Nivel } from "../monitor/lib/tipos";
import type { ConcursoPreparatorio } from "./concurso";
import { caminhoPreparatorio, type EstadoPreparatorio } from "./estados";

/** A base de medicina legal que cai em todo concurso de médico legista. */
const BASE = [
  "Perícias, peritos e documentos médico-legais",
  "Traumatologia forense",
  "Asfixiologia",
  "Tanatologia e cronotanatognose",
  "Sexologia forense",
  "Antropologia e identificação",
  "Psicopatologia forense",
  "Toxicologia forense",
];

const ANDANDO: Nivel[] = ["banca", "comissao", "autorizado", "solicitado", "estudo"];

function Ficha({
  e,
  estado,
  posts,
}: {
  e: EstadoPreparatorio;
  estado: EstadoStatus | null;
  posts: PostResumido[];
}) {
  const ficha = estado?.curadoria ?? null;
  const hist = estado?.historico ?? null;
  const aprovados = APROVADOS[e.uf];
  const nomes = aprovados?.nomes.filter((n) => !FORA_DO_MURAL.includes(n)) ?? [];

  const numeros = [
    estado && { valor: NIVEL_LABEL[estado.nivel], rotulo: "etapa do concurso hoje" },
    ficha?.banca
      ? { valor: ficha.banca, rotulo: "banca" }
      : hist?.banca && { valor: hist.banca, rotulo: "banca do último concurso" },
    ficha?.salarioInicial && { valor: reais(ficha.salarioInicial), rotulo: "salário inicial" },
    hist?.ultimoEdital && { valor: hist.ultimoEdital.slice(-4), rotulo: "último edital com o cargo" },
  ].filter(Boolean) as { valor: string; rotulo: string }[];

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      {numeros.length > 0 && (
        <div
          className={`grid grid-cols-2 gap-3 ${numeros.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
        >
          {numeros.map((n) => (
            <div key={n.rotulo} className="card-white p-5 text-center">
              <p className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                {n.valor}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {n.rotulo}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            o cargo
          </p>
          <p className="mt-3 text-lg font-black leading-snug text-gray-900">
            {e.cargoOficial ?? e.cargo}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {e.orgao}
            {e.sigla ? ` (${e.sigla})` : ""}
          </p>
          {hist?.obs && (
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Último concurso: {hist.obs}
            </p>
          )}
          <Link
            href={`/?uf=${e.uf}`}
            className="mt-4 inline-block text-sm font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
          >
            Acompanhe o concurso no mapa, atualizado de hora em hora
          </Link>
        </div>

        <div className="card-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            {aprovados ? "aprovados do Clube no estado" : "por que começar agora"}
          </p>
          {aprovados ? (
            <>
              <p className="mt-3 text-3xl font-black text-gray-900">
                {aprovados.total} aprovados
              </p>
              {aprovados.destaques.length > 0 && (
                <p className="mt-1 text-sm font-semibold text-[#b38f00]">
                  {aprovados.destaques.join(" · ")}
                </p>
              )}
              {nomes.length > 0 && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Entre eles: {nomes.join(", ")}.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Concurso de médico legista abre pouco, e quem é aprovado é quem
              já vinha estudando quando o edital saiu. A medicina legal que cai
              é a mesma em todo o país: estudar agora, com base nos últimos
              concursos, é chegar ao edital com a maior parte da prova
              específica já vista.
            </p>
          )}
        </div>
      </div>

      <div className="card-white mt-6 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
          o que estudar até o edital
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BASE.map((c) => (
            <span
              key={c}
              className="rounded-full border border-gray-200 bg-[#f8f9fb] px-3.5 py-1.5 text-sm font-semibold text-gray-800"
            >
              {c}
            </span>
          ))}
        </div>
        {posts.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
              notícias do concurso no blog
            </p>
            <ul className="mt-2 space-y-1.5">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-sm font-semibold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
                  >
                    {p.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function concursoDoEstado(
  e: EstadoPreparatorio,
  estado: EstadoStatus | null,
  posts: PostResumido[],
): ConcursoPreparatorio {
  const nivel = estado?.nivel ?? "sem";
  const nomeUf = estado?.nome ?? e.uf;
  const curto = e.sigla ?? nomeUf;
  const banca = estado?.curadoria?.banca;
  const salario = estado?.curadoria?.salarioInicial;
  // "do Maranhão", "da Bahia", "de Minas Gerais".
  const comArtigo = estadoComArtigo(e.uf) ?? nomeUf;
  const deEstado = comArtigo.startsWith("o ")
    ? `do ${comArtigo.slice(2)}`
    : comArtigo.startsWith("a ")
      ? `da ${comArtigo.slice(2)}`
      : `de ${comArtigo}`;

  const selo =
    nivel === "edital"
      ? `Edital ${curto} publicado`
      : nivel === "banca"
        ? banca
          ? `Banca ${banca} definida`
          : "Banca definida"
        : ANDANDO.includes(nivel)
          ? NIVEL_LABEL[nivel]
          : `Pré-edital ${nomeUf}`;

  const urgencia =
    nivel === "edital"
      ? {
          titulo: (
            <>
              O edital saiu: são poucas semanas até a prova.{" "}
              <span className="text-[#ffcd07]">Cada uma delas conta</span>
            </>
          ),
          texto: `Quem chega à prova dominando medicina legal sai na frente: é a parte que mais pesa nos concursos de médico legista. Em vez de juntar material de vários lugares, você estuda numa sequência só, com professores que são médicos legistas.`,
        }
      : ANDANDO.includes(nivel)
        ? {
            titulo: (
              <>
                O concurso {deEstado} andou: {NIVEL_LABEL[nivel].toLowerCase()}.{" "}
                <span className="text-[#ffcd07]">Comece antes do edital</span>
              </>
            ),
            texto: `Quem deixa para começar quando o edital sai perde semanas que não voltam. Com o nosso material, você estuda agora a medicina legal que cai em todo concurso de médico legista, com base nos últimos concursos, e chega ao edital ${e.doOrgao} com a maior parte da prova específica já vista.`,
          }
        : {
            titulo: (
              <>
                Sem edital ainda é a melhor hora:{" "}
                <span className="text-[#ffcd07]">
                  saia na frente da concorrência
                </span>
              </>
            ),
            texto: "Mesmo sem a publicação do edital, você pode estudar os principais assuntos que caem nos concursos, com base no conteúdo dos editais anteriores, para não ser pego de surpresa e estar preparado quando ele sair.",
          };

  return {
    slug: caminhoPreparatorio(e.uf).slice(1),
    sigla: curto,
    orgao: e.orgao,
    doOrgao: e.doOrgao,
    cargo: e.cargo,
    checkout: e.checkout,
    selo,
    faixa: `${curto} · ${NIVEL_LABEL[nivel].toLowerCase()} · preparatório de ${e.cargo.toLowerCase()}`,
    itensCapa: [
      "Aulas gravadas de Medicina Legal com base nos últimos concursos",
      "eBooks das matérias",
      "Mapas mentais exclusivos (resumos ilustrados)",
      "Banco de questões de concursos anteriores",
      "Suporte dedicado ao aluno",
      "Grupo com professores e alunos para tirar dúvidas e compartilhar conhecimento",
      "…e muito mais!",
    ],
    ficha: {
      nota: `${NIVEL_LABEL[nivel].toLowerCase()} · ${nomeUf}`,
      titulo: `O concurso ${e.doOrgao.startsWith("do ") ? "do" : "da"} ${curto} para ${e.cargo.toLowerCase()}`,
      texto: `Onde o concurso está hoje e o que já se sabe dele, pela mesma base que alimenta o nosso mapa dos concursos — e é com isso que o seu estudo começa.`,
      conteudo: <Ficha e={e} estado={estado} posts={posts} />,
      botao: `Quero me preparar para ${e.doOrgao.startsWith("do ") ? "o" : "a"} ${curto}`,
    },
    urgencia,
    paraQuem: [
      `Vão prestar o concurso ${e.doOrgao} para ${e.cargo.toLowerCase()}`,
      "Desejam estudar com professores que já são médicos legistas, com uma metodologia validada",
      "Querem começar antes do edital e chegar à prova na frente da concorrência",
      salario
        ? `Desejam estabilidade, salário inicial de ${reais(salario)} e a carreira pericial`
        : "Desejam estabilidade, altos salários e a carreira pericial",
      "Querem continuar preparados para os próximos concursos de legista do país",
    ],
    oferta: {
      subtitulo: `Tudo o que você leva para estudar para ${e.doOrgao.startsWith("do ") ? "o" : "a"} ${curto}:`,
      primeiroItem: "Material pré-edital completo, com base nos últimos concursos",
      quadro: `preparatório ${curto} · ${e.cargo.toLowerCase()}`,
    },
    schema: {
      nome: `Preparatório para ${e.cargo} ${e.doOrgao} (${nomeUf}) — Clube Forense`,
      descricao: `Preparatório pré-edital para o concurso de ${e.cargo.toLowerCase()} ${e.doOrgao}${estado ? ` (etapa atual: ${NIVEL_LABEL[nivel].toLowerCase()}${banca ? `, banca ${banca}` : ""})` : ""}: Medicina Legal com professores que são médicos legistas, material com base nos últimos concursos, eBooks, mapas mentais e banco de questões.`,
      assuntos: ["Medicina Legal", `Concurso ${curto}`, e.cargo, nomeUf],
    },
    produto: `Preparatório ${curto}`,
  };
}
