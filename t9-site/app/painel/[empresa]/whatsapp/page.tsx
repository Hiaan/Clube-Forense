import { consulta } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { numeroLegivel } from "@/lib/painel/whatsapp";
import {
  estadoDoCliente,
  listarOfertas,
  MODELOS,
  mensagemPadrao,
  SAUDACAO_OFERTA,
  ultimosContatos,
} from "@/lib/painel/whatsappCliente";
import { fmt } from "@/lib/i18n";
import {
  conectarWhatsappCliente,
  criarOferta,
  desconectarWhatsappCliente,
  excluirOferta,
  salvarMensagemCliente,
  salvarOferta,
  testarMensagemCliente,
} from "../../acoes-whatsapp-cliente";
import AtualizarSozinho from "../../_ui/AtualizarSozinho";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import EditorMensagemWhatsapp from "../../_ui/EditorMensagemWhatsapp";
import { contextoEmpresa } from "../contexto";

const COR: Record<string, string> = {
  conectado: "bg-emerald-400/15 text-emerald-300",
  qr: "bg-amber-400/15 text-amber-200",
  conectando: "bg-amber-400/15 text-amber-200",
  iniciando: "bg-amber-400/15 text-amber-200",
  parada: "bg-red-500/15 text-red-300",
  fora: "bg-red-500/15 text-red-300",
};

export default async function WhatsappCliente({
  params,
}: {
  params: Promise<{ empresa: string }>;
}) {
  const { empresa, idioma, t } = await contextoEmpresa(params);
  const tw = t.waCliente;
  const [estado, contatos, ofertas] = await Promise.all([
    estadoDoCliente(empresa.id),
    ultimosContatos(empresa.id),
    listarOfertas(empresa.id),
  ]);

  // Guarda o número conectado, para a equipe ver na carteira sem consultar a ponte.
  if (
    estado.fase === "conectado" &&
    estado.numero !== empresa.wa_cliente_numero
  ) {
    await consulta("update empresas set wa_cliente_numero = $2 where id = $1", [
      empresa.id,
      estado.numero,
    ]);
  }
  const aguardando = ["qr", "conectando", "iniciando"].includes(estado.fase);

  return (
    <>
      {aguardando && <AtualizarSozinho segundos={4} />}
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {tw.titulo}
      </h1>
      <p className="mt-1 max-w-2xl text-white/55">{tw.subtitulo}</p>

      <section className="painel-cartao mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold">{tw.conexao}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COR[estado.fase] ?? "bg-white/8 text-white/55"}`}
          >
            {tw.estados[estado.fase]}
          </span>
        </div>

        {estado.fase === "conectado" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-white/75">
              {fmt(tw.conectadoComo, { numero: numeroLegivel(estado.numero) })}
              {estado.nome ? ` (${estado.nome})` : ""}
            </p>
            <form action={desconectarWhatsappCliente}>
              <input type="hidden" name="empresa" value={empresa.id} />
              <BotaoEnviar
                className="text-xs text-white/45 hover:text-[#ff8a90]"
                confirmar={tw.desconectarPergunta}
              >
                {tw.desconectar}
              </BotaoEnviar>
            </form>
          </div>
        )}

        {estado.fase === "qr" && estado.qr && (
          <div className="mt-5 flex flex-wrap items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR em data URL, muda a cada poucos segundos */}
            <img
              src={estado.qr}
              alt="QR Code"
              width={240}
              height={240}
              className="rounded-xl bg-white p-2"
            />
            <ol className="max-w-sm list-decimal space-y-1.5 pl-5 text-sm text-white/70">
              {tw.passos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </div>
        )}

        {(estado.fase === "conectando" ||
          estado.fase === "iniciando" ||
          (estado.fase === "qr" && !estado.qr)) && (
          <p className="mt-4 text-sm text-white/60">{tw.conectando}</p>
        )}

        {(estado.fase === "desligado" || estado.fase === "parada") && (
          <FormComEstado acao={conectarWhatsappCliente} className="mt-4">
            <input type="hidden" name="empresa" value={empresa.id} />
            {estado.erro && (
              <p className="mb-3 text-sm text-amber-200">{estado.erro}</p>
            )}
            <BotaoEnviar enviando={tw.conectando} className="botao-painel">
              {tw.conectar}
            </BotaoEnviar>
          </FormComEstado>
        )}

        {estado.fase === "fora" && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {tw.foraDoAr}
          </p>
        )}
        {estado.fase === "sem-config" && (
          <p className="mt-4 text-sm text-white/60">{tw.semConfig}</p>
        )}

        <p className="mt-5 text-xs leading-relaxed text-white/40">{tw.aviso}</p>
      </section>

      <EditorMensagemWhatsapp
        empresaId={empresa.id}
        empresa={empresa.nome}
        inicial={empresa.wa_cliente_mensagem || mensagemPadrao(empresa.idioma)}
        ativo={empresa.wa_cliente_ativo}
        modelos={MODELOS[empresa.idioma]}
        t={tw}
        salvar={salvarMensagemCliente}
        testar={testarMensagemCliente}
      />

      <section className="painel-cartao mt-4 p-6">
        <h2 className="font-display text-lg font-extrabold">
          {tw.ofertasTitulo}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/55">
          {tw.ofertasTexto}
        </p>

        {ofertas.length > 0 && (
          <ul className="mt-5 space-y-4">
            {ofertas.map((o) => (
              <li key={o.id} className="rounded-2xl border border-white/8 p-4">
                <FormComEstado acao={salvarOferta}>
                  <input type="hidden" name="empresa" value={empresa.id} />
                  <input type="hidden" name="oferta" value={o.id} />
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <label>
                      <span className="painel-rotulo">{tw.ofertaNome}</span>
                      <input
                        name="nome"
                        defaultValue={o.nome}
                        required
                        maxLength={80}
                        className="painel-campo"
                      />
                      <span
                        className={`mt-1.5 block text-xs ${o.criativos ? "text-emerald-300" : "text-amber-200"}`}
                      >
                        {o.criativos
                          ? fmt(tw.ofertaCriativos, { n: o.criativos })
                          : tw.ofertaSemCriativo}
                      </span>
                    </label>
                    <label>
                      <span className="painel-rotulo">{tw.ofertaSaudacao}</span>
                      <textarea
                        name="mensagem"
                        defaultValue={o.mensagem}
                        required
                        maxLength={1000}
                        rows={3}
                        className="painel-campo !min-h-[96px] leading-relaxed"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <BotaoEnviar
                      enviando="..."
                      className="botao-painel botao-painel-sec"
                    >
                      {tw.salvar}
                    </BotaoEnviar>
                  </div>
                </FormComEstado>
                <form action={excluirOferta} className="mt-2">
                  <input type="hidden" name="empresa" value={empresa.id} />
                  <input type="hidden" name="oferta" value={o.id} />
                  <BotaoEnviar
                    className="text-xs text-white/45 hover:text-[#ff8a90]"
                    confirmar={fmt(tw.ofertaExcluirPergunta, { nome: o.nome })}
                  >
                    {tw.ofertaExcluir}
                  </BotaoEnviar>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* Sempre aberto: dentro de um <details>, a confirmação sumia junto com ele ao recarregar. */}
        <FormComEstado
          acao={criarOferta}
          limparAoSalvar
          className="mt-5 rounded-2xl border border-dashed border-white/12 p-4"
        >
          <p className="mb-3 text-sm font-medium">{tw.ofertaNova}</p>
          <input type="hidden" name="empresa" value={empresa.id} />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <label>
              <span className="painel-rotulo">{tw.ofertaNome}</span>
              <input
                name="nome"
                required
                maxLength={80}
                className="painel-campo"
                placeholder={tw.ofertaNomeExemplo}
              />
            </label>
            <label>
              <span className="painel-rotulo">{tw.ofertaSaudacao}</span>
              <textarea
                name="mensagem"
                defaultValue={SAUDACAO_OFERTA[empresa.idioma]}
                required
                maxLength={1000}
                rows={3}
                className="painel-campo !min-h-[96px] leading-relaxed"
              />
            </label>
          </div>
          <BotaoEnviar enviando="..." className="botao-painel mt-3">
            {tw.ofertaAdicionar}
          </BotaoEnviar>
        </FormComEstado>
      </section>

      {empresa.wa_cliente_ativado_em && (
        <section className="painel-cartao mt-4 p-6">
          <h2 className="font-display text-lg font-extrabold">{tw.ultimos}</h2>
          {contatos.length === 0 ? (
            <p className="mt-2 text-sm text-white/55">{tw.nenhum}</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/6 text-sm">
              {contatos.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <span>
                    <span className="font-medium">
                      {c.nome ?? c.whatsapp ?? "—"}
                    </span>
                    <span className="ml-2 text-xs text-white/40">
                      {dataHora(c.recebido_em, idioma)}
                    </span>
                    {c.contato_auto_oferta && (
                      <span className="block text-xs text-white/45">
                        {fmt(tw.comOferta, { oferta: c.contato_auto_oferta })}
                      </span>
                    )}
                  </span>
                  {!c.whatsapp ? (
                    <span className="text-xs text-white/45">
                      {tw.semNumero}
                    </span>
                  ) : c.contato_auto_erro ? (
                    <span className="text-xs text-[#ff8a90]">
                      {fmt(tw.falhou, { motivo: c.contato_auto_erro })}
                    </span>
                  ) : c.contato_auto_em ? (
                    <span className="text-xs text-emerald-300">
                      ✓ {tw.enviada}
                    </span>
                  ) : (
                    <span className="text-xs text-white/45">{tw.naFila}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
