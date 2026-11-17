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

import Avatar from "../components/Avatar";

import { reais } from "../black/oferta";
import { estadoComArtigo } from "../blog/lib/taxonomia";
import type { PostResumido } from "../lib/postsRepo";
import { APROVADOS } from "../monitor/lib/aprovados";
import { NIVEL_LABEL, type EstadoStatus, type Nivel } from "../monitor/lib/tipos";
import type { ConcursoPreparatorio } from "./concurso";
import { caminhoPreparatorio, type EstadoPreparatorio } from "./estados";

const ANDANDO: Nivel[] = ["banca", "comissao", "autorizado", "solicitado", "estudo"];

/**
 * Os alunos do Clube aprovados no último concurso do estado, com foto.
 *
 * Só quando o registro é do concurso do PRÓPRIO estado: os aprovados que
 * aprovados.ts guarda no DF são da Polícia Federal (`orgao`), e mostrá-los
 * na página da PCDF seria vender o resultado de outro concurso.
 */
function aprovadosDoConcurso(uf: string) {
  const a = APROVADOS[uf];
  if (!a || a.orgao) return null;
  // A colocação de cada um, como no mural da Black: uma por nome quando a
  // lista bate, a mesma para todos quando há uma só, nenhuma no resto.
  const pessoas = a.nomes
    .map((nome, i) => ({
      nome,
      destaque:
        a.destaques.length === a.nomes.length
          ? a.destaques[i]
          : a.destaques.length === 1
            ? a.destaques[0]
            : null,
    }));
  // Todos os nomes do mapa dos aprovados, com a colocação de cada um. O
  // filtro FORA_DO_MURAL vale para o mural da Black e do preparatório geral;
  // na página do estado, quem passou naquele concurso aparece.
  return { total: a.total, destaques: a.destaques, pessoas };
}

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
  const aprovados = aprovadosDoConcurso(e.uf);
  const nomeUf = estado?.nome ?? e.uf;

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
      {aprovados && (
        <div className="card-white mb-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
                nossos alunos aprovados no último concurso
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                {aprovados.total} aprovados {noEstado(e.uf, nomeUf)}
              </p>
            </div>
            {aprovados.destaques.length > 0 && (
              <p className="text-sm font-bold text-[#b38f00]">
                {aprovados.destaques.join(" · ")}
              </p>
            )}
          </div>
          {aprovados.pessoas.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {aprovados.pessoas.map((p) => (
                <div
                  key={p.nome}
                  className="rounded-2xl border border-gray-100 bg-[#f8f9fb] p-4 text-center"
                >
                  <div className="flex justify-center">
                    <Avatar nome={p.nome} size={72} />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-tight text-gray-900">
                    {p.nome}
                  </p>
                  {p.destaque && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#b38f00]">
                      {p.destaque}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            notícias do concurso no blog
          </p>
          {posts.length > 0 ? (
            <ul className="mt-3 divide-y divide-gray-100">
              {posts.map((p) => (
                <li key={p.slug} className="py-2.5">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-sm font-bold leading-snug text-gray-900 hover:underline"
                  >
                    {p.titulo}
                  </Link>
                  {p.publicadoEm && (
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {new Date(p.publicadoEm).toLocaleDateString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Ainda não publicamos notícia deste concurso. Quando sair qualquer
              movimentação, ela aparece aqui e no blog.
            </p>
          )}
          <Link
            href={`/blog?uf=${e.uf}`}
            className="mt-3 inline-block text-sm font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
          >
            Ver todas as notícias {deEstadoDe(e.uf, nomeUf)} no blog
          </Link>
        </div>
      </div>

    </div>
  );
}

/** "no Maranhão", "na Bahia", "em Minas Gerais". */
function noEstado(uf: string, nomeUf: string): string {
  const comArtigo = estadoComArtigo(uf) ?? nomeUf;
  return comArtigo.startsWith("o ")
    ? `no ${comArtigo.slice(2)}`
    : comArtigo.startsWith("a ")
      ? `na ${comArtigo.slice(2)}`
      : `em ${comArtigo}`;
}

/** "do Maranhão", "da Bahia", "de Minas Gerais". */
function deEstadoDe(uf: string, nomeUf: string): string {
  const comArtigo = estadoComArtigo(uf) ?? nomeUf;
  return comArtigo.startsWith("o ")
    ? `do ${comArtigo.slice(2)}`
    : comArtigo.startsWith("a ")
      ? `da ${comArtigo.slice(2)}`
      : `de ${comArtigo}`;
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
  const deEstado = deEstadoDe(e.uf, nomeUf);
  // "da PCERJ" quando há sigla; sem ela, o órgão por extenso ("da Polícia
  // Científica de Santa Catarina") — "da Santa Catarina" não existe.
  const doCurto = e.sigla
    ? `${e.doOrgao.startsWith("do ") ? "do" : "da"} ${e.sigla}`
    : e.doOrgao;
  const oCurto = doCurto.replace(/^d([ao]) /, "$1 ");

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
      titulo: `O concurso ${doCurto} para ${e.cargo.toLowerCase()}`,
      texto: `Onde o concurso está hoje e o que já se sabe dele, pela mesma base que alimenta o nosso mapa dos concursos — e é com isso que o seu estudo começa.`,
      conteudo: <Ficha e={e} estado={estado} posts={posts} />,
      botao: `Quero me preparar para ${oCurto}`,
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
      subtitulo: `Tudo o que você leva para estudar para ${oCurto}:`,
      primeiroItem:
        "Material pré-edital completo, com base nas principais matérias do último concurso",
      quadro: `preparatório ${curto} · ${e.cargo.toLowerCase()}`,
    },
    schema: {
      nome: `Preparatório para ${e.cargo} ${e.doOrgao} (${nomeUf}) — Clube Forense`,
      descricao: `Preparatório pré-edital para o concurso de ${e.cargo.toLowerCase()} ${e.doOrgao}${estado ? ` (etapa atual: ${NIVEL_LABEL[nivel].toLowerCase()}${banca ? `, banca ${banca}` : ""})` : ""}: Medicina Legal com professores que são médicos legistas, material com base nos últimos concursos, eBooks, mapas mentais e banco de questões.`,
      assuntos: ["Medicina Legal", `Concurso ${curto}`, e.cargo, nomeUf],
    },
    produto: `Preparatório ${curto}`,
    faq: [
      {
        p: `Quando sai o edital ${e.doOrgao} para ${e.cargo.toLowerCase()}?`,
        r:
          nivel === "edital"
            ? `O edital já foi publicado. As datas e a situação de cada etapa estão no mapa dos concursos do Clube Forense (mapa.clubeforense.com.br/?uf=${e.uf}), atualizado de hora em hora.`
            : `Ainda não saiu. Hoje o concurso está na etapa "${NIVEL_LABEL[nivel].toLowerCase()}"${banca ? `, com a banca ${banca}` : ""}. O monitor do Clube Forense confere notícias, diários oficiais e sites das bancas de hora em hora: acompanhe em mapa.clubeforense.com.br/?uf=${e.uf}.`,
      },
      ...(aprovadosDoConcurso(e.uf)
        ? [
            {
              p: `O Clube Forense já aprovou alunos ${noEstado(e.uf, nomeUf)}?`,
              r: (() => {
                const a = aprovadosDoConcurso(e.uf)!;
                return `Sim: ${a.total} alunos do Clube foram aprovados no último concurso${a.destaques.length ? ` (${a.destaques.join(", ")})` : ""}${a.pessoas.length ? `, entre eles ${a.pessoas.map((x) => x.nome).join(", ")}` : ""}.`;
              })(),
            },
          ]
        : []),
    ],
  };
}
