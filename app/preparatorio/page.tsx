// A página de vendas do preparatório avulso (Aprova Legista).
//
// É a página que estava no Wix, refeita aqui com o mesmo conteúdo e na mesma
// ordem — capa, concursos, professores, aprovados, para quem é, plataforma,
// depoimentos, oferta, carreira — e com as peças que o site já tem: a faixa
// de editais com a situação ao vivo do monitor, a seção da plataforma com as
// telas de verdade e os depoimentos em vídeo.
//
// DUAS VERSÕES, UMA PÁGINA. O preço vem de `versaoDaOferta()` (oferta.ts): até
// segunda vale o cheio, a partir de terça 27/10 a promoção de Black, com o
// cheio riscado. Nada muda de lugar entre as duas — só a caixa de preço, a
// faixa da campanha e a etiqueta da capa —, para a página não precisar ser
// conferida duas vezes.

import Image from "next/image";
import Link from "next/link";

import Avatar from "../components/Avatar";
import BioProfessor from "../black/BioProfessor";
import CarrosselEditais from "../black/CarrosselEditais";
import Depoimentos from "../black/Depoimentos";
import HeroComposicao from "../black/HeroComposicao";
import SecaoPlataforma from "../black/plataforma/SecaoPlataforma";
import Ticker from "../black/Ticker";
import {
  EDITAIS_DA_BLACK,
  PLATAFORMA,
  QUESTOES,
  WHATSAPP,
  reais,
  reaisComCentavos,
} from "../black/oferta";
import { PROFESSORES } from "../black/professores";
import { APROVADOS } from "../monitor/lib/aprovados";
import { coletar } from "../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import { type Nivel } from "../monitor/lib/tipos";
import EventosDeVenda from "../components/EventosDeVenda";
import BarraCompra from "./BarraCompra";
import {
  CHECKOUT,
  PARCELA,
  PARCELAS,
  PRECO_BLACK,
  PRECO_CHEIO,
  versaoDaOferta,
} from "./oferta";

// Dinâmica por dois motivos: a versão do preço depende do dia, e a situação
// dos concursos vem da coleta do monitor.
export const dynamic = "force-dynamic";

/** As etapas que valem como "concurso em andamento". */
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

function Visto({ escuro = false }: { escuro?: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
        escuro ? "bg-gray-900 text-[#ffcd07]" : "bg-[#ffcd07] text-gray-900"
      }`}
    >
      ✓
    </span>
  );
}

/** O botão que leva à oferta — o mesmo em toda a página. */
function BotaoOferta({ texto = "Garanta a sua vaga" }: { texto?: string }) {
  return (
    <a
      href="#oferta"
      className="inline-block w-full max-w-sm rounded-2xl bg-[#ffcd07] px-8 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
    >
      {texto}
    </a>
  );
}

export default async function PreparatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const versao = versaoDaOferta(
    new Date(),
    typeof q.versao === "string" ? q.versao : undefined,
  );
  const black = versao === "black";
  const preco = black ? PRECO_BLACK : PRECO_CHEIO;
  const parcela = PARCELA[versao];
  const campanha = `Black Forense · preparatório de ${reais(PRECO_CHEIO)} por ${reais(PRECO_BLACK)}`;

  const relatorio = await coletar();
  const concursos = EDITAIS_DA_BLACK.map((e) => {
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
      {black && <Ticker texto={campanha} />}

      {/* ----------------------------------------------------------- capa */}
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
                {black
                  ? "Black Forense · preço promocional"
                  : "Preparatório Aprova Legista"}
              </span>

              <h1 className="mt-6 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Tudo o que você precisa saber para ser aprovado em{" "}
                <span className="text-[#ffcd07]">
                  qualquer concurso para médico legista
                </span>{" "}
                do Brasil.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
                Estude com professores que já são médicos legistas e impulsione
                seus estudos com o nosso preparatório.
              </p>

              <ul className="mx-auto mt-7 grid max-w-xl gap-2.5 text-left sm:grid-cols-2 lg:mx-0">
                {[
                  "Aulas gravadas de todos os principais assuntos",
                  "Atualização gratuita de todo o curso pós-edital",
                  "eBooks das matérias",
                  "Mapas mentais exclusivos (resumos ilustrados)",
                  "Banco de questões de concursos anteriores",
                  "Suporte dedicado ao aluno",
                  "Grupo com professores e alunos para tirar dúvidas",
                  "…e muito mais!",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5">
                      <Visto />
                    </span>
                    <span className="text-sm leading-relaxed text-white/70">
                      {t}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col items-center gap-3 lg:items-start">
                <BotaoOferta />
                {black && (
                  <p className="text-sm font-semibold text-white/60">
                    De{" "}
                    <span className="line-through">{reais(PRECO_CHEIO)}</span>{" "}
                    por{" "}
                    <span className="font-black text-[#ffcd07]">
                      {reais(PRECO_BLACK)}
                    </span>{" "}
                    na Black
                  </p>
                )}
              </div>
            </div>

            <HeroComposicao aprovados={totalAprovados} />
          </div>
        </Secao>
      </div>

      {black && <Ticker texto={campanha} />}

      {/* ---------------------------------------------- concursos (claro) */}
      <div className="bg-[#f8f9fb]">
        <Secao id="concursos" className="py-16">
          <Titulo claro nota="aproveite o ano dos concursos">
            Esta é uma oportunidade de ouro
            <br className="hidden sm:block" /> para garantir sua aprovação
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600">
            Concursos para as carreiras médicas na polícia autorizados ou com
            edital publicado — com a situação de cada um atualizada pelo nosso{" "}
            <Link
              href="/"
              className="font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
            >
              mapa dos concursos
            </Link>
            .
          </p>
        </Secao>

        <div className="pb-6">
          <CarrosselEditais editais={concursos} />
        </div>

        <Secao className="pb-16 text-center">
          <BotaoOferta texto="Inscreva-se agora" />
        </Secao>
      </div>

      {/* ---------------------------------------------- professores (claro) */}
      <div className="bg-white">
        <Secao id="professores" className="py-16">
          <Titulo claro nota="conheça os criadores do Clube Forense">
            Seus professores de Medicina Legal
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Médicos legistas que vão te acompanhar durante todo o preparatório.
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
          <Titulo claro nota="por que escolher o Clube Forense?">
            Desde 2024, nos primeiros lugares de todos os concursos para médico
            legista
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Mais de {Math.floor(totalAprovados / 10) * 10} aprovações nos
            últimos concursos, com alunos no topo de todos eles. Não importa o
            número de vagas: aqui você estará no topo.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mural.slice(0, 8).map((a) => (
              <div
                key={`${a.uf}-${a.nome}`}
                className="card-white p-5 text-center"
              >
                <div className="flex justify-center">
                  <Avatar nome={a.nome} size={80} />
                </div>
                <p className="mt-3 text-sm font-bold leading-tight text-gray-900">
                  {a.nome}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#b38f00]">
                  {a.onde}
                </p>
                {a.destaque && (
                  <p className="mt-1 text-[11px] text-gray-500">{a.destaque}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="mb-5 text-xl font-black text-gray-900">
              Seja o próximo primeiro colocado!
            </p>
            <BotaoOferta />
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------- pré-edital (preto) */}
      <div className="bg-[#0b0b0d]">
        <Secao className="py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Não deixe para estudar de última hora e{" "}
              <span className="text-[#ffcd07]">
                saia na frente da concorrência
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65">
              Mesmo sem a publicação do edital, você pode estudar os principais
              assuntos que caem nos concursos, com base no conteúdo dos editais
              anteriores — para não ser pego de surpresa e estar preparado para
              qualquer prova.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              Você terá acesso também a materiais de reforço para revisar e
              praticar tudo o que foi aprendido, com os nossos bônus exclusivos.
            </p>
            <div className="mt-8">
              <BotaoOferta />
            </div>
          </div>
        </Secao>
      </div>

      {/* --------------------------------------------- para quem é (claro) */}
      <div className="bg-white">
        <Secao className="py-16">
          <Titulo claro nota="para quem é o preparatório Aprova Legista?">
            Para médicos e estudantes de medicina que…
          </Titulo>
          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {[
              "Desejam estabilidade, altos salários e plano de carreira",
              "Desejam estudar com professores que já são médicos legistas, com uma metodologia validada",
              "Querem otimizar o tempo com um estudo direcionado a tudo o que o edital contempla",
              "Desejam os benefícios exclusivos de um servidor público e da carreira policial",
              "Querem estar preparados para qualquer concurso para médico legista que for publicado",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f8f9fb] px-5 py-4"
              >
                <Visto escuro />
                <span className="text-sm font-semibold leading-snug text-gray-800">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      {/* ----------------------------------------------- plataforma (claro) */}
      <div className="border-t border-gray-100">
        <SecaoPlataforma />
      </div>

      <div className="bg-[#f8f9fb]">
        <Secao className="py-16">
          <Titulo claro nota="a preparação mais completa">
            Tudo o que você precisa para ser aprovado está aqui
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Acesso a toda a nossa plataforma para estudar quando e onde quiser.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                t: "Almanaque Forense",
                d: "Nosso banco com mais de 25 mil questões de várias bancas, além de simulados, para você se preparar para a sua prova.",
              },
              {
                t: "Videoaulas em sequência lógica",
                d: "Pare de pular de vídeo em vídeo no YouTube ou em outros cursos: gravamos todo o edital e o pré-edital para você assistir em um só lugar.",
              },
              {
                t: "Resumos e mapas mentais",
                d: "Revise de maneira rápida os principais assuntos da prova com resumos e mapas mentais ilustrados.",
              },
              {
                t: "Grupo exclusivo no WhatsApp",
                d: "Tire suas dúvidas com os professores legistas e o monitor de direito, além de muito conteúdo e novidades sobre os concursos.",
              },
            ].map((c) => (
              <div key={c.t} className="card-white p-6">
                <p className="text-lg font-black text-gray-900">{c.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {c.d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-gray-900 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcd07]">
              bônus
            </p>
            <p className="mt-2 text-xl font-black text-white">
              Tudo de medicina legal condensado em 9 eBooks completos
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Para estudar de maneira objetiva e completa. Todo o conteúdo foi
              criado e adaptado pelos nossos professores aprovados, com base nas
              principais literaturas, como França, Hygino e Croce.
            </p>
          </div>
        </Secao>
      </div>

      {/* --------------------------------------------- depoimentos (claro) */}
      <div className="bg-white">
        <Secao id="depoimentos" className="py-16">
          <Titulo claro nota="seja o próximo aprovado">
            Veja o que dizem os nossos alunos
          </Titulo>
          <Depoimentos />
        </Secao>
      </div>

      {black && <Ticker texto={campanha} />}

      {/* --------------------------------------------------- oferta (preto) */}
      <div className="bg-[#0b0b0d]">
        <Secao id="oferta" className="py-16">
          <Titulo nota="Aprova Legista · preparatório">
            {black
              ? "Preço de Black, por tempo limitado"
              : "Garanta a sua vaga"}
          </Titulo>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-white/55">
            Escolha seu edital só quando ele sair e, até lá, estude com:
          </p>

          <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-3xl border border-[#ffcd07]/30 bg-white/[0.03]">
            <ul className="grid gap-2.5 p-6 sm:p-8">
              {[
                "Acesso ao nosso material pré-edital",
                "Atualização gratuita pós-edital do concurso da sua escolha",
                "Acesso ao grupo de alunos e professores (médicos legistas)",
                "Banco de questões exclusivo, com mais de 25 mil questões",
                "9 eBooks de Medicina Legal com tudo o que você precisa saber para a prova",
                "Suporte pós-prova",
                "Bônus: resumos ilustrados (mapas mentais) de Medicina Legal",
                "Garantia incondicional de 7 dias",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                >
                  <Visto />
                  <span className="text-sm leading-snug text-white/80">
                    {t}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
              {black ? (
                <>
                  <span className="inline-block rounded-full bg-[#ffcd07] px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-gray-900">
                    Promoção de Black
                  </span>
                  <p className="mt-4 text-base font-semibold text-white/45">
                    de{" "}
                    <span className="line-through decoration-[#ff4d4d]/70 decoration-2">
                      {reais(PRECO_CHEIO)}
                    </span>{" "}
                    por
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/45">
                  oferta limitada
                </p>
              )}
              <p className="mt-2 text-sm text-white/60">{PARCELAS}x de</p>
              <p className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                {reaisComCentavos(parcela)}
              </p>
              <p className="mt-2 text-base font-semibold text-white/70">
                ou{" "}
                <span className="font-black text-[#ffcd07]">
                  {reais(preco)}
                </span>{" "}
                à vista
              </p>
              {black && (
                <p className="mt-2 text-sm font-bold text-[#7ee2a0]">
                  Você economiza {reais(PRECO_CHEIO - PRECO_BLACK)}
                </p>
              )}
              <a
                href={CHECKOUT[versao]}
                data-valor={preco}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 block rounded-2xl bg-[#ffcd07] px-8 py-5 text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
              >
                Conquiste sua aprovação
              </a>
              <p className="mt-4 text-xs text-white/40">
                Pagamento seguro pela Eduzz · garantia incondicional de 7 dias
              </p>
            </div>
          </div>

          <div className="mx-auto mt-6 grid max-w-xl gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-[#ffcd07] text-center text-[10px] font-black uppercase leading-tight text-[#ffcd07]">
                7<br />
                dias
              </span>
              <div>
                <p className="text-lg font-black text-white">
                  Garantia incondicional de 7 dias
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/55">
                  Compre sem medo. Se por algum motivo você não gostar,
                  devolvemos todo o seu dinheiro.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#ffcd07]/25 bg-[#ffcd07]/[0.06] p-6">
              <p className="text-sm font-black uppercase tracking-wide text-[#ffcd07]">
                O edital do seu concurso abriu depois da compra?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Além de todo o conteúdo do preparatório, você ainda poderá
                adquirir a nossa mentoria semanal e ao vivo, com professores
                legistas, com desconto no valor integral do preparatório.
              </p>
            </div>
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------------- carreira (claro) */}
      <div className="bg-white">
        <Secao className="py-16">
          <Titulo claro nota="a carreira">
            Uma das carreiras de maior prestígio e valorização — e ainda pouco
            conhecida
          </Titulo>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Você atuará na investigação de crimes, como um dos principais
            responsáveis pelo processo. A carreira médica policial traz
            autoridade e diversos benefícios:
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "13º salário",
              "Férias remuneradas",
              "Aposentadoria especial",
              "Porte de arma",
              "Progressão de carreira",
              "Parar de depender de plantões exaustivos",
              "Todos os benefícios de um servidor público",
              "Todos os benefícios de uma carreira policial",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f8f9fb] px-5 py-4"
              >
                <Visto escuro />
                <span className="text-sm font-semibold text-gray-800">{t}</span>
              </div>
            ))}
          </div>
        </Secao>
      </div>

      {/* ------------------------------------------------------- fechamento */}
      <div className="bg-[#ffcd07]">
        <Secao className="py-16 text-center">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
            Seja o próximo aprovado
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-800">
            {black
              ? `De ${reais(PRECO_CHEIO)} por ${reais(PRECO_BLACK)} na Black, com 7 dias de garantia incondicional.`
              : "Os professores que mais aprovam médico legista no Brasil, com 7 dias de garantia incondicional."}
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
                Área do aluno
              </a>
              <a href={QUESTOES} className="hover:text-white">
                Questões
              </a>
              <a href={WHATSAPP} className="hover:text-white">
                Fale conosco
              </a>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-white/30">
              © {new Date().getFullYear()} Clube Forense · CNPJ
              53.323.379/0001-37. Este site não faz parte do Google ou do
              Facebook, nem é endossado por eles.
            </p>
          </div>
        </Secao>
      </footer>

      <EventosDeVenda
        produto={
          black
            ? "Preparatório Aprova Legista — Black"
            : "Preparatório Aprova Legista"
        }
        valor={preco}
      />
      <BarraCompra
        linha={
          black
            ? `Black · ${reais(PRECO_BLACK)} à vista`
            : "Preparatório Aprova Legista"
        }
        sublinha={`${PARCELAS}x de ${reaisComCentavos(parcela)} · garantia de 7 dias`}
      />
    </div>
  );
}
