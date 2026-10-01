import type { Empresa } from "@/lib/painel/auth";
import { situacaoDe, type Cobranca, type Situacao } from "@/lib/painel/financeiro";
import { MOEDAS, diaCurto } from "@/lib/painel/formato";
import { hoje } from "@/lib/painel/dados";
import type { TextosPainel } from "@/lib/painel/textos";
import { fmt, type Idioma } from "@/lib/i18n";
import { darBaixa, desfazerBaixa, excluirCobranca, salvarCobranca } from "../acoes-financeiro";
import { BotaoEnviar } from "./Botoes";
import FormComEstado from "./FormComEstado";

// Peças do financeiro usadas na aba do cliente e na visão geral do admin.

export function textoSituacao(s: Situacao, t: TextosPainel["financeiro"], idioma: Idioma) {
  const st = t.situacoes;
  if (s.tipo === "paga") return fmt(st.paga, { data: diaCurto(s.em, idioma) });
  if (s.tipo === "atrasada") return s.dias === 1 ? st.atrasada1 : fmt(st.atrasada, { dias: s.dias });
  return s.dias === 0 ? st.hoje : s.dias === 1 ? st.amanha : fmt(st.vence, { dias: s.dias });
}

export function SeloSituacao({ c, t, idioma }: { c: Cobranca; t: TextosPainel["financeiro"]; idioma: Idioma }) {
  const s = situacaoDe(c);
  const estilo =
    s.tipo === "paga"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : s.tipo === "atrasada"
        ? s.dias >= 7
          ? "border-[#ff2d38]/50 bg-[#ff2d38]/20 text-[#ffb3b7]"
          : "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : s.dias <= 3
          ? "border-white/25 bg-white/10 text-white"
          : "border-white/10 text-white/60";
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${estilo}`}>{textoSituacao(s, t, idioma)}</span>;
}

/** Botões do admin em cada cobrança: dar baixa (com data), desfazer, editar e excluir. */
export function AcoesCobranca({ c, empresas }: { c: Cobranca; empresas: Pick<Empresa, "id" | "nome">[] }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {c.pago_em ? (
        <form action={desfazerBaixa}>
          <input type="hidden" name="cobranca" value={c.id} />
          <BotaoEnviar className="text-xs text-white/50 hover:text-white" confirmar={`Desfazer a baixa de "${c.descricao}"?`}>
            Desfazer baixa
          </BotaoEnviar>
        </form>
      ) : (
        <form action={darBaixa} className="flex items-center gap-1.5">
          <input type="hidden" name="cobranca" value={c.id} />
          <input
            type="date"
            name="data"
            defaultValue={hoje()}
            aria-label="Data do pagamento"
            className="painel-campo !min-h-[34px] !w-[140px] !px-2 !py-1 !text-xs"
          />
          <BotaoEnviar enviando="..." className="botao-painel !min-h-[34px] !px-3 !text-xs">
            Dar baixa
          </BotaoEnviar>
        </form>
      )}
      <details className="painel-menu relative">
        <summary className="px-1 text-xs text-white/50 hover:text-white">Editar</summary>
        <div className="absolute right-0 z-20 mt-2 w-[min(90vw,420px)] rounded-2xl border border-white/10 bg-[#140405] p-4 shadow-2xl">
          <FormCobranca empresas={empresas} empresaFixa={c.empresa_id} c={c} />
          <form action={excluirCobranca} className="mt-3 border-t border-white/8 pt-3">
            <input type="hidden" name="cobranca" value={c.id} />
            <BotaoEnviar className="text-xs text-[#ff8a90] hover:underline" confirmar={`Excluir "${c.descricao}"?`}>
              Excluir cobrança
            </BotaoEnviar>
          </form>
        </div>
      </details>
    </div>
  );
}

/** Nova cobrança (com repetição mensal) ou edição de uma existente. */
export function FormCobranca({
  empresas,
  empresaFixa,
  c,
  moedaPadrao = "BRL",
}: {
  empresas: Pick<Empresa, "id" | "nome">[];
  empresaFixa?: number;
  c?: Cobranca;
  moedaPadrao?: string;
}) {
  return (
    <FormComEstado acao={salvarCobranca} limparAoSalvar={!c}>
      {c && <input type="hidden" name="cobranca" value={c.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        {empresaFixa ? (
          <input type="hidden" name="empresa" value={empresaFixa} />
        ) : (
          <label className="sm:col-span-2">
            <span className="painel-rotulo">Cliente</span>
            <select name="empresa" required className="painel-campo">
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="sm:col-span-2">
          <span className="painel-rotulo">Descrição</span>
          <input name="descricao" required defaultValue={c?.descricao ?? "Mensalidade T9"} className="painel-campo" />
        </label>
        <label>
          <span className="painel-rotulo">Valor</span>
          <input name="valor" required inputMode="decimal" defaultValue={c?.valor ?? ""} className="painel-campo" placeholder="2500" />
        </label>
        <label>
          <span className="painel-rotulo">Moeda</span>
          <select name="moeda" defaultValue={c?.moeda ?? moedaPadrao} className="painel-campo">
            {MOEDAS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="painel-rotulo">{c ? "Vencimento" : "Primeiro vencimento"}</span>
          <input name="vencimento" type="date" required defaultValue={c?.vencimento} className="painel-campo" />
        </label>
        {!c && (
          <label>
            <span className="painel-rotulo">Repetir por (meses)</span>
            <input name="repetir" inputMode="numeric" defaultValue="1" className="painel-campo" />
          </label>
        )}
        <label className="sm:col-span-2">
          <span className="painel-rotulo">Link de pagamento (boleto, Pix, cartão) — opcional</span>
          <input name="link" type="url" defaultValue={c?.link ?? ""} className="painel-campo" placeholder="https://..." />
        </label>
      </div>
      <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
        {c ? "Salvar" : "Criar cobrança"}
      </BotaoEnviar>
    </FormComEstado>
  );
}
