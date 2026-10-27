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

import BarraFixa from "./BarraFixa";
import BioProfessor from "./BioProfessor";
import CarrosselEditais from "./CarrosselEditais";
import CaixaDePreco, { type OfertaAluno } from "./CaixaDePreco";
import AvisoAluno from "../alunoclube/AvisoAluno";
import SairAluno from "../alunoclube/SairAluno";
import Contador from "./Contador";
import FundoCapas from "./FundoCapas";
import Depoimentos from "./Depoimentos";
import DrBonet from "./DrBonet";
import MuralAprovados from "./MuralAprovados";
import SecaoPlataforma from "./plataforma/SecaoPlataforma";
import { PROFESSORES } from "./professores";
import Ticker from "./Ticker";
import { EDITAIS_DA_BLACK, PLATAFORMA, QUESTOES, WHATSAPP } from "./oferta";
import { APROVADOS } from "../monitor/lib/aprovados";
import { coletar } from "../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import { type Nivel } from "../monitor/lib/tipos";

/** As etapas que valem como "concurso em andamento" — o que a oferta cobre. */
const ETAPAS_INCLUSAS: Nivel[] = ["edital", "banca", "comissao", "autorizado"];

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

/**
 * A página da Black. `modo="aluno"` é a versão de /alunoclube: mesma página,
 * com o aviso de exclusividade, sem os lotes e com a caixa de preço que
 * confere o CPF do aluno no lugar do checkout aberto.
 */
export default async function PaginaBlack({
  modo = "publico",
  ofertaAluno,
}: {
  modo?: "publico" | "aluno";
  /** A oferta montada do aluno validado (só no modo "aluno"). */
  ofertaAluno?: OfertaAluno;
}) {
  const aluno = modo === "aluno";
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

  const totalAprovados = Object.values(APROVADOS).reduce(
    (s, a) => s + a.total,
    0,
  );
  const concursosComAprovado = Object.keys(APROVADOS).length;

  // Cada aprovado divulgado, com o estado dele — para o mural de rostos.
  //
  // A COLOCAÇÃO DE CADA UM. Quando o estado lista uma colocação por nome
  // (Pernambuco: 1º, 3º e 5º para os três nomes, na ordem), cada pessoa leva a
  // sua. Quando é um destaque só, ele vale para o grupo inteiro (PF: "3 alunos
  // no Top 5"). Fora disso — Santa Catarina, com três colocações para onze
  // nomes — não há como saber quem foi o quê, e o cartão mostra só o estado:
  // repetir "1º Lugar" em todos seria dizer algo que não é verdade.
  const mural = Object.entries(APROVADOS).flatMap(([uf, a]) =>
    a.nomes.map((nome, i) => ({
      nome,
      uf,
      onde: a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf,
      destaque:
        a.destaques.length === a.nomes.length
          ? a.destaques[i]
          : a.destaques.length === 1
            ? a.destaques[0]
            : null,
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
      <Ticker
        texto={
          aluno
            ? "Exclusivo para alunos do Clube · Black Vitalícia"
            : "Black Forense · todos os editais autorizados · um preço só"
        }
      />

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
        <FundoCapas veu="capa" />
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
                {aluno ? "Exclusivo para alunos" : "Black Forense 2026"}
              </span>

              {/* Duas linhas, como o Clube definiu: a oferta e o "pela 1ª vez".
                  No computador cada linha fica inteira (nowrap); no celular a
                  primeira pode quebrar, mas "1ª vez" nunca se separa. */}
              <h1 className="mt-6 text-[26px] font-black leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-[31px]">
                <span className="block lg:whitespace-nowrap">
                  Black <span className="text-[#ffcd07]">Vitalícia</span> do
                  Clube Forense:
                </span>
                <span className="block lg:whitespace-nowrap">
                  Oferta liberada pela{" "}
                  <span className="whitespace-nowrap text-[#ffcd07]">
                    1ª vez
                  </span>
                  .
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
                Acesso vitalício a toda a nossa plataforma e ao material pré e
                pós-edital de todos os concursos autorizados até agora.
              </p>

              <ul className="mx-auto mt-7 flex max-w-xl flex-col gap-2.5 text-left lg:mx-0">
                {[
                  "Professores médicos-legistas",
                  "+240 alunos aprovados",
                  "Plataforma com questões, aulas, ebooks, flashcards e muito mais",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-[10px] font-black text-gray-900">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-white/70">
                      {t}
                    </span>
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
                  {aluno ? (
                    <SairAluno rotulo={ofertaAluno?.rotulo} />
                  ) : (
                    <>
                      1º lote termina em <Contador compacto />
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Os três professores com a plataforma atrás. A base da foto já
                vem esmaecida no próprio arquivo, para sumir no preto da capa
                em vez de terminar num corte reto. */}
            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[600px]">
              <Image
                src="/black/hero-professores.webp"
                alt="Dr. João Paulo, Dra. Erika Anjos e Dr. Miguel Souza com a plataforma do Clube Forense"
                width={900}
                height={773}
                priority
                sizes="(max-width: 1024px) 92vw, 600px"
                className="h-auto w-full"
              />
              <div className="absolute right-2 top-[12%] rounded-2xl border border-[#ffcd07]/40 bg-[#0b0b0d]/90 px-4 py-2.5 text-center backdrop-blur">
                <p className="text-xl font-black leading-none text-[#ffcd07]">
                  +{totalAprovados}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                  aprovados
                </p>
              </div>
            </div>
          </div>
        </Secao>
      </div>

      <Ticker
        texto={
          aluno
            ? "Exclusivo para alunos do Clube · Black Vitalícia"
            : "Black Forense · todos os editais autorizados · um preço só"
        }
      />

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
            <strong className="font-bold text-gray-900">um único valor</strong>{" "}
            e terá acesso vitalício ao material pré e pós-edital de todos os
            concursos de médico legista autorizados até agora.
          </p>
        </Secao>

        <div className="pb-16">
          <CarrosselEditais editais={inclusos} />
          {/* A lista por escrito, miúda, embaixo da faixa: a faixa anda e
              nunca mostra todos de uma vez; aqui a pessoa confere de uma
              olhada quais concursos estão na oferta. */}
          <p className="mx-auto mt-8 max-w-3xl px-4 text-center text-xs leading-relaxed text-gray-500">
            <strong className="font-semibold text-gray-700">
              Editais contemplados ({inclusos.length}):
            </strong>{" "}
            {inclusos
              .map((e) => `${e.sigla} (${ESTADO_POR_UF[e.uf]?.nome ?? e.uf})`)
              .join(" · ")}
            .
          </p>
        </div>
      </div>

      {/* ----------------------------------------------- o que leva (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao className="py-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            o que você leva
          </p>
          {/* As caixas de cada recurso da plataforma, antes dos cartões: a
              imagem mostra o tamanho do pacote de uma vez, e os cartões logo
              abaixo explicam cada parte. */}
          <Image
            src="/black/recursos-caixas.webp"
            alt="Aulas, questões, cronograma, mapas mentais, eBooks, flashcards, mini-jogos, edital verticalizado e painel pericial"
            width={1400}
            height={820}
            sizes="(max-width: 768px) 85vw, 460px"
            className="flutuar mx-auto mt-6 h-auto w-[85%] max-w-[460px] drop-shadow-[0_24px_24px_rgba(0,0,0,0.18)]"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                t: "Preparatório completo de cada edital",
                d: "Pré-edital para chegar com a base pronta e pós-edital alinhado ao conteúdo programático de cada banca, para todos os concursos inclusos.",
              },
              {
                t: "Todos os editais autorizados, num acesso só",
                d: `Os ${inclusos.length} concursos de médico legista autorizados até agora, cada um com o seu preparatório completo — sem pagar um por um. É o coração desta oferta.`,
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
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    {i.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------------ plataforma (claro) */}
      {/* A seção que veio pronta no pacote de 23/10 — título, abas, telas e
          réplicas clicáveis. Ver app/black/plataforma/. */}
      {/* Fora da página dos alunos: quem já é aluno conhece a plataforma. */}
      {!aluno && <SecaoPlataforma />}

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
                É a nossa inteligência artificial treinada nas referências que a
                prova cobra — França, Hygino, Delton Croce. Você pergunta em
                português, do jeito que a dúvida apareceu, e ela responde com a
                fonte ao lado.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Não substitui o professor: para orientação no seu estudo, o
                grupo com os legistas do Clube continua aberto. O Dr. Bonet é
                para aquela dúvida da madrugada que, sem ele, você anotaria para
                perguntar depois e — provavelmente — esqueceria.
              </p>
            </div>
            <DrBonet />
          </div>

          {/* O BÔNUS DO GRUPO fica colado no Dr. Bonet de propósito: a seção
              acabou de dizer que a IA não substitui o professor, e aqui está o
              professor — 2 anos de grupo para tirar dúvida com gente. */}
          <div className="mt-12 flex flex-col items-center gap-5 rounded-3xl bg-gray-900 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#ffcd07] text-gray-900">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd07]">
                bônus exclusivo
              </p>
              <p className="mt-2 text-xl font-black leading-snug text-white sm:text-2xl">
                2 anos de acesso ao nosso grupo exclusivo
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
                Além do acesso vitalício, você terá acesso bônus ao grupo com os
                professores e os alunos do Clube Forense durante 2 anos, para
                tirar suas dúvidas.
              </p>
            </div>
          </div>
        </Secao>
      </div>

      {/* ---------------------------------------------- professores (claro) */}
      {/* Fora da página dos alunos: quem já é aluno conhece. */}
      {!aluno && (
        <div className="bg-white">
          <Secao id="professores" className="py-16">
            <Titulo claro nota="quem ensina">
              Professores que são médicos-legistas
            </Titulo>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
              Conheça um pouco mais dos professores e criadores do Clube Forense
              que vivem e respiram medicina legal todos os dias, seja ensinando
              ou trabalhando.
            </p>
            {/* NO CELULAR, CARROSSEL. Um embaixo do outro, cada cartão ocupava a
                tela inteira e os três professores davam três telas de rolagem.
                Lado a lado, com o próximo cartão aparecendo na borda, a pessoa
                arrasta com o dedo e vê que há mais. Do tablet para cima, volta a
                ser a grade de três. */}
            <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {PROFESSORES.map((p) => (
                <div
                  key={p.nome}
                  className="card-white w-[52%] shrink-0 snap-center overflow-hidden sm:w-auto"
                >
                  <div className="relative aspect-[424/632] w-full bg-gray-100">
                    <Image
                      src={`/black/professores/${p.arquivo}`}
                      alt={p.nome}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3.5 sm:p-5">
                    <p className="text-[10px] font-bold sm:text-[11px] uppercase tracking-wider text-[#b38f00]">
                      {p.cargo}
                    </p>
                    <BioProfessor texto={p.texto} />
                  </div>
                </div>
              ))}
            </div>
          </Secao>
        </div>
      )}

      {/* ----------------------------------------------- aprovados (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao id="aprovados" className="py-16">
          <Titulo claro nota="resultado">
            {totalAprovados} aprovados, em {concursosComAprovado} concursos
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Desde 2024, alunos do Clube ficaram no topo de todos os concursos de
            médico-legista realizados no país.
          </p>

          <MuralAprovados aprovados={mural} />

          {/* O placar de todos os concursos, não só dos quatro maiores. No
              celular, carrossel de arrastar, como o mural acima. */}
          <div className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {Object.entries(APROVADOS)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([uf, a]) => (
                <div
                  key={uf}
                  className="w-[38%] shrink-0 snap-start rounded-2xl bg-gray-900 p-5 text-center sm:w-auto"
                >
                  <p className="text-3xl font-black text-[#ffcd07]">
                    {a.total}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf}
                  </p>
                </div>
              ))}
          </div>
        </Secao>
      </div>

      {/* --------------------------------------------- depoimentos (claro) */}
      {/* Fora da página dos alunos: quem já é aluno conhece. */}
      {!aluno && (
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
      )}

      <Ticker
        texto={
          aluno
            ? "oferta exclusiva para alunos · garantia de 7 dias"
            : "o preço sobe a cada lote · garantia de 7 dias"
        }
      />

      {/* --------------------------------------------------- oferta (preto) */}
      {/* O PALCO DA OFERTA, no modelo do site de referência (Código Viral): as
          capas de cada concurso correndo ao fundo, o aviso de que a oferta
          acaba com o relógio do lote, e o card com o preço entrando em cena.
          A lista completa do que entra vem logo depois do card, para quem
          quer conferir item por item antes de clicar. */}
      <div className="relative overflow-hidden bg-[#0b0b0d]">
        <div className="relative">
          <FundoCapas />
          <Secao id="oferta" className="relative pb-16 pt-16">
            <div className="pt-16 text-center sm:pt-24">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ffcd07]">
                a oferta
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
                Essa oferta vai acabar!
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-white/60">
                É a{" "}
                <strong className="font-black text-white">PRIMEIRA VEZ</strong>{" "}
                que liberamos uma oferta vitalícia e pode ser a última, garanta
                a sua vaga.
              </p>
              <div className="mt-6 flex justify-center">
                {!aluno && <Contador />}
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              <CaixaDePreco
                editaisInclusos={inclusos.length}
                aluno={aluno ? ofertaAluno : undefined}
              />
              {aluno && (
                <div className="mt-6">
                  <AvisoAluno />
                </div>
              )}
            </div>
          </Secao>
        </div>

        <Secao className="relative pb-16">
          {/* A RECAPITULAÇÃO, item por item. O card resume em ícones; aqui fica
              a lista completa para quem quer conferir tudo antes de comprar. */}
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-center text-sm font-black uppercase tracking-[0.15em] text-[#ffcd07]">
              tudo que está incluso
            </p>
            {/* CADA ITEM NUM LADRILHO. Soltos, itens de uma, duas e três linhas
                lado a lado deixavam as duas colunas desencontradas, com o
                visto de cada lado em alturas diferentes — parecia torto. Em
                ladrilhos, a grade estica os dois da mesma linha para a mesma
                altura e o texto fica centrado neles. */}
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                "Material pré-edital e atualização pós-edital de todos os concursos autorizados",
                "Suporte exclusivo para acompanhamento do aluno",
                "Resolução de questões comentadas em vídeo",
                "Mapas mentais ilustrados dos assuntos de medicina legal e direito",
                "Gamificação através de jogos para fixar o conceito",
                "Acesso exclusivo, por 2 anos, ao nosso grupo de alunos, professores e monitor de direito, para tirar suas dúvidas e discutir questões e estudos de caso",
                "Plataforma de questões completa, com mais de 25 mil questões",
                "Todas as provas anteriores para médico-legista disponíveis na plataforma como simulado",
                "eBooks e apostilas em PDF das principais matérias",
                "Flashcards feitos por médicos legistas, com sistema de revisão espaçada",
                "Dr. Bonet, nossa IA treinada com as principais bibliografias de medicina legal, respondendo 24 horas",
                "Aulão pré-prova online de Medicina Legal na semana da prova, com os conceitos que mais caem e as pegadinhas que a banca costuma cobrar",
                "Suporte após a prova, com a orientação na elaboração de recursos e direcionamento durante as fases",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-[10px] font-black text-gray-900">
                    ✓
                  </span>
                  <span className="text-sm leading-snug text-white/80">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-white/10 pt-5 text-center text-sm leading-relaxed text-white/50">
              E os professores são médicos-legistas de carreira — quem faz
              perícia, assina laudo e já passou pelo concurso que você vai
              prestar.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <Image
              src="/black/selo-garantia.png"
              alt="Selo de garantia de 7 dias"
              width={214}
              height={214}
              className="h-16 w-16 shrink-0 opacity-90 sm:h-20 sm:w-20"
            />
            <div>
              <p className="text-lg font-black text-white">
                Garantia incondicional de 7 dias
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Entre, veja tudo por dentro e decida. Se não for para você,
                devolvemos o valor integral — sem burocracia e sem pergunta
                constrangedora.
              </p>
            </div>
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
                r: `Os ${inclusos.length} concursos listados acima: todos os concursos de médico legista autorizados até agora. O preparatório de cada um aparece na sua área de aluno, sem você precisar comprar um por um.`,
              },
              {
                p: "E se o concurso do meu estado não estiver na lista?",
                r: "Você estuda pelos que estão na lista. A base de medicina legal é a mesma em todo o país, e o nosso conteúdo pré-edital existe exatamente para isso: quem chega preparado presta o concurso do estado vizinho, que é o que a maioria dos nossos aprovados fez.",
              },
              {
                p: "Já sou aluno do preparatório. Como fica?",
                r: "Fale com a equipe pelo WhatsApp antes de comprar: existe condição para quem já estuda com a gente, e ela não aparece no checkout.",
              },
              {
                p: "Por quanto tempo eu tenho acesso?",
                r: "O acesso é vitalício: o material pré e pós-edital de cada concurso incluso fica com você, do pré-edital ao edital.",
              },
              {
                p: "Funciona no celular?",
                r: "Funciona. A plataforma roda no navegador do computador e do celular, e as aulas podem ser assistidas também fora de casa.",
              },
              {
                p: "E se eu não gostar?",
                r: "Sete dias de garantia incondicional. Pediu reembolso dentro do prazo, devolvemos tudo.",
              },
            ]
              .filter((f) => !(aluno && f.p.startsWith("Já sou aluno")))
              .map((f) => (
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
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {f.r}
                  </p>
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
            {inclusos.length} concursos autorizados até agora, e você terá
            acesso vitalício ao conteúdo pré e pós-edital de todos eles.
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
              © {new Date().getFullYear()} Clube Forense · CNPJ
              53.323.379/0001-37. Esta página não é afiliada ao Google ou ao
              Facebook.
            </p>
          </div>
        </Secao>
      </footer>

      <BarraFixa aluno={aluno} />
    </div>
  );
}
