// A página de vendas da Black Forense.
//
// A IDEIA QUE SUSTENTA A PÁGINA INTEIRA: a oferta não é "um curso com
// desconto", é "todos os concursos de uma vez". Por isso a seção mais
// importante não é a de preço — é a lista dos editais inclusos, puxada AO VIVO
// do nosso monitor. Ela cresce sozinha a cada concurso autorizado, e é a prova
// visível de que a promessa ("todo edital que sair nos próximos 2 anos") já
// está sendo cumprida antes mesmo da compra. Nenhum concorrente consegue
// copiar essa seção sem ter o monitor por trás.
//
// O RITMO CLARO/ESCURO É DELIBERADO, E FOI CORREÇÃO DE ROTA. A primeira versão
// era preta de ponta a ponta: ficou sóbria demais e longe da referência que o
// Clube pediu, que é clara, arejada e cheia de rosto. Agora o preto é usado
// onde ele trabalha a favor — a capa (é uma Black), os dados do funil e a
// caixa de preço — e o miolo é claro, que é onde moram as pessoas: a
// plataforma, os professores e os aprovados. Alternar também resolve o
// problema de uma página longa: cada troca de fundo diz "começou outro
// assunto" sem precisar de um título gritando isso.
//
// A ÂNCORA DE PREÇO É CALCULADA: quantos editais estão inclusos hoje, vezes o
// preço de um preparatório avulso. Não é número inventado para riscar — é a
// conta que a própria pessoa faria.
//
// O QUE NÃO TEM AQUI, DE PROPÓSITO: brinde físico (não existe), combo de
// planos (a oferta é uma só) e qualquer captura de tela fingida da plataforma.
// Onde o vídeo real ainda não entrou, há maquete desenhada em CSS — ver
// Plataforma.tsx.

import Image from "next/image";
import Link from "next/link";

import Avatar from "../components/Avatar";
import BarraFixa from "./BarraFixa";
import CarrosselEditais from "./CarrosselEditais";
import CaixaDePreco from "./CaixaDePreco";
import Contador from "./Contador";
import DrBonet from "./DrBonet";
import HeroComposicao from "./HeroComposicao";
import Plataforma from "./Plataforma";
import ProfessoresParceiros from "./ProfessoresParceiros";
import PrecoAtual from "./PrecoAtual";
import Ticker from "./Ticker";
import {
  ANOS_DE_ACESSO,
  PLATAFORMA,
  PRECO_POR_EDITAL,
  QUESTOES,
  WHATSAPP,
  reais,
} from "./oferta";
import { APROVADOS } from "../monitor/lib/aprovados";
import { coletar } from "../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import { type Nivel } from "../monitor/lib/tipos";

// A lista de editais vem da coleta, que tem cache próprio de uma hora. A página
// é dinâmica para que um concurso autorizado hoje apareça hoje.
export const dynamic = "force-dynamic";

/** As etapas que valem como "concurso em andamento" — o que a oferta cobre. */
const ETAPAS_INCLUSAS: Nivel[] = ["edital", "banca", "comissao", "autorizado"];

/**
 * Os professores, com a foto que já existe no material do Clube.
 *
 * A arte de cada um já traz nome e CRM gravados, então o cartão não repete
 * isso embaixo — repetir faria a mesma informação aparecer duas vezes em dois
 * tamanhos diferentes, que é como cartão de professor costuma ficar feio.
 */
const PROFESSORES = [
  {
    arquivo: "erika.png",
    nome: "Dra. Erika Anjos",
    cargo: "Médica-legista em Pernambuco",
    texto:
      "Professora da UFPE. Residência em oftalmologia pelo HCPE, com especialização em estrabismo e neuroftalmologia, e mestrado em Psicologia Clínica.",
  },
  {
    arquivo: "joao-paulo.png",
    nome: "Dr. João Paulo",
    cargo: "Médico-legista, 4 aprovações",
    texto:
      "Residência em patologia pelo IMIP. Atua no IML do Recife, na PEFOCE (Ceará) e no Laboratório Argos.",
  },
  {
    arquivo: "miguel.png",
    nome: "Dr. Miguel Souza",
    cargo: "Médico-legista desde 2018",
    texto:
      "Graduado pela UFPE, especialista em traumatologia e ortopedia e mestre em perícia forense.",
  },
];

function Secao({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-5xl px-4 ${className}`}>
      {children}
    </section>
  );
}

/** Título de seção. `claro` troca a cor do texto para fundo branco. */
function Titulo({
  children,
  nota,
  claro = false,
}: {
  children: React.ReactNode;
  nota?: string;
  claro?: boolean;
}) {
  return (
    <>
      {nota && (
        <p
          className={`text-center text-xs font-bold uppercase tracking-[0.2em] ${
            claro ? "text-[#b38f00]" : "text-[#ffcd07]"
          }`}
        >
          {nota}
        </p>
      )}
      <h2
        className={`mt-3 text-center text-3xl font-black leading-tight tracking-tight sm:text-4xl ${
          claro ? "text-gray-900" : "text-white"
        }`}
      >
        {children}
      </h2>
    </>
  );
}

export default async function BlackPage() {
  const relatorio = await coletar();

  // Estado travado na curadoria fica de fora, e esse filtro vale dinheiro: o
  // travamento existe exatamente onde a manchete engana — concurso que avança
  // sem vaga de médico-legista. Listá-lo aqui seria vender um edital que não
  // serve ao nosso aluno.
  const inclusos = relatorio.estados
    .filter((e) => ETAPAS_INCLUSAS.includes(e.nivel) && !e.curadoria?.travado)
    .sort((a, b) => b.score - a.score);

  const totalAprovados = Object.values(APROVADOS).reduce((s, a) => s + a.total, 0);
  const estadosComAprovado = Object.keys(APROVADOS).length;

  // Cada aprovado divulgado, com o estado dele — para o mural de rostos.
  const mural = Object.entries(APROVADOS).flatMap(([uf, a]) =>
    a.nomes.map((nome) => ({
      nome,
      uf,
      onde: a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf,
      destaque: a.destaques[0] ?? null,
    })),
  );

  return (
    <div>
      {/* ----------------------------------------------------------- topo */}
      {/* NÃO HÁ CABEÇALHO, E ISSO É A REGRA DA PÁGINA. Menu no topo de página
          de venda é porta de saída: cada link leva para outro lugar que não é
          o botão. No lugar dele vai a faixa da campanha, que ocupa a mesma
          faixa de tela e trabalha a favor — lembra em que oferta a pessoa
          entrou. A marca aparece dentro da capa, onde ela apresenta em vez de
          navegar. */}
      <Ticker texto="Black Forense · todos os editais autorizados · um preço só" />

      {/* ----------------------------------------------------------- capa */}
      {/* TEXTO À ESQUERDA, GENTE À DIREITA. É a divisão que a referência usa e
          que funciona porque as duas metades respondem perguntas diferentes: a
          da esquerda diz O QUE É, a da direita diz COM QUEM e EM QUE
          PLATAFORMA. Centralizar tudo, como estava antes, obriga o olho a
          descer em zigue-zague e empurra a prova (os professores) para baixo
          da dobra.

          PREÇO NÃO APARECE AQUI. Quem chega ainda não sabe o que está sendo
          vendido; número antes do valor é só um susto. O preço mora numa
          seção só dele, no fim, depois de a página ter contado quantos editais
          entram, quem ensina e o que tem na plataforma. O contador fica — ele
          marca o prazo do lote sem revelar quanto custa. */}
      <div id="capa" className="relative overflow-hidden bg-[#0b0b0d]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#ffcd07]/10 blur-[130px]" />

        <Secao className="relative pb-20 pt-8 sm:pt-10">
          <Image
            src="/logo-fundo-escuro.png"
            alt="Clube Forense"
            width={162}
            height={28}
            priority
            className="mx-auto h-7 w-auto lg:mx-0"
          />

          <div className="mt-10 grid items-center gap-14 lg:mt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div className="text-center lg:text-left">
              <span className="badge-pulse inline-flex items-center gap-2 rounded-full border border-[#ffcd07]/30 bg-[#ffcd07]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ffcd07]">
                Black Forense 2026
              </span>

              <h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Todos os editais de{" "}
                <span className="text-[#ffcd07]">médico-legista</span> do país.
                <br className="hidden sm:block" /> Um acesso só.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
                São <strong className="font-bold text-white">{inclusos.length} concursos</strong>{" "}
                em andamento agora — e todo edital novo que sair nos próximos{" "}
                <strong className="font-bold text-white">{ANOS_DE_ACESSO} anos</strong> entra
                para você sem pagar de novo. Preparatório completo de cada um, pré e
                pós-edital.
              </p>

              <ul className="mx-auto mt-7 flex max-w-xl flex-col gap-2.5 text-left lg:mx-0">
                {[
                  "Professores que são médicos-legistas de carreira",
                  "23 mil questões comentadas, com vídeo do professor resolvendo",
                  "Aulão pré-prova e o Dr. Bonet para a dúvida da madrugada",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-[10px] font-black text-gray-900">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-white/70">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col items-center gap-4 lg:items-start">
                <a
                  href="#oferta"
                  className="w-full max-w-sm rounded-2xl bg-[#ffcd07] px-8 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
                >
                  Quero garantir minha vaga
                </a>
                <p className="text-[13px] font-semibold text-white/45">
                  1º lote termina em <Contador compacto />
                </p>
              </div>
            </div>

            <HeroComposicao aprovados={totalAprovados} />
          </div>

          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 lg:mt-24">
            {[
              { n: `${totalAprovados}`, t: "aprovados do Clube" },
              { n: "23 mil", t: "questões comentadas" },
              { n: "100%", t: "professores legistas" },
              { n: `${ANOS_DE_ACESSO} anos`, t: "de editais inclusos" },
            ].map((i) => (
              <div key={i.t} className="bg-[#0b0b0d] px-4 py-5 text-center">
                <p className="text-2xl font-black text-[#ffcd07]">{i.n}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {i.t}
                </p>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      <Ticker texto="Black Forense · todos os editais autorizados · um preço só" />

      {/* ------------------------------------------- editais (claro) */}
      {/* FUNDO CLARO E EM CARROSSEL, e as duas coisas vieram do mesmo pedido.
          Em preto, a seção pesava como um painel de dados no meio de uma
          página de venda; clara, ela respira como no site do preparatório. E
          em carrossel os estados param de ser uma tabela: cada um ganha o seu
          instante, e a faixa andando diz, sem escrever, que a lista continua
          crescendo. */}
      <div className="bg-[#f8f9fb]">
        <Secao id="editais" className="py-16">
          <Titulo claro nota="o que está incluso hoje">
            Concursos autorizados ou com
            <br className="hidden sm:block" /> editais publicados
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600">
            São <strong className="font-bold text-gray-900">{inclusos.length} concursos</strong>{" "}
            de médico-legista de pé agora, e você entra em todos. A lista vem do nosso
            monitor, que varre as fontes oficiais de hora em hora — se um estado novo for
            autorizado depois da sua compra, o preparatório dele entra sozinho.
          </p>
        </Secao>

        <div className="pb-6">
          <CarrosselEditais estados={inclusos} />
        </div>

        <Secao className="pb-16 text-center">
          <p className="text-sm text-gray-500">
            + todo concurso de médico-legista autorizado nos próximos {ANOS_DE_ACESSO} anos
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
          >
            ver o mapa completo dos 27 estados
          </Link>
        </Secao>
      </div>


      {/* ----------------------------------------------- o que leva (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao className="py-16">
          <Titulo claro nota="o que você leva">
            Tudo isto, de uma vez
          </Titulo>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                t: "Preparatório completo de cada edital",
                d: "Pré-edital para chegar com a base pronta e pós-edital alinhado ao conteúdo programático de cada banca, para todos os concursos inclusos.",
              },
              {
                t: `Todo edital novo por ${ANOS_DE_ACESSO} anos`,
                d: "Autorizou, você entra. Sem pagar de novo, sem upgrade, sem letra miúda — é o coração desta oferta.",
              },
              {
                t: "Aulão pré-prova",
                d: "Na reta final de cada concurso, uma imersão ao vivo com os professores no que mais cai e no que costuma derrubar candidato.",
              },
              {
                t: "Almanaque Forense",
                d: "Mais de 23 mil questões das bancas que cobram o cargo, com comentário escrito e vídeo do professor resolvendo.",
              },
              {
                t: "Dr. Bonet, 24 horas",
                d: "A nossa IA treinada nas referências da área responde sua dúvida aí mesmo — inclusive às três da manhã, quando o professor está dormindo.",
              },
              {
                t: "Flashcards, mapas e mini-jogos",
                d: "Revisão ativa de verdade: baralhos por tema, mapas mentais ilustrados e jogos para os conceitos que todo mundo troca na prova.",
              },
              {
                t: "Nove eBooks do Clube",
                d: "Conteúdo adaptado pelos nossos professores a partir de França, Hygino e Delton Croce — escrito para o que a prova de perícia cobra.",
              },
              {
                t: "Grupo com os professores",
                d: "Dúvida respondida por quem é médico-legista de carreira, mais o acompanhamento da equipe do Clube do edital à posse.",
              },
            ].map((i) => (
              <div key={i.t} className="card-white flex gap-4 p-5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-xs font-black text-gray-900">
                  ✓
                </span>
                <div>
                  <p className="font-bold text-gray-900">{i.t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{i.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------------ plataforma (claro) */}
      <div className="bg-white">
        <Secao id="plataforma" className="py-16">
          <Titulo claro nota="a plataforma">
            Feita para este cargo, e só para ele
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Curso de carreira policial adaptado não serve: a prova de médico-legista cobra
            medicina legal em profundidade. Tudo aqui foi montado nesse recorte.
          </p>
          <div className="mt-12">
            <Plataforma />
          </div>
        </Secao>
      </div>

      {/* --------------------------------------------------- bonet (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao className="py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
                novidade da plataforma
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
                O Dr. Bonet não dorme
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-600">
                É a nossa inteligência artificial treinada nas referências que a prova cobra —
                França, Hygino, Delton Croce. Você pergunta em português, do jeito que a dúvida
                apareceu, e ela responde com a fonte ao lado.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Não substitui o professor: para discussão de caso e orientação de estudo, o
                grupo com os legistas do Clube continua aberto. O Dr. Bonet é para aquela
                dúvida da madrugada que, sem ele, você anotaria para perguntar depois — e
                esqueceria.
              </p>
            </div>
            <DrBonet />
          </div>
        </Secao>
      </div>

      {/* ---------------------------------------------- professores (claro) */}
      <div className="bg-white">
        <Secao id="professores" className="py-16">
          <Titulo claro nota="quem ensina">
            Professores que são médicos-legistas
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Não é professor de cursinho que estudou o edital. É quem faz perícia, assina laudo
            e já passou pelo concurso que você vai prestar.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PROFESSORES.map((p) => (
              <div key={p.nome} className="card-white overflow-hidden">
                <div className="relative aspect-[424/632] w-full bg-gray-100">
                  <Image
                    src={`/black/professores/${p.arquivo}`}
                    alt={p.nome}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#b38f00]">
                    {p.cargo}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm font-semibold text-gray-500">
            + os professores parceiros das disciplinas que completam o edital
          </p>
          <ProfessoresParceiros />
        </Secao>
      </div>

      {/* ----------------------------------------------- aprovados (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao id="aprovados" className="py-16">
          <Titulo claro nota="resultado">
            {totalAprovados} aprovados, em {estadosComAprovado} estados
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Desde 2024, alunos do Clube ficaram no topo de todos os concursos de
            médico-legista realizados no país.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mural.slice(0, 12).map((a) => (
              <div key={`${a.uf}-${a.nome}`} className="card-white p-5 text-center">
                <div className="flex justify-center">
                  <Avatar nome={a.nome} size={88} />
                </div>
                <p className="mt-3 text-sm font-bold leading-tight text-gray-900">{a.nome}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#b38f00]">
                  {a.onde}
                </p>
                {a.destaque && (
                  <p className="mt-1 text-[11px] text-gray-500">{a.destaque}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {Object.entries(APROVADOS)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 4)
              .map(([uf, a]) => (
                <div key={uf} className="rounded-2xl bg-gray-900 p-5 text-center">
                  <p className="text-3xl font-black text-[#ffcd07]">{a.total}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf}
                  </p>
                </div>
              ))}
          </div>
        </Secao>
      </div>

      {/* ---------------------------------------------- metodologia (claro) */}
      <div className="bg-white">
        <Secao className="py-16">
          <Titulo claro nota="como funciona">
            Quatro coisas, na ordem
          </Titulo>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Base antes do edital",
                d: "Medicina legal leva meses para assentar. Começa pelo conteúdo que não muda de banca para banca.",
              },
              {
                n: "02",
                t: "Recorte quando o edital sai",
                d: "Publicado o edital, o curso daquele concurso abre com o conteúdo programático e o estilo da banca.",
              },
              {
                n: "03",
                t: "Questão e revisão ativa",
                d: "Almanaque, flashcards e mini-jogos: você sai de ler sobre o assunto para responder sobre ele.",
              },
              {
                n: "04",
                t: "Reta final e prova",
                d: "Aulão pré-prova, simulados e o grupo aberto com os professores até o dia da aplicação.",
              },
            ].map((p) => (
              <div key={p.n} className="card-white p-6">
                <p className="font-mono text-sm font-black text-[#b38f00]">{p.n}</p>
                <p className="mt-3 text-lg font-black leading-tight text-gray-900">{p.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.d}</p>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      <Ticker texto="o preço sobe a cada lote · garantia de 7 dias" />

      {/* --------------------------------------------------- oferta (preto) */}
      <div className="bg-[#0b0b0d]">
        <Secao id="oferta" className="py-16">
          <Titulo nota="a oferta">Agora sim, o preço</Titulo>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-white/55">
            São três lotes até o fim da campanha. Quem entra antes paga menos — e leva
            exatamente o mesmo.
          </p>

          {/* A RECAPITULAÇÃO VEM ANTES DO NÚMERO, e é o que o site do
              preparatório faz no fim da página. A pessoa percorreu seções
              separadas — editais, plataforma, professores — e chega aqui sem
              ter somado nada. A lista junta tudo em meia tela, para o preço
              ser lido contra o conjunto, e não contra a última coisa que ela
              viu. */}
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-center text-sm font-black uppercase tracking-[0.15em] text-[#ffcd07]">
              tudo que entra
            </p>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                "Material pré-edital e pós-edital de todos os concursos autorizados",
                "Atualização gratuita quando o edital sai",
                "Grupo de alunos e professores",
                "Banco de questões exclusivo, com mais de 23 mil questões",
                "Vídeo do professor resolvendo as questões",
                "Nove eBooks de medicina legal",
                "Resumos ilustrados e mapas mentais",
                "Flashcards para revisão ativa",
                "Mini-jogos para fixar conceito",
                "Dr. Bonet, a nossa IA treinada nas referências da área",
                "Contato direto com o professor para tirar dúvida",
                "Aulão pré-prova e suporte pós-prova",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-[10px] font-black text-gray-900">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-white/75">{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-white/10 pt-5 text-center text-sm leading-relaxed text-white/50">
              E os professores são médicos-legistas de carreira — quem faz perícia, assina
              laudo e já passou pelo concurso que você vai prestar.
            </p>
          </div>

          {/* A CONTA VEM IMEDIATAMENTE ANTES DO PREÇO, e esse lugar é o ponto.
              Ela estava lá em cima, junto da lista de editais, e ali tinha o
              efeito contrário: entregava o valor antes de a página explicar o
              que está sendo comprado. Âncora funciona colada ao número que ela
              ancora — a pessoa lê quanto custaria separado e, na linha
              seguinte, quanto custa aqui. */}
          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="grid items-center gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.04] p-5 text-center sm:col-span-2">
                <p className="text-xs text-white/50">
                  {inclusos.length} preparatórios comprados separadamente
                </p>
                <p className="mt-1.5 text-2xl font-black text-white/40 line-through decoration-[#ff4d4d]/60 decoration-2">
                  {reais(inclusos.length * PRECO_POR_EDITAL)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#ffcd07]/40 bg-[#ffcd07]/10 p-5 text-center">
                <p className="text-xs font-semibold text-[#ffcd07]">na Black Forense</p>
                <p className="mt-1.5 text-2xl font-black text-white">
                  <PrecoAtual />
                </p>
              </div>
            </div>
            <p className="mt-5 text-center text-xs leading-relaxed text-white/45">
              O preparatório avulso de um único edital sai por {reais(PRECO_POR_EDITAL)}. Aqui
              você leva os {inclusos.length} que já estão de pé e todos os que ainda vão sair.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-xl">
            <CaixaDePreco editaisInclusos={inclusos.length} />
          </div>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-lg font-black text-white">Garantia incondicional de 7 dias</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Entre, veja tudo por dentro e decida. Se não for para você, devolvemos o valor
              integral — sem burocracia e sem pergunta constrangedora.
            </p>
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------------------- faq (claro) */}
      <div className="bg-white">
        <Secao className="py-16">
          <Titulo claro nota="dúvidas">
            O que costumam perguntar
          </Titulo>
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200">
            {[
              {
                p: "Quais editais exatamente estão inclusos?",
                r: `Todos os concursos de médico-legista em andamento hoje — os ${inclusos.length} listados acima, que vêm do nosso monitor — e todos os que forem autorizados nos próximos ${ANOS_DE_ACESSO} anos. Quando um estado novo entra, o preparatório dele aparece na sua área de aluno sem você fazer nada.`,
              },
              {
                p: "E se nenhum edital do meu estado sair nesse período?",
                r: "Você estuda pelos que estiverem abertos. A base de medicina legal é a mesma em todo o país, e o nosso conteúdo pré-edital existe exatamente para isso: quem chega preparado presta o concurso do estado vizinho, que é o que a maioria dos nossos aprovados fez.",
              },
              {
                p: "Já sou aluno do preparatório. Como fica?",
                r: "Fale com a equipe pelo WhatsApp antes de comprar: existe condição para quem já estuda com a gente, e ela não aparece no checkout.",
              },
              {
                p: "Por quanto tempo eu tenho acesso?",
                r: `Os editais que saírem nos próximos ${ANOS_DE_ACESSO} anos entram para você, e o acesso ao conteúdo de cada concurso acompanha o ciclo dele — do pré-edital à prova.`,
              },
              {
                p: "Funciona no celular?",
                r: "Funciona. A plataforma roda no navegador do computador e do celular, e as aulas podem ser assistidas também fora de casa.",
              },
              {
                p: "E se eu não gostar?",
                r: "Sete dias de garantia incondicional. Pediu reembolso dentro do prazo, devolvemos tudo.",
              },
            ].map((f) => (
              <details
                key={f.p}
                className="group bg-white px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-bold text-gray-900">
                  {f.p}
                  <span className="shrink-0 text-xl text-[#b38f00] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.r}</p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Ficou outra dúvida?{" "}
            <a
              href={WHATSAPP}
              className="font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
            >
              Fale com a equipe no WhatsApp
            </a>
          </p>
        </Secao>
      </div>

      {/* ------------------------------------------------------- fechamento */}
      <div className="bg-[#ffcd07]">
        <Secao className="py-16 text-center">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
            Seja o próximo primeiro colocado
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-800">
            {inclusos.length} concursos de pé agora, {ANOS_DE_ACESSO} anos de editais inclusos
            e os professores que mais aprovam médico-legista no Brasil.
          </p>
          <a
            href="#oferta"
            className="mt-8 inline-block rounded-2xl bg-gray-900 px-10 py-5 text-base font-black uppercase tracking-wide text-[#ffcd07] transition hover:bg-gray-800"
          >
            Garantir minha vaga
          </a>
        </Secao>
      </div>

      <footer className="bg-[#0b0b0d] pb-28 pt-10">
        <Secao>
          <div className="flex flex-col items-center gap-5 text-center">
            <Image
              src="/logo-fundo-escuro.png"
              alt="Clube Forense"
              width={162}
              height={28}
              className="h-7 w-auto opacity-70"
            />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/45">
              <Link href="/" className="hover:text-white">
                Mapa dos concursos
              </Link>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
              <a href={PLATAFORMA} className="hover:text-white">
                Plataforma
              </a>
              <a href={QUESTOES} className="hover:text-white">
                Questões
              </a>
              <a href={WHATSAPP} className="hover:text-white">
                WhatsApp
              </a>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-white/30">
              © {new Date().getFullYear()} Clube Forense · CNPJ 53.323.379/0001-37. Esta página
              não é afiliada ao Google ou ao Facebook.
            </p>
          </div>
        </Secao>
      </footer>

      <BarraFixa />
    </div>
  );
}
