import { mostrarEdicao, type Empresa } from "@/lib/painel/auth";
import { listarReunioes, type Reuniao } from "@/lib/painel/dados";
import { FUSO } from "@/lib/painel/formato";
import { CONFIG_IDIOMA, type Idioma } from "@/lib/i18n";
import type { TextosPainel } from "@/lib/painel/textos";
import { excluirReuniao, salvarReuniao } from "../../acoes-conteudo";
import { BotaoEnviar } from "../../_ui/Botoes";
import FormComEstado from "../../_ui/FormComEstado";
import { contextoEmpresa } from "../contexto";

const quandoPorExtenso = (iso: string, idioma: Idioma) =>
  new Date(iso).toLocaleString(CONFIG_IDIOMA[idioma].locale, {
    timeZone: FUSO,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Valor para <input type="datetime-local"> no horário de Brasília. */
const paraCampo = (iso: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    .format(new Date(iso))
    .replace(" ", "T");

export default async function Reunioes({ params }: { params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const reunioes = await listarReunioes(empresa.id);
  const editavel = await mostrarEdicao(usuario);
  const proximas = reunioes.filter((r) => !r.passada).reverse();
  const anteriores = reunioes.filter((r) => r.passada);
  const tr = t.reunioes;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{tr.titulo}</h1>
      <p className="mt-1 text-white/55">{tr.subtitulo}</p>

      {editavel && (
        <details className="painel-cartao mt-6 p-5">
          <summary className="cursor-pointer font-display font-extrabold">+ Agendar ou registrar reunião</summary>
          <FormReuniao empresa={empresa} t={tr} />
        </details>
      )}

      {reunioes.length === 0 && <p className="painel-cartao mt-6 p-6 text-center text-white/60">{tr.vazio}</p>}

      {proximas.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-extrabold">{tr.proximas}</h2>
          <div className="mt-4 grid gap-4">
            {proximas.map((r) => (
              <Cartao key={r.id} r={r} destaque idioma={idioma} t={tr} editavel={editavel} empresa={empresa} />
            ))}
          </div>
        </section>
      )}

      {anteriores.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-extrabold">{tr.anteriores}</h2>
          <div className="mt-4 grid gap-4">
            {anteriores.map((r) => (
              <Cartao key={r.id} r={r} idioma={idioma} t={tr} editavel={editavel} empresa={empresa} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Cartao({
  r,
  destaque = false,
  idioma,
  t,
  editavel,
  empresa,
}: {
  r: Reuniao;
  destaque?: boolean;
  idioma: Idioma;
  t: TextosPainel["reunioes"];
  editavel: boolean;
  empresa: Empresa;
}) {
  return (
    <article className={`painel-cartao p-5 ${destaque ? "border-[#ff2d38]/35" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm first-letter:uppercase ${destaque ? "text-[#ff8a90]" : "text-white/50"}`}>
            {quandoPorExtenso(r.quando, idioma)} (Brasília)
          </p>
          <h3 className="mt-0.5 font-display text-lg font-extrabold">{r.titulo}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {r.link && destaque && (
            <a href={r.link} target="_blank" rel="noopener noreferrer" className="botao-painel !min-h-[38px]">
              {t.entrar} ↗
            </a>
          )}
          {r.gravacao && (
            <a href={r.gravacao} target="_blank" rel="noopener noreferrer" className="botao-painel botao-painel-sec !min-h-[38px]">
              {t.gravacao} ↗
            </a>
          )}
        </div>
      </div>
      {(r.resumo || r.proximos_passos) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {r.resumo && (
            <div>
              <p className="text-xs font-medium tracking-wide text-white/45 uppercase">{t.resumo}</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/80">{r.resumo}</p>
            </div>
          )}
          {r.proximos_passos && (
            <div>
              <p className="text-xs font-medium tracking-wide text-white/45 uppercase">{t.proximosPassos}</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/80">{r.proximos_passos}</p>
            </div>
          )}
        </div>
      )}
      {editavel && (
        <details className="mt-4 border-t border-white/6 pt-3">
          <summary className="cursor-pointer text-sm text-white/50 hover:text-white">Editar</summary>
          <FormReuniao empresa={empresa} t={t} r={r} />
          <form action={excluirReuniao} className="mt-3">
            <input type="hidden" name="reuniao" value={r.id} />
            <BotaoEnviar className="text-xs text-[#ff8a90] hover:underline" confirmar={`Excluir "${r.titulo}"?`}>
              Excluir reunião
            </BotaoEnviar>
          </form>
        </details>
      )}
    </article>
  );
}

function FormReuniao({ empresa, t, r }: { empresa: Empresa; t: TextosPainel["reunioes"]; r?: Reuniao }) {
  return (
    <FormComEstado acao={salvarReuniao} limparAoSalvar={!r} className="mt-4">
      <input type="hidden" name="empresa" value={empresa.id} />
      {r && <input type="hidden" name="reuniao" value={r.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="painel-rotulo">Data e horário (Brasília)</span>
          <input name="quando" type="datetime-local" required defaultValue={r ? paraCampo(r.quando) : undefined} className="painel-campo" />
        </label>
        <label>
          <span className="painel-rotulo">Título</span>
          <input name="titulo" required defaultValue={r?.titulo} className="painel-campo" placeholder="Alinhamento semanal" />
        </label>
        <label>
          <span className="painel-rotulo">Link da reunião (Meet, Zoom)</span>
          <input name="link" type="url" defaultValue={r?.link ?? ""} className="painel-campo" placeholder="https://meet.google.com/..." />
        </label>
        <label>
          <span className="painel-rotulo">Gravação (opcional)</span>
          <input name="gravacao" type="url" defaultValue={r?.gravacao ?? ""} className="painel-campo" />
        </label>
        <label>
          <span className="painel-rotulo">{t.resumo}</span>
          <textarea name="resumo" rows={3} defaultValue={r?.resumo ?? ""} className="painel-campo" />
        </label>
        <label>
          <span className="painel-rotulo">{t.proximosPassos}</span>
          <textarea name="proximos_passos" rows={3} defaultValue={r?.proximos_passos ?? ""} className="painel-campo" />
        </label>
      </div>
      <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
        {r ? "Salvar alterações" : "Adicionar"}
      </BotaoEnviar>
    </FormComEstado>
  );
}
