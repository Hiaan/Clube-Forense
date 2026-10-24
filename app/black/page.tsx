// A página de vendas da Black Forense.
//
// A IDEIA QUE SUSTENTA A PÁGINA INTEIRA: a oferta não é "um curso com
// desconto", é "todos os concursos de uma vez". Por isso a seção mais
// importante não é a de preço — é a lista dos editais inclusos. Quem entra na
// lista é decisão do Clube (EDITAIS_DA_BLACK, em oferta.ts); a situação de
// cada um — banca, data de prova, etapa — vem AO VIVO do nosso monitor, e é
// isso que nenhum concorrente consegue copiar sem ter o monitor por trás.
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
// planos (a oferta é uma só) e qualquer captura de tela fingida da plataforma —
// a seção da plataforma usa capturas reais, e o painel pericial, que mostra
// números, vem marcado como exemplo ilustrativo.

import Image from "next/image";
import Link from "next/link";

import Avatar from "../components/Avatar";
import BarraFixa from "./BarraFixa";
import BioProfessor from "./BioProfessor";
import CarrosselEditais from "./CarrosselEditais";
import CaixaDePreco from "./CaixaDePreco";
import Contador from "./Contador";
import Depoimentos from "./Depoimentos";
import DrBonet from "./DrBonet";
import HeroComposicao from "./HeroComposicao";
import SecaoPlataforma from "./plataforma/SecaoPlataforma";
import PrecoAtual from "./PrecoAtual";
import Ticker from "./Ticker";
import {
  ANOS_DE_ACESSO,
  EDITAIS_DA_BLACK,
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
    cargo: "Médica legista em Pernambuco",
    texto:
      "Médica Legista do Estado de Pernambuco, professora de Medicina Legal e Ética Médica na Universidade Federal de Pernambuco (UFPE) e formada nessa mesma universidade. Possui residência médica em Oftalmologia pelo HCPE, além de Fellowships em Estrabismo e Neuroftalmologia pela Santa Casa de Misericórdia de Belo Horizonte. É mestre em Ciências da Saúde/Psicologia Clínica pela Universidade Católica de Pernambuco. Atua também como Médica Oftalmologista, com sólida experiência na interface entre prática clínica e Medicina Legal.",
  },
  {
    arquivo: "joao-paulo.png",
    nome: "Dr. João Paulo",
    cargo: "Médico legista, 4 aprovações",
    texto:
      "Médico Legista do Estado de Pernambuco e também do Ceará, com quatro aprovações em concursos para a área. Formado em Medicina pela Universidade Estadual de Santa Cruz (UESC), na Bahia, com Residência Médica em Patologia pelo IMIP. Atualmente, exerce os cargos de Médico Legista Oficial do Instituto de Medicina Legal em Recife, Médico Legista Patologista da Perícia Forense do Estado do Ceará (PEFOCE) e Médico Patologista do Laboratório Argos. Possui ampla experiência em Medicina Legal e Patologia Forense.",
  },
  {
    arquivo: "miguel.png",
    nome: "Dr. Miguel Souza",
    cargo: "Médico legista desde 2018",
    texto:
      "Médico Legista do Estado de Pernambuco desde 2018. Médico formado pela Universidade Federal de Pernambuco (UFPE), com especialização em Traumato-Ortopedia pelo Hospital das Clínicas da UFPE. Mestre em Perícias Forenses pela Universidade de Pernambuco. Possui sólida atuação na área da Medicina Legal.",
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

  // QUEM ENTRA É A OFERTA QUE DIZ; EM QUE PÉ ESTÁ, É O MONITOR. A lista vem
  // de EDITAIS_DA_BLACK (ver o porquê em oferta.ts — foi assim que São Paulo
  // apareceu aqui sem ter comissão). Do monitor vem só a linha de situação de
  // cada cartão, e só quando a etapa dele já é de concurso andando: um estado
  // que o robô ainda classifica abaixo disso não ganha uma linha que contradiz
  // o fato de ele estar sendo vendido.
  const inclusos = EDITAIS_DA_BLACK.map((e) => {
    const estado = relatorio.estados.find((x) => x.uf === e.uf) ?? null;
    return {
      ...e,
      estado: estado && ETAPAS_INCLUSAS.includes(estado.nivel) ? estado : null,
    };
  });

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
                A melhor oportunidade para garantir sua aprovação como{" "}
                <span className="text-[#ffcd07]">médico legista</span>.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
                Tenha acesso a todos os nossos preparatórios para os concursos
                que já foram autorizados. Material pré e pós-edital gravado e
                com a maior e melhor plataforma do mercado.
              </p>

              <ul className="mx-auto mt-7 flex max-w-xl flex-col gap-2.5 text-left lg:mx-0">
                {[
                  "Contato com professores médicos-legistas",
                  "+240 alunos aprovados",
                  "Plataforma com questões, aulas, ebooks, flashcards e muito mais",
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
            Você terá acesso ao preparatório
            <br className="hidden sm:block" /> para esses editais:
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600">
            Você pagará apenas{" "}
            <strong className="font-bold text-gray-900">um único valor</strong> e poderá
            ter acesso a uma preparação completa, independente do edital, com os
            professores que aprovaram todos os primeiros lugares nos últimos concursos.
          </p>
        </Secao>

        <div className="pb-6">
          <CarrosselEditais editais={inclusos} />
        </div>

        <Secao className="pb-16 text-center">
          <p className="text-sm text-gray-500">
            + todo concurso de médico-legista autorizado nos próximos {ANOS_DE_ACESSO} anos
          </p>
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
                d: "Na reta final de cada concurso, um aulão online com os professores, focando no que mais cai e no que costuma derrubar o candidato.",
              },
              {
                t: "Almanaque Forense",
                d: "Plataforma de questões completa: mais de 25 mil questões, com comentários do professor, vídeos explicativos, simulados personalizáveis e muito mais.",
              },
              {
                t: "Dr. Bonet, 24 horas",
                d: "Nossa IA treinada com as principais bibliografias de medicina legal. Responde sua dúvida aí mesmo, inclusive às 3 da manhã, quando o professor está dormindo.",
              },
              {
                t: "Flashcards, mapas e mini-jogos",
                d: "Revisão ativa de verdade: flashcards personalizáveis por tema, mapas mentais ilustrados e jogos para fixar os conceitos que todo mundo troca na prova.",
              },
              {
                t: "eBooks de todas as matérias",
                d: "Escritos pelos nossos professores a partir das principais bibliografias de cada matéria, já no recorte que a prova de médico-legista cobra — você estuda pelo que cai, não pelo livro inteiro.",
              },
              {
                t: "Grupo com professores de med. legal e monitor de direito",
                d: "Dúvida respondida por quem é médico-legista de carreira, e um monitor de direito para as matérias que completam o edital.",
              },
              {
                t: "Cronograma interativo e edital verticalizado",
                d: "Encaixe o estudo e a revisão de todo o edital na sua rotina, de forma automatizada.",
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
      {/* A seção que veio pronta no pacote de 23/10 — título, abas, telas e
          réplicas clicáveis. Ver app/black/plataforma/. */}
      <SecaoPlataforma />

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
                  <BioProfessor texto={p.texto} />
                </div>
              </div>
            ))}
          </div>
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

      {/* --------------------------------------------- depoimentos (claro) */}
      <div className="bg-white">
        <Secao id="depoimentos" className="py-16">
          <Titulo claro nota="quem já passou">
            Veja o que dizem os nossos alunos
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Nome, rosto e concurso. Clique para assistir ao depoimento de quem
            estudou com o Clube e hoje é médico-legista.
          </p>
          <Depoimentos />
        </Secao>
      </div>

      {/* ---------------------------------------------- metodologia (claro) */}
      <div className="bg-[#f8f9fb]">
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
                "Material pré-edital e atualização pós-edital de todos os concursos autorizados",
                "Suporte exclusivo para acompanhamento do aluno",
                "Resolução de questões comentadas em vídeo",
                "Mapas mentais ilustrados dos assuntos de medicina legal e direito",
                "Gamificação através de jogos para fixar o conceito",
                "Acesso ao WhatsApp pessoal dos professores para acompanhamento e dúvidas",
                "Plataforma de questões completa, com mais de 25 mil questões",
                "eBooks e apostilas em PDF de todas as matérias",
                "Flashcards feitos por médicos legistas, com sistema de revisão espaçada",
                "Dr. Bonet, nossa IA treinada com as principais bibliografias de medicina legal, respondendo 24 horas",
                "Aulão pré-prova com os conceitos que mais caem e as pegadinhas que a banca costuma cobrar",
                "Suporte após a prova, com elaboração de recursos e acompanhamento durante as fases",
                "Grupo de alunos e professores",
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
                r: `Os ${inclusos.length} concursos listados acima, e todos os que forem autorizados nos próximos ${ANOS_DE_ACESSO} anos. Quando um estado novo entra, o preparatório dele aparece na sua área de aluno sem você fazer nada.`,
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
