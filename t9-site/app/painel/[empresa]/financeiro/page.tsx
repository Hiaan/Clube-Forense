import Link from "next/link";
import { modoCliente } from "@/lib/painel/auth";
import { hoje, somarDias } from "@/lib/painel/dados";
import { DIAS_LEMBRETE, listarCobrancas, situacaoDe, somarPorMoeda, type Aviso, type Cobranca } from "@/lib/painel/financeiro";
import { dataLonga, dinheiro } from "@/lib/painel/formato";
import { fmt } from "@/lib/i18n";
import { salvarInstrucoes } from "../../acoes-financeiro";
import AvisoPagamento from "../../_ui/AvisoPagamento";
import { BotaoEnviar } from "../../_ui/Botoes";
import { AcoesCobranca, FormCobranca, SeloSituacao, textoSituacao } from "../../_ui/Financeiro";
import FormComEstado from "../../_ui/FormComEstado";
import { contextoEmpresa } from "../contexto";
import { montarAviso } from "./aviso";

const PREVIAS = [7, 3, 1, 0, -1, -2, -3, -4, -5, -6, -7];

export default async function Financeiro({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const tf = t.financeiro;
  const cobrancas = await listarCobrancas(empresa.id);
  const admin = usuario.perfil === "admin" && !(await modoCliente());
  const referencia = hoje();
  const ano = referencia.slice(0, 4);

  const abertas = cobrancas.filter((c) => !c.pago_em).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const atrasadas = abertas.filter((c) => situacaoDe(c, referencia).tipo === "atrasada");
  const pagasNoAno = cobrancas.filter((c) => c.pago_em?.startsWith(ano));
  const proxima = abertas[0];
  const ordenadas = [...abertas, ...cobrancas.filter((c) => c.pago_em)];
  const soma = (lista: Cobranca[]) => {
    const totais = somarPorMoeda(lista);
    return totais.length ? totais.map(([m, v]) => dinheiro(v, m, idioma)).join(" + ") : dinheiro(0, "BRL", idioma);
  };

  // Pré-visualização dos pop-ups para a equipe: ?aviso=7 (dias até vencer) ou ?aviso=-3 (dias de atraso).
  const previa = Number((await searchParams).aviso);
  let avisoPrevia = null;
  if (usuario.perfil !== "cliente" && PREVIAS.includes(previa)) {
    const base: Cobranca = proxima ?? {
      id: 0,
      empresa_id: empresa.id,
      descricao: "Mensalidade T9",
      valor: 2500,
      moeda: "BRL",
      vencimento: referencia,
      link: null,
      pago_em: null,
    };
    const simulada: Aviso = {
      // A data acompanha a simulação: "3 dias de atraso" mostra um vencimento de 3 dias atrás.
      cobranca: { ...base, vencimento: somarDias(referencia, previa) },
      situacao: previa >= 0 ? { tipo: "aberta", dias: previa } : { tipo: "atrasada", dias: -previa },
    };
    avisoPrevia = montarAviso(simulada, empresa, idioma, tf, `previa-${previa}`);
  }

  return (
    <>
      {avisoPrevia && <AvisoPagamento aviso={avisoPrevia} sempre key={avisoPrevia.chave} />}

      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{tf.titulo}</h1>
      <p className="mt-1 text-white/55">{tf.subtitulo}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className={`painel-cartao p-4 sm:p-5 ${proxima ? "border-[#ff2d38]/35" : ""}`}>
          <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{tf.proximo}</p>
          {proxima ? (
            <>
              <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{dataLonga(proxima.vencimento, idioma)}</p>
              <p className="mt-1 text-sm text-white/60">
                {dinheiro(proxima.valor, proxima.moeda, idioma)} · {textoSituacao(situacaoDe(proxima, referencia), tf, idioma)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-emerald-300">{tf.emDia}</p>
          )}
        </div>
        <div className="painel-cartao p-4 sm:p-5">
          <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{tf.emAberto}</p>
          <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{soma(abertas)}</p>
          <p className="mt-1 text-sm text-white/45">{abertas.length}</p>
        </div>
        <div className={`painel-cartao p-4 sm:p-5 ${atrasadas.length ? "border-amber-400/40" : ""}`}>
          <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{tf.emAtraso}</p>
          <p className={`mt-2 font-display text-xl font-extrabold sm:text-2xl ${atrasadas.length ? "text-amber-200" : ""}`}>
            {soma(atrasadas)}
          </p>
          <p className="mt-1 text-sm text-white/45">{atrasadas.length}</p>
        </div>
        <div className="painel-cartao p-4 sm:p-5">
          <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{fmt(tf.pagoAno, { ano })}</p>
          <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{soma(pagasNoAno)}</p>
          <p className="mt-1 text-sm text-white/45">{pagasNoAno.length}</p>
        </div>
      </div>

      {(empresa.pagamento_instrucoes || admin) && (
        <section className="painel-cartao mt-4 p-5">
          <h2 className="text-xs font-medium tracking-wide text-white/55 uppercase">{tf.comoPagar}</h2>
          {admin ? (
            <FormComEstado acao={salvarInstrucoes} className="mt-2">
              <input type="hidden" name="empresa" value={empresa.id} />
              <textarea
                name="instrucoes"
                rows={3}
                defaultValue={empresa.pagamento_instrucoes ?? ""}
                className="painel-campo"
                placeholder={"Pix (CNPJ): 00.000.000/0001-00\nFavorecido: T9 ADS Company"}
              />
              <BotaoEnviar enviando="Salvando..." className="botao-painel botao-painel-sec mt-3">
                Salvar instruções
              </BotaoEnviar>
            </FormComEstado>
          ) : (
            <p className="mt-2 whitespace-pre-line text-white/85">{empresa.pagamento_instrucoes}</p>
          )}
        </section>
      )}

      {admin && (
        <details className="painel-cartao mt-4 p-5">
          <summary className="cursor-pointer font-display font-extrabold">+ Nova cobrança</summary>
          <div className="mt-4">
            <FormCobranca empresas={[empresa]} empresaFixa={empresa.id} moedaPadrao="BRL" />
          </div>
        </details>
      )}

      {cobrancas.length === 0 ? (
        <p className="painel-cartao mt-4 p-6 text-center text-white/60">{tf.vazio}</p>
      ) : (
        <>
          {/* Celular: um cartão por cobrança. */}
          <ul className="mt-4 grid gap-3 sm:hidden">
            {ordenadas.map((c) => (
              <li key={c.id} className={`painel-cartao p-4 ${c.pago_em ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{c.descricao}</p>
                    <p className="mt-0.5 text-sm text-white/55">{dataLonga(c.vencimento, idioma)}</p>
                  </div>
                  <p className="shrink-0 font-display font-extrabold tabular-nums">{dinheiro(c.valor, c.moeda, idioma)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <SeloSituacao c={c} t={tf} idioma={idioma} />
                  {!admin && !c.pago_em && c.link && (
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="botao-painel !min-h-[34px] !px-3 !text-xs">
                      {tf.pagar} ↗
                    </a>
                  )}
                </div>
                {admin && (
                  <div className="mt-3 border-t border-white/6 pt-3">
                    <AcoesCobranca c={c} empresas={[empresa]} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="painel-cartao mt-4 hidden overflow-x-auto sm:block">
            <table className="painel-tabela w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  <th>{tf.vencimento}</th>
                  <th>{tf.descricao}</th>
                  <th className="text-right">{tf.valor}</th>
                  <th>{tf.situacao}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((c) => (
                  <tr key={c.id} className={c.pago_em ? "text-white/60" : ""}>
                    <td className="whitespace-nowrap">{dataLonga(c.vencimento, idioma)}</td>
                    <td>{c.descricao}</td>
                    <td className="text-right whitespace-nowrap tabular-nums">{dinheiro(c.valor, c.moeda, idioma)}</td>
                    <td>
                      <SeloSituacao c={c} t={tf} idioma={idioma} />
                    </td>
                    <td className="text-right">
                      {admin ? (
                        <AcoesCobranca c={c} empresas={[empresa]} />
                      ) : (
                        !c.pago_em &&
                        c.link && (
                          <a href={c.link} target="_blank" rel="noopener noreferrer" className="botao-painel !min-h-[34px] !px-3 !text-xs">
                            {tf.pagar} ↗
                          </a>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {usuario.perfil !== "cliente" && (
        <section className="painel-cartao nao-imprimir mt-6 p-5">
          <h2 className="font-display font-extrabold">Pré-visualizar os pop-ups que o cliente recebe</h2>
          <p className="mt-1 text-sm text-white/50">
            O cliente vê o aviso automaticamente{" "}
            {DIAS_LEMBRETE.map((d) => (d === 0 ? "no dia" : d === 1 ? "1 dia antes" : `${d} dias antes`)).join(", ")} do vencimento e a cada
            dia de atraso. No 7º dia de atraso, o aviso diz que as campanhas serão suspensas. Lembretes aparecem uma vez por dia; atrasos, a
            cada nova visita.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PREVIAS.map((d) => (
              <Link
                key={d}
                href={`/painel/${empresa.slug}/financeiro?aviso=${d}`}
                scroll={false}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  d >= 0
                    ? "border-white/15 text-white/70"
                    : d === -7
                      ? "border-[#ff2d38]/50 text-[#ff9aa0]"
                      : "border-amber-400/30 text-amber-200"
                } hover:text-white`}
              >
                {d > 1 ? `${d} dias antes` : d === 1 ? "Amanhã" : d === 0 ? "No dia" : `${-d} ${d === -1 ? "dia" : "dias"} de atraso`}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
