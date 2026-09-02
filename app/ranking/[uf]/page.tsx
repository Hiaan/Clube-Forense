// Ranking de uma prova: o cartão-resposta e como foi diante de quem respondeu.

import type { Metadata } from "next";
import { Fragment } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import CartaoResposta from "./CartaoResposta";
import Cabecalho from "../../components/Cabecalho";
import PrecisaEntrar from "../PrecisaEntrar";
import { nomeDoLead } from "../../lib/leadsRepo";
import { lerProvaDaUf, lerRespostas } from "../../lib/provasRepo";
import {
  cartoesParaEstimar,
  corrigir,
  estatisticas,
  estimarCorte,
  MIN_AMOSTRA,
  montarRanking,
  type Colocado,
} from "../../lib/ranking";
import { emailDaSessao, NOME_COOKIE, sessaoValida } from "../../lib/sessao";
import { ESTADO_POR_UF } from "../../monitor/lib/estados";

export const dynamic = "force-dynamic";

/** Quantos primeiros colocados aparecem sempre. */
const TOPO = 10;
/** Quantos vizinhos mostrar em volta de quem está olhando, quando ele fica fora do topo. */
const VIZINHOS = 2;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uf: string }>;
}): Promise<Metadata> {
  const uf = (await params).uf.toUpperCase();
  const estado = ESTADO_POR_UF[uf];
  return {
    title: estado
      ? `Ranking e Notas — ${estado.nome} | Clube Forense`
      : "Ranking e Notas | Clube Forense",
  };
}

/**
 * O topo do ranking mais a vizinhança de quem está olhando.
 *
 * Quem tirou o 87º lugar precisa ver o 85º e o 89º — é isso que diz quanto
 * falta. Mostrar a lista inteira seria despejar trezentas linhas para entregar
 * essa informação.
 */
function recortar(colocados: Colocado[]): { linhas: Colocado[]; cortou: boolean } {
  if (colocados.length <= TOPO + VIZINHOS * 2 + 1) {
    return { linhas: colocados, cortou: false };
  }
  const eu = colocados.findIndex((c) => c.euMesmo);
  const topo = colocados.slice(0, TOPO);
  if (eu < 0 || eu < TOPO) return { linhas: topo, cortou: true };

  const de = Math.max(TOPO, eu - VIZINHOS);
  return { linhas: [...topo, ...colocados.slice(de, eu + VIZINHOS + 1)], cortou: true };
}

function formatarData(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function RankingDoEstado({
  params,
}: {
  params: Promise<{ uf: string }>;
}) {
  const uf = (await params).uf.toUpperCase();
  const estado = ESTADO_POR_UF[uf];
  if (!estado) notFound();

  const [prova, jar] = await Promise.all([lerProvaDaUf(uf), cookies()]);
  if (!prova) notFound();

  const cookie = jar.get(NOME_COOKIE)?.value;
  const liberado = sessaoValida(cookie);
  const email = emailDaSessao(cookie);

  const [respostas, nomeCadastrado] = await Promise.all([
    lerRespostas(prova.id),
    email ? nomeDoLead(email) : Promise.resolve(null),
  ]);

  const comNota = respostas.filter((r) => r.nota != null);
  const notas = comNota.map((r) => r.nota as number).sort((a, b) => b - a);

  const colocados = montarRanking(
    comNota.map((r) => ({
      email: r.email,
      apelido: r.apelido,
      nota: r.nota as number,
      acertos: r.acertos ?? 0,
    })),
    email,
  );
  const { linhas, cortou } = recortar(colocados);

  const stats = estatisticas(notas);
  const corte = estimarCorte(notas, prova.vagas, prova.inscritos);
  // Quantos cartões esta concorrência exige para a projeção sair do topo da
  // amostra. Dizer o número é mais útil que um "ainda não dá" seco.
  const precisaDe = cartoesParaEstimar(prova.vagas, prova.inscritos);

  const minha = email ? respostas.find((r) => r.email === email) ?? null : null;
  const meuLugar = colocados.find((c) => c.euMesmo) ?? null;
  const meuGabarito = minha ? prova.gabaritos[minha.tipo] ?? {} : {};
  const minhaCorrecao =
    minha && Object.keys(meuGabarito).length > 0
      ? corrigir(minha.respostas, meuGabarito, prova.materias, prova.penalidade)
      : null;

  return (
    <div className="min-h-screen bg-[#0b0b0d]">
      <Cabecalho liberado={liberado} />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <Link href="/ranking" className="text-xs font-medium text-gray-500 hover:text-white">
          ← Todas as provas
        </Link>

        <header className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffcd07]">
            Ranking e Notas · {estado.nome}
          </p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{prova.titulo}</h1>
          <p className="mt-2 text-sm text-gray-400">
            {formatarData(prova.dataProva)}
            {prova.dataProva && " · "}
            {prova.aberta ? (
              <span className="font-semibold text-green-400">recebendo cartões</span>
            ) : (
              <span>envio encerrado</span>
            )}
            {respostas.length > 0 && ` · ${respostas.length} participante(s)`}
          </p>
        </header>

        {/* ---------- Sua posição ---------- */}
        {meuLugar && (
          <section className="mt-6 rounded-2xl border border-[#ffcd07]/30 bg-[#ffcd07]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#ffcd07]">
              Sua posição
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {meuLugar.posicao}º{" "}
              <span className="text-base font-bold text-gray-300">
                de {colocados.length}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {meuLugar.acertos} acertos · nota {meuLugar.nota}
            </p>

            {minhaCorrecao && (
              <ul className="mt-4 divide-y divide-white/10 border-t border-white/10 pt-1">
                {minhaCorrecao.porMateria.map((m) => (
                  <li key={m.nome} className="flex items-baseline justify-between gap-3 py-1.5">
                    <span className="text-sm text-gray-200">{m.nome}</span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {m.acertos} de {m.corrigidas}
                      {m.erros > 0 && ` · ${m.erros} erro(s)`}
                      {m.brancos > 0 && ` · ${m.brancos} em branco`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {minha && !meuLugar && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#121215] p-5">
            <p className="text-sm font-semibold text-white">Seu cartão está guardado.</p>
            <p className="mt-1 text-sm text-gray-400">
              O gabarito {minha.tipo ? `do ${minha.tipo}` : "desta prova"} ainda não
              entrou aqui. Assim que entrar, sua nota e sua posição aparecem sem
              você precisar reenviar nada.
            </p>
          </section>
        )}

        {/* ---------- Cartão-resposta ---------- */}
        {prova.aberta ? (
          email ? (
            <>
              <h2 className="mt-8 text-lg font-bold text-white">
                {minha ? "Corrigir o que você enviou" : "Lance seu cartão-resposta"}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Marque o que você marcou na prova. Quando o gabarito sair, a
                correção é automática — e continua valendo se a banca mudar uma
                resposta nos recursos.
              </p>
              <CartaoResposta
                provaId={prova.id}
                estilo={prova.estilo}
                tipos={prova.tipos}
                materias={prova.materias}
                apelidoInicial={minha?.apelido ?? nomeCadastrado ?? ""}
                cartaoInicial={minha?.respostas ?? {}}
                tipoInicial={minha?.tipo ?? ""}
              />
            </>
          ) : (
            <PrecisaEntrar
              uf={uf}
              estado={estado.nome}
              titulo={
                liberado
                  ? "Entre de novo para participar"
                  : "Entre para lançar seu cartão"
              }
              texto={
                liberado
                  ? "Seu acesso foi liberado antes do ranking existir, então ainda não sabemos de quem é ele. Entrar de novo resolve — e leva alguns segundos."
                  : "O ranking precisa saber de quem é cada cartão para mostrar a sua posição. Seu e-mail nunca aparece na lista: só o nome que você escolher."
              }
            />
          )
        ) : (
          <p className="mt-8 rounded-2xl border border-white/10 bg-[#121215] p-5 text-sm text-gray-400">
            Esta prova não está mais recebendo cartões. O ranking abaixo é o
            resultado final de quem participou.
          </p>
        )}

        {/* ---------- Nota de corte estimada ---------- */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-[#121215] p-5">
          <h2 className="text-lg font-bold text-white">Possível nota de corte</h2>

          {corte ? (
            <>
              <p className="mt-2 text-4xl font-black text-[#ffcd07]">{corte.nota}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                {corte.base === "projetada" ? (
                  <>
                    É a nota de quem está na posição {corte.posicao} entre os{" "}
                    {corte.respondentes} cartões daqui — a mesma fatia que as{" "}
                    {prova.vagas} vagas representam entre os {prova.inscritos}{" "}
                    inscritos no concurso.
                  </>
                ) : (
                  <>
                    É quanto fez quem ocupa a {prova.vagas}ª posição entre os{" "}
                    {corte.respondentes} cartões enviados aqui. Não é uma projeção
                    sobre o concurso inteiro: para isso faltaria o número de
                    inscritos.
                  </>
                )}
              </p>
              {/* O aviso não é rodapé nem letra miúda: é parte do número. Quem
                  responde aqui é aluno do Clube que estudou e quer se comparar —
                  uma turma acima da média dos inscritos. */}
              <p className="mt-3 rounded-xl bg-white/[0.06] px-4 py-3 text-xs leading-relaxed text-gray-400">
                <strong className="text-gray-300">Leia com cuidado:</strong> quem
                responde aqui se ofereceu para responder, e em geral estudou mais
                que a média dos inscritos. Isso empurra a estimativa para cima — o
                corte real tende a ficar <strong>abaixo</strong> deste número.
                Trate como termômetro, nunca como resultado.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {precisaDe && notas.length >= MIN_AMOSTRA ? (
                <>
                  Ainda não dá. A disputa é de {prova.vagas} vagas para{" "}
                  {prova.inscritos} inscritos, e com {notas.length} cartões essa
                  fatia cai no primeiro colocado daqui — o número que sairia seria
                  a maior nota da amostra, não um corte. Com cerca de {precisaDe}{" "}
                  cartões a projeção passa a significar alguma coisa.
                </>
              ) : (
                <>
                  Ainda não dá para estimar. São precisos pelo menos {MIN_AMOSTRA}{" "}
                  cartões já corrigidos e o número de vagas do edital
                  {notas.length > 0 && ` — temos ${notas.length} até agora`}. Um
                  corte tirado de meia dúzia de cartões seria chute com cara de
                  estatística.
                </>
              )}
            </p>
          )}

          {stats && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Participantes", stats.respondentes],
                ["Maior nota", stats.maior],
                ["Média", stats.media],
                ["Mediana", stats.mediana],
              ].map(([r, v]) => (
                <div key={String(r)} className="rounded-xl bg-white/[0.06] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">{r}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{v}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Ranking ---------- */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-white">Ranking</h2>

          {colocados.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">
              Nenhum cartão corrigido ainda. Assim que o gabarito entrar, o ranking
              se monta sozinho com quem já enviou.
            </p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#121215]">
                {linhas.map((c, i) => {
                  // O salto do topo para a vizinhança de quem olha precisa ficar
                  // visível: sem esta linha, o 10º e o 85º pareceriam seguidos.
                  const salto = i > 0 && c.posicao > linhas[i - 1].posicao + 1;

                  return (
                    <Fragment key={`${c.posicao}-${c.apelido}`}>
                      {salto && (
                        <li className="px-5 py-1.5 text-center text-xs text-gray-600">⋯</li>
                      )}
                      <li
                        className={`flex items-center gap-3 px-5 py-3 ${
                          c.euMesmo ? "bg-[#ffcd07]/10" : ""
                        }`}
                      >
                        <span
                          className={`w-10 shrink-0 text-sm font-black ${
                            c.posicao === 1 ? "text-[#ffcd07]" : "text-gray-500"
                          }`}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {c.posicao}º
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-sm ${
                            c.euMesmo ? "font-bold text-white" : "text-gray-200"
                          }`}
                        >
                          {c.apelido}
                          {c.euMesmo && (
                            <span className="ml-2 text-[11px] font-bold text-[#ffcd07]">
                              você
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-500">
                          {c.acertos} acertos
                        </span>
                        <span
                          className="w-16 shrink-0 text-right text-sm font-bold text-white"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {c.nota}
                        </span>
                      </li>
                    </Fragment>
                  );
                })}
              </ul>

              {cortou && (
                <p className="mt-2 text-[11px] text-gray-500">
                  Mostrando os {TOPO} primeiros
                  {meuLugar && meuLugar.posicao > TOPO && " e a sua vizinhança"}, de{" "}
                  {colocados.length} participantes.
                </p>
              )}
            </>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
            As notas são autodeclaradas: cada participante informa o próprio
            cartão. Não é resultado oficial e não substitui o da banca — serve
            para você saber onde está antes de o resultado sair.
          </p>
        </section>
      </main>
    </div>
  );
}
