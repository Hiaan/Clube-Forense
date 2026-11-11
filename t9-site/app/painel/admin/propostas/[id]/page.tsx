import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/painel/auth";
import { propostaPorId, propostaVencida, valorFormatado } from "@/lib/painel/comercial";
import { enderecoBase } from "@/lib/painel/links";
import { dataHora } from "@/lib/painel/formato";
import { excluirProposta, gerarContratoDaProposta, mudarStatusProposta, salvarProposta } from "../../../acoes-comercial";
import FormComEstado from "../../../_ui/FormComEstado";
import CopiarLink from "../../../_ui/CopiarLink";
import { BotaoEnviar, SelectAutoEnvio } from "../../../_ui/Botoes";
import CamposComerciais from "../../CamposComerciais";
import { COR_STATUS, ROTULO_PROPOSTA } from "../../statusComercial";

/** Link do WhatsApp com a mensagem pronta para mandar a proposta ao cliente. */
function linkWhatsapp(telefone: string | null, texto: string) {
  const numero = (telefone ?? "").replace(/\D/g, "");
  return `https://wa.me/${numero.length >= 10 ? numero : ""}?text=${encodeURIComponent(texto)}`;
}

export default async function DetalheProposta({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const p = await propostaPorId(Number((await params).id));
  if (!p) notFound();
  const link = `${await enderecoBase()}/painel/proposta/${p.token}`;
  const vencida = propostaVencida(p) && p.status !== "recusada";
  const situacao = vencida ? "vencida" : p.status;
  const saudacao = p.cliente_responsavel ? `Olá, ${p.cliente_responsavel.split(" ")[0]}!` : "Olá!";

  return (
    <>
      <Link href="/painel/admin/propostas" className="text-sm text-white/55 hover:text-white">
        ← Propostas
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{p.cliente_nome}</h1>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs ${COR_STATUS[situacao]}`}>{vencida ? "Vencida" : ROTULO_PROPOSTA[p.status]}</span>
      </div>
      <p className="mt-1 text-white/55">
        {valorFormatado(p.valor_mensal, p.moeda)} por mês · permanência mínima de {p.prazo_minimo} meses · criada em {dataHora(p.criado_em, "pt")}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="painel-cartao p-5">
          <h2 className="font-display text-lg font-extrabold">Enviar ao cliente</h2>
          <p className="mt-1 text-sm text-white/55">O cliente abre sem login, lê, salva em PDF e aceita com o nome. Válida por {p.validade_dias} dias.</p>
          <div className="mt-4">
            <CopiarLink link={link} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={link} target="_blank" rel="noopener" className="botao-painel botao-painel-sec">
              Ver como o cliente vê
            </a>
            <a
              href={linkWhatsapp(p.cliente_telefone, `${saudacao} Segue a proposta da T9 para a ${p.cliente_nome}: ${link}`)}
              target="_blank"
              rel="noopener"
              className="botao-painel botao-painel-sec"
            >
              Mandar pelo WhatsApp
            </a>
          </div>
        </section>

        <section className="painel-cartao p-5">
          <h2 className="font-display text-lg font-extrabold">Situação</h2>
          {p.status === "aceita" ? (
            <p className="mt-2 text-sm text-emerald-200">
              Aceita por {p.aceite_nome} em {p.aceite_em ? dataHora(p.aceite_em, "pt") : "-"}.
            </p>
          ) : (
            <form action={mudarStatusProposta} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <SelectAutoEnvio
                name="status"
                valor={p.status}
                rotulo="Situação da proposta"
                opcoes={[
                  { valor: "rascunho", rotulo: "Rascunho" },
                  { valor: "enviada", rotulo: "Enviada" },
                  { valor: "recusada", rotulo: "Recusada" },
                ]}
              />
            </form>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {p.contrato_id ? (
              <Link href={`/painel/admin/contratos/${p.contrato_id}`} className="botao-painel">
                Abrir o contrato
              </Link>
            ) : (
              <form action={gerarContratoDaProposta}>
                <input type="hidden" name="id" value={p.id} />
                <BotaoEnviar enviando="Gerando...">Gerar contrato com estes dados</BotaoEnviar>
              </form>
            )}
            {p.status !== "aceita" && (
              <form action={excluirProposta}>
                <input type="hidden" name="id" value={p.id} />
                <BotaoEnviar className="botao-painel botao-painel-sec" confirmar="Excluir esta proposta?">
                  Excluir
                </BotaoEnviar>
              </form>
            )}
          </div>
        </section>
      </div>

      {p.status !== "aceita" && (
        <details className="painel-cartao mt-4 p-5">
          <summary className="cursor-pointer font-display font-extrabold">Editar a proposta</summary>
          <FormComEstado acao={salvarProposta} className="mt-5 max-w-3xl">
            <input type="hidden" name="id" value={p.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="painel-rotulo">Título da proposta (opcional)</span>
                <input name="titulo" defaultValue={p.titulo ?? ""} className="painel-campo" />
              </label>
              <label className="sm:col-span-2">
                <span className="painel-rotulo">Objetivo do cliente (opcional)</span>
                <textarea name="objetivo" rows={3} defaultValue={p.objetivo ?? ""} className="painel-campo" />
              </label>
              <label>
                <span className="painel-rotulo">Validade da proposta (dias)</span>
                <input name="validade_dias" type="number" min={1} max={90} defaultValue={p.validade_dias} className="painel-campo" />
              </label>
            </div>
            <div className="mt-6">
              <CamposComerciais dados={p} />
            </div>
            <div className="mt-6">
              <BotaoEnviar enviando="Salvando...">Salvar</BotaoEnviar>
            </div>
          </FormComEstado>
        </details>
      )}
    </>
  );
}
