import Link from "next/link";
import { exigirAdmin } from "@/lib/painel/auth";
import { consulta } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { enderecoBase } from "@/lib/painel/links";
import { metaConfigurado, situacaoTempoReal } from "@/lib/painel/meta";
import { enviosRecentes, estadoDaPonte, numeroLegivel, numerosDe, type EstadoDaPonte } from "@/lib/painel/whatsapp";
import { ativarLeadsTempoReal, desconectarWhatsapp, reconectarWhatsapp } from "../../acoes-whatsapp";
import AtualizarSozinho from "../../_ui/AtualizarSozinho";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";

const SELO: Record<EstadoDaPonte["fase"], { texto: string; cor: string }> = {
  "sem-config": { texto: "Não configurado", cor: "bg-white/8 text-white/55" },
  fora: { texto: "Ponte fora do ar", cor: "bg-red-500/15 text-red-300" },
  iniciando: { texto: "Iniciando", cor: "bg-amber-400/15 text-amber-200" },
  conectando: { texto: "Conectando", cor: "bg-amber-400/15 text-amber-200" },
  qr: { texto: "Aguardando o QR Code", cor: "bg-amber-400/15 text-amber-200" },
  conectado: { texto: "Conectado", cor: "bg-emerald-400/15 text-emerald-300" },
  parada: { texto: "Parada", cor: "bg-red-500/15 text-red-300" },
};

export default async function WhatsappAdmin() {
  await exigirAdmin();
  const callback = `${await enderecoBase()}/api/painel/meta-webhook`;
  const [estado, tempoReal, envios, clientes] = await Promise.all([
    estadoDaPonte(),
    metaConfigurado() ? situacaoTempoReal(callback) : null,
    enviosRecentes(20),
    consulta<{ nome: string; slug: string; whatsapp_leads: string }>("select nome, slug, whatsapp_leads from empresas where whatsapp_leads is not null order by nome"),
  ]);
  const selo = SELO[estado.fase];
  const paginasAtivas = tempoReal?.paginas.filter((p) => p.ativa).length ?? 0;
  const seloTempoReal = tempoReal?.pronto
    ? { texto: "Ligado", cor: "bg-emerald-400/15 text-emerald-300" }
    : tempoReal?.app && paginasAtivas
      ? { texto: `Parcial (${paginasAtivas} de ${tempoReal.paginas.length} Páginas)`, cor: "bg-amber-400/15 text-amber-200" }
      : { texto: "Desligado", cor: "bg-white/8 text-white/55" };

  return (
    <div className="space-y-4">
      {["iniciando", "conectando", "qr"].includes(estado.fase) && <AtualizarSozinho segundos={5} />}

      <section className="painel-cartao p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-extrabold">WhatsApp da T9</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${selo.cor}`}>{selo.texto}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          O número que manda os avisos aos clientes. Ele fica conectado como &ldquo;aparelho conectado&rdquo;, igual ao WhatsApp Web: as respostas dos
          clientes continuam chegando normalmente no celular desse número.
        </p>

        {estado.fase === "sem-config" && (
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-white/65">
            <li>
              Suba a ponte no servidor (pasta <code className="rounded bg-white/8 px-1 text-xs">whatsapp-ponte</code> do repositório, com Docker).
            </li>
            <li>
              Na Vercel, crie <code className="rounded bg-white/8 px-1 text-xs">WHATSAPP_PONTE_URL</code> (endereço HTTPS da ponte) e{" "}
              <code className="rounded bg-white/8 px-1 text-xs">WHATSAPP_PONTE_SEGREDO</code> (o mesmo PONTE_SEGREDO do servidor) e publique de novo.
            </li>
            <li>Volte aqui e leia o QR Code com o celular do número da T9.</li>
          </ol>
        )}

        {estado.fase === "fora" && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">
            A ponte não respondeu{estado.erro ? `: ${estado.erro}` : ""}. Confira se ela está ligada no servidor e se o endereço e o segredo na Vercel
            estão certos.
          </p>
        )}

        {estado.fase === "qr" && estado.qr && (
          <div className="mt-5 flex flex-wrap items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR em data URL, muda a cada poucos segundos */}
            <img src={estado.qr} alt="QR Code para conectar o WhatsApp da T9" width={240} height={240} className="rounded-xl bg-white p-2" />
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-white/65">
              <li>Abra o WhatsApp no celular do número da T9.</li>
              <li>Toque em ⋮ (ou Configurações) → Aparelhos conectados → Conectar um aparelho.</li>
              <li>Aponte a câmera para este QR. Ele se renova sozinho a cada poucos segundos.</li>
            </ol>
          </div>
        )}

        {estado.fase === "conectado" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-white/75">
              Conectado como <strong>{numeroLegivel(estado.numero)}</strong>
              {estado.nome ? ` (${estado.nome})` : ""}
              {estado.desde ? ` desde ${dataHora(estado.desde, "pt")}` : ""}.
            </p>
            <form action={desconectarWhatsapp}>
              <BotaoEnviar className="text-xs text-white/45 hover:text-[#ff8a90]" confirmar="Desconectar o WhatsApp da T9? Os avisos param até ler o QR de novo.">
                Desconectar
              </BotaoEnviar>
            </form>
          </div>
        )}

        {estado.fase === "parada" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-red-200">{estado.erro || "A ponte parou de tentar conectar."}</p>
            <form action={reconectarWhatsapp}>
              <BotaoEnviar className="botao-painel-sec">Tentar de novo</BotaoEnviar>
            </form>
          </div>
        )}
      </section>

      <section className="painel-cartao p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold">Leads em tempo real</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${seloTempoReal.cor}`}>{seloTempoReal.texto}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Com isso ligado, a Meta avisa o painel no segundo em que alguém preenche um formulário, e o lead vai na hora para o WhatsApp do cliente.
          Desligado, os leads chegam na sincronização diária (de manhã).
        </p>
        {tempoReal && tempoReal.paginas.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {tempoReal.paginas.map((p) => (
              <li key={p.nome} className={p.ativa ? "text-emerald-300" : "text-white/55"}>
                {p.ativa ? "✓" : "–"} {p.nome}
                {"erro" in p && p.erro ? <span className="text-white/40"> ({p.erro})</span> : null}
              </li>
            ))}
          </ul>
        )}
        {tempoReal?.erro && <p className="mt-3 text-sm text-red-200">{tempoReal.erro}</p>}
        {metaConfigurado() ? (
          <FormComEstado acao={ativarLeadsTempoReal} className="mt-4">
            <BotaoEnviar enviando="Ligando..." className="botao-painel">
              {tempoReal?.pronto ? "Ligar de novo (inclui Páginas novas)" : "Ligar leads em tempo real"}
            </BotaoEnviar>
          </FormComEstado>
        ) : (
          <p className="mt-3 text-sm text-white/55">Configure a conexão com a Meta primeiro.</p>
        )}
      </section>

      <section className="painel-cartao p-6">
        <h2 className="font-display text-lg font-extrabold">Clientes recebendo leads no WhatsApp</h2>
        {clientes.length ? (
          <ul className="mt-3 divide-y divide-white/6 text-sm">
            {clientes.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link href={`/painel/admin/${c.slug}`} className="font-medium hover:text-[#ff8a90]">
                  {c.nome}
                </Link>
                <span className="text-white/55">{numerosDe(c.whatsapp_leads).map(numeroLegivel).join(", ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/55">Nenhum ainda. Ligue na página de cada cliente, em &ldquo;Leads no WhatsApp do cliente&rdquo;.</p>
        )}
      </section>

      <section className="painel-cartao p-6">
        <h2 className="font-display text-lg font-extrabold">Últimos envios</h2>
        {envios.length ? (
          <ul className="mt-3 divide-y divide-white/6 text-sm">
            {envios.map((e, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className={e.ok ? "text-emerald-300" : "text-red-300"}>{e.ok ? "✓" : "✕"}</span> {e.empresa ?? "—"} · {e.lead ?? "teste"} →{" "}
                  {numeroLegivel(e.numero)}
                  {e.erro ? <span className="text-white/45"> ({e.erro})</span> : null}
                </span>
                <span className="text-white/45">{dataHora(e.criado_em, "pt")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/55">Nenhuma mensagem enviada ainda.</p>
        )}
      </section>
    </div>
  );
}
