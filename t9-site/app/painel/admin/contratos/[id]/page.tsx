import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/painel/auth";
import { contratoPorId, valorFormatado } from "@/lib/painel/comercial";
import { enderecoBase } from "@/lib/painel/links";
import { dataHora } from "@/lib/painel/formato";
import { excluirContrato, mudarStatusContrato, refazerTextoContrato, salvarTextoContrato } from "../../../acoes-comercial";
import FormComEstado from "../../../_ui/FormComEstado";
import CopiarLink from "../../../_ui/CopiarLink";
import { BotaoEnviar, SelectAutoEnvio } from "../../../_ui/Botoes";
import CamposComerciais from "../../CamposComerciais";
import { COR_STATUS, ROTULO_CONTRATO } from "../../statusComercial";

export default async function DetalheContrato({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const c = await contratoPorId(Number((await params).id));
  if (!c) notFound();
  const link = `${await enderecoBase()}/painel/contrato/${c.token}`;
  const assinado = c.status === "assinado";
  const numero = (c.cliente_telefone ?? "").replace(/\D/g, "");
  const saudacao = c.cliente_responsavel ? `Olá, ${c.cliente_responsavel.split(" ")[0]}!` : "Olá!";
  const whatsapp = `https://wa.me/${numero.length >= 10 ? numero : ""}?text=${encodeURIComponent(
    `${saudacao} Segue o contrato da T9 para a ${c.cliente_nome}. É só ler e assinar por este link: ${link}`,
  )}`;

  return (
    <>
      <Link href="/painel/admin/contratos" className="text-sm text-white/55 hover:text-white">
        ← Contratos
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{c.cliente_nome}</h1>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs ${COR_STATUS[c.status]}`}>{ROTULO_CONTRATO[c.status]}</span>
      </div>
      <p className="mt-1 text-white/55">
        {valorFormatado(c.valor_mensal, c.moeda)} por mês · permanência mínima de {c.prazo_minimo} meses · criado em {dataHora(c.criado_em, "pt")}
        {c.proposta_id && (
          <>
            {" · "}
            <Link href={`/painel/admin/propostas/${c.proposta_id}`} className="underline">
              veio de uma proposta
            </Link>
          </>
        )}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="painel-cartao p-5">
          <h2 className="font-display text-lg font-extrabold">Enviar para assinatura</h2>
          <p className="mt-1 text-sm text-white/55">O cliente abre sem login, lê, assina com nome e CPF e pode salvar em PDF. Você recebe um e-mail quando ele assinar.</p>
          <div className="mt-4">
            <CopiarLink link={link} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={link} target="_blank" rel="noopener" className="botao-painel botao-painel-sec">
              Ver como o cliente vê
            </a>
            {!assinado && c.status !== "cancelado" && (
              <a href={whatsapp} target="_blank" rel="noopener" className="botao-painel botao-painel-sec">
                Mandar pelo WhatsApp
              </a>
            )}
          </div>
        </section>

        <section className="painel-cartao p-5">
          <h2 className="font-display text-lg font-extrabold">Situação</h2>
          {assinado ? (
            <p className="mt-2 text-sm text-emerald-200">
              Assinado eletronicamente por {c.aceite_nome} ({c.aceite_documento}) em {c.aceite_em ? dataHora(c.aceite_em, "pt") : "-"}. O texto
              fica travado.
            </p>
          ) : (
            <>
              <form action={mudarStatusContrato} className="mt-3">
                <input type="hidden" name="id" value={c.id} />
                <SelectAutoEnvio
                  name="status"
                  valor={c.status}
                  rotulo="Situação do contrato"
                  opcoes={[
                    { valor: "rascunho", rotulo: "Rascunho" },
                    { valor: "enviado", rotulo: "Enviado" },
                    { valor: "cancelado", rotulo: "Cancelado" },
                  ]}
                />
              </form>
              <form action={excluirContrato} className="mt-4">
                <input type="hidden" name="id" value={c.id} />
                <BotaoEnviar className="botao-painel botao-painel-sec" confirmar="Excluir este contrato?">
                  Excluir
                </BotaoEnviar>
              </form>
            </>
          )}
        </section>
      </div>

      {!assinado && (
        <>
          <details className="painel-cartao mt-4 p-5">
            <summary className="cursor-pointer font-display font-extrabold">Corrigir os dados e refazer o texto</summary>
            <p className="mt-2 text-sm text-white/55">
              Mudou o valor, o prazo ou os dados da T9? Corrija aqui e o contrato é escrito de novo. Atenção: edições feitas à mão no texto se perdem.
            </p>
            <FormComEstado acao={refazerTextoContrato} className="mt-5 max-w-3xl">
              <input type="hidden" name="id" value={c.id} />
              <CamposComerciais dados={c} />
              <div className="mt-6">
                <BotaoEnviar enviando="Refazendo..." confirmar="Refazer o texto? Edições feitas à mão serão perdidas.">
                  Salvar e refazer o texto
                </BotaoEnviar>
              </div>
            </FormComEstado>
          </details>

          <section className="painel-cartao mt-4 p-5">
            <h2 className="font-display text-lg font-extrabold">Texto do contrato</h2>
            <p className="mt-1 text-sm text-white/55">Pode ajustar qualquer cláusula antes de enviar. Linhas começando com &quot;## &quot; viram títulos.</p>
            <FormComEstado acao={salvarTextoContrato} className="mt-4">
              <input type="hidden" name="id" value={c.id} />
              <textarea name="texto" rows={28} defaultValue={c.texto} className="painel-campo font-mono !text-[13px] leading-relaxed" />
              <div className="mt-4">
                <BotaoEnviar enviando="Salvando...">Salvar texto</BotaoEnviar>
              </div>
            </FormComEstado>
          </section>
        </>
      )}
    </>
  );
}
