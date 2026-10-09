import { mostrarEdicao } from "@/lib/painel/auth";
import { listarCriativos, miniaturaDe, type Criativo } from "@/lib/painel/dados";
import { dataLonga, dinheiro, numero, porcentagem, razao } from "@/lib/painel/formato";
import { FORMATOS_CRIATIVO, STATUS_CRIATIVO } from "@/lib/painel/textos";
import { fmt } from "@/lib/i18n";
import { excluirCriativo, mudarStatusCriativo, salvarCriativo } from "../../acoes-conteudo";
import { BotaoEnviar, SelectAutoEnvio } from "../../_ui/Botoes";
import FormComEstado from "../../_ui/FormComEstado";
import Miniatura from "../../_ui/Miniatura";
import { contextoEmpresa } from "../contexto";

const COR = {
  validado: { ponto: "bg-emerald-400", borda: "border-emerald-400/25", texto: "text-emerald-300" },
  teste: { ponto: "bg-amber-400", borda: "border-amber-400/25", texto: "text-amber-200" },
  reprovado: { ponto: "bg-[#ff4550]", borda: "border-[#ff2d38]/25", texto: "text-[#ff8a90]" },
} as const;

export default async function Criativos({ params }: { params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const criativos = await listarCriativos(empresa.id);
  const editavel = await mostrarEdicao(usuario);
  const rotuloResultado = empresa.tipo === "ecommerce" ? t.kpi.conversoes : t.kpi.leads;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.criativos.titulo}</h1>
      <p className="mt-1 text-white/55">{t.criativos.subtitulo}</p>

      {editavel && (
        <details className="painel-cartao mt-6 p-5">
          <summary className="cursor-pointer font-display font-extrabold">+ Adicionar criativo</summary>
          <FormComEstado acao={salvarCriativo} limparAoSalvar className="mt-4">
            <input type="hidden" name="empresa" value={empresa.id} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="sm:col-span-2">
                <span className="painel-rotulo">Nome</span>
                <input name="titulo" required className="painel-campo" placeholder="Ex.: Depoimento implante — vídeo 15s" />
              </label>
              <label>
                <span className="painel-rotulo">Situação</span>
                <select name="status" className="painel-campo" defaultValue="teste">
                  {STATUS_CRIATIVO.map((s) => (
                    <option key={s} value={s}>
                      {t.criativos.status[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="painel-rotulo">Formato</span>
                <select name="formato" className="painel-campo">
                  {FORMATOS_CRIATIVO.map((f) => (
                    <option key={f} value={f}>
                      {t.criativos.formatos[f]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="painel-rotulo">Plataforma</span>
                <select name="plataforma" className="painel-campo">
                  {["Meta Ads", "Google Ads", "TikTok Ads", "YouTube", "Outro"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="painel-rotulo">No ar desde</span>
                <input name="inicio" type="date" className="painel-campo" />
              </label>
              <label className="sm:col-span-2">
                <span className="painel-rotulo">Link (Drive, prévia do anúncio, Instagram)</span>
                <input name="link" type="url" className="painel-campo" placeholder="https://drive.google.com/file/d/..." />
              </label>
              <label className="sm:col-span-2">
                <span className="painel-rotulo">Imagem de capa (JPG/PNG até 4 MB, opcional)</span>
                <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="painel-campo !py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white" />
              </label>
              <label>
                <span className="painel-rotulo">Investido ({empresa.moeda})</span>
                <input name="gasto" inputMode="decimal" className="painel-campo" />
              </label>
              <label>
                <span className="painel-rotulo">{rotuloResultado}</span>
                <input name="resultados" inputMode="numeric" className="painel-campo" />
              </label>
              <label>
                <span className="painel-rotulo">CTR (%)</span>
                <input name="ctr" inputMode="decimal" className="painel-campo" placeholder="1,8" />
              </label>
              <label className="sm:col-span-2 lg:col-span-4">
                <span className="painel-rotulo">{t.criativos.aprendizado}</span>
                <textarea name="nota" rows={2} className="painel-campo" placeholder="O que esse criativo ensinou? Por que foi validado ou reprovado?" />
              </label>
            </div>
            <p className="mt-2 text-xs text-white/45">Sem imagem de capa, links de arquivo do Google Drive (compartilhados) mostram a miniatura automaticamente.</p>
            <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
              Adicionar
            </BotaoEnviar>
          </FormComEstado>
        </details>
      )}

      {criativos.length === 0 && <p className="painel-cartao mt-6 p-6 text-center text-white/60">{t.criativos.vazio}</p>}

      {STATUS_CRIATIVO.map((status) => {
        const grupo = criativos.filter((c) => c.status === status);
        if (!grupo.length && !editavel) return null;
        return (
          <section key={status} className="mt-8">
            <div className="flex items-baseline gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${COR[status].ponto}`} aria-hidden="true" />
              <h2 className="font-display text-xl font-extrabold">
                {t.criativos.grupos[status]} <span className="text-white/40">({grupo.length})</span>
              </h2>
              <p className="text-sm text-white/45">{t.criativos.descricoes[status]}</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {grupo.map((c) => (
                <Cartao key={c.id} c={c} editavel={editavel} contexto={{ empresa, idioma, t, rotuloResultado }} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

function Cartao({
  c,
  editavel,
  contexto: { empresa, idioma, t, rotuloResultado },
}: {
  c: Criativo;
  editavel: boolean;
  contexto: Pick<Awaited<ReturnType<typeof contextoEmpresa>>, "empresa" | "idioma" | "t"> & { rotuloResultado: string };
}) {
  const imagem = miniaturaDe(c);
  const $ = (v: number | null) => dinheiro(v, empresa.moeda, idioma);
  const custo = c.gasto != null && c.resultados ? razao(c.gasto, c.resultados) : null;
  const formato = t.criativos.formatos[c.formato as keyof typeof t.criativos.formatos] ?? c.formato;
  return (
    <article className={`painel-cartao flex flex-col overflow-hidden ${COR[c.status].borda}`}>
      <div className="aspect-square bg-white/5">
        <Miniatura src={imagem} alt={c.titulo} apagada={c.status === "reprovado"} reserva={formato} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
          <span className={`rounded-full border px-2 py-0.5 font-medium ${COR[c.status].borda} ${COR[c.status].texto}`}>{t.criativos.status[c.status]}</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/60">
            {formato}
            {c.meta_duracao ? ` · ${Math.floor(c.meta_duracao / 60)}:${String(Math.round(c.meta_duracao % 60)).padStart(2, "0")}` : ""}
          </span>
        </div>
        <h3 className="font-medium leading-snug">{c.titulo}</h3>
        <p className="mt-0.5 text-xs text-white/45">
          {[c.plataforma, c.inicio ? fmt(t.criativos.desde, { data: dataLonga(c.inicio, idioma) }) : null].filter(Boolean).join(" · ")}
        </p>
        {(c.gasto != null || c.resultados != null || c.ctr != null) && (
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            {c.gasto != null && <Dado rotulo={t.criativos.investido} valor={$(c.gasto)} />}
            {c.resultados != null && <Dado rotulo={rotuloResultado} valor={numero(c.resultados, idioma)} />}
            {custo != null && <Dado rotulo={t.criativos.custo} valor={$(custo)} />}
            {c.ctr != null && <Dado rotulo={t.kpi.ctr} valor={porcentagem(c.ctr / 100, idioma, 1)} />}
          </dl>
        )}
        {c.meta_campanhas && c.meta_campanhas.length > 0 && (
          <details className="painel-menu mt-3 rounded-xl border border-white/8">
            <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-white/75 hover:text-white">
              <span>
                {fmt(t.criativos.emCampanhas, {
                  total: c.meta_campanhas.length,
                  ativas: c.meta_campanhas.filter((x) => x.ativa).length,
                })}
              </span>
              <span aria-hidden="true">▾</span>
            </summary>
            <ul className="border-t border-white/6 px-3 py-2 text-xs">
              {c.meta_campanhas.map((camp) => (
                <li key={camp.nome} className="flex items-start gap-2 py-1.5">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${camp.ativa ? "bg-emerald-400" : "bg-white/25"}`}
                    title={camp.ativa ? t.criativos.ativa : t.criativos.pausada}
                  />
                  <span className="min-w-0 flex-1 break-words text-white/80">{camp.nome}</span>
                  <span className="shrink-0 text-right tabular-nums text-white/55">
                    {$(camp.gasto)}
                    <span className="block">
                      {numero(camp.resultados, idioma)} {rotuloResultado.toLowerCase()}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-white/6 px-3 py-2 text-[11px] leading-relaxed text-white/40">
              {c.meta_anuncios ? `${fmt(t.criativos.anuncios, { n: c.meta_anuncios })} · ` : ""}
              {t.criativos.periodoMeta}
            </p>
          </details>
        )}
        {c.nota && (
          <p className="mt-3 rounded-xl bg-white/[0.04] p-3 text-xs leading-relaxed text-white/70">
            <span className="mb-1 block font-medium text-white/50">{t.criativos.aprendizado}</span>
            {c.nota}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {c.link && (
            <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#ff8a90] hover:underline">
              {t.criativos.abrir} ↗
            </a>
          )}
          {editavel && (
            <>
              <form action={mudarStatusCriativo} className="ml-auto">
                <input type="hidden" name="criativo" value={c.id} />
                <SelectAutoEnvio
                  name="status"
                  valor={c.status}
                  rotulo={`Situação de ${c.titulo}`}
                  opcoes={STATUS_CRIATIVO.map((s) => ({ valor: s, rotulo: t.criativos.status[s] }))}
                />
              </form>
              <form action={excluirCriativo}>
                <input type="hidden" name="criativo" value={c.id} />
                <BotaoEnviar className="px-1 text-white/40 hover:text-[#ff8a90]" confirmar={`Excluir "${c.titulo}"?`}>
                  <span aria-hidden="true">✕</span>
                  <span className="sr-only">Excluir {c.titulo}</span>
                </BotaoEnviar>
              </form>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-white/45">{rotulo}</dt>
      <dd className="font-medium tabular-nums">{valor}</dd>
    </div>
  );
}
