import { exigirEquipe } from "@/lib/painel/auth";
import { linkBibliotecaMeta, listarReferencias } from "@/lib/painel/comercial";
import { dataHora } from "@/lib/painel/formato";
import { excluirReferencia, salvarReferencia } from "../../acoes-comercial";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import Detalhes from "../../_ui/Detalhes";

// Pesquisa de mercado: a Biblioteca de Anúncios da Meta não pode ser embutida nem consultada pela API
// fora de anúncios políticos e da União Europeia. Então a busca abre a biblioteca já filtrada em outra
// aba, e o que valer a pena vira uma referência no mural da equipe.

const PAISES = [
  { valor: "BR", rotulo: "Brasil" },
  { valor: "US", rotulo: "Estados Unidos" },
  { valor: "PT", rotulo: "Portugal" },
  { valor: "ALL", rotulo: "Todos os países" },
];

const NICHOS = ["imobiliária", "clínica de estética", "odontologia", "advocacia", "academia", "restaurante delivery", "concessionária", "curso online", "energia solar", "farmácia"];

const OUTRAS = [
  { nome: "Google (Central de Transparência de Anúncios)", link: "https://adstransparency.google.com/?region=BR" },
  { nome: "TikTok (Creative Center: anúncios em alta)", link: "https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/pt" },
  { nome: "LinkedIn (Biblioteca de anúncios)", link: "https://www.linkedin.com/ad-library/" },
];

export default async function Pesquisa({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  await exigirEquipe();
  const { busca } = await searchParams;
  const referencias = await listarReferencias(busca);

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Pesquisa de mercado</h1>
      <p className="mt-1 text-white/55">Veja o que os concorrentes estão anunciando e guarde as melhores referências para a equipe.</p>

      <section className="painel-cartao mt-6 p-5">
        <h2 className="font-display text-lg font-extrabold">Biblioteca de Anúncios da Meta</h2>
        <p className="mt-1 text-sm text-white/55">
          Busque por palavra, marca ou nome da página. Abre a biblioteca em outra aba, já filtrada (a Meta não deixa mostrar os anúncios aqui dentro).
        </p>
        <form action="https://www.facebook.com/ads/library/" method="get" target="_blank" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <input type="hidden" name="ad_type" value="all" />
          <input type="hidden" name="media_type" value="all" />
          <input type="hidden" name="search_type" value="keyword_unordered" />
          <label>
            <span className="painel-rotulo">O que procurar</span>
            <input name="q" required className="painel-campo" placeholder="Ex.: apartamento na planta, harmonização facial, nome do concorrente" />
          </label>
          <label>
            <span className="painel-rotulo">País</span>
            <select name="country" defaultValue="BR" className="painel-campo">
              {PAISES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Anúncios</span>
            <select name="active_status" defaultValue="active" className="painel-campo">
              <option value="active">Só os ativos</option>
              <option value="all">Ativos e antigos</option>
            </select>
          </label>
          <button className="botao-painel">Buscar ↗</button>
        </form>
        <p className="mt-4 text-xs tracking-wide text-white/45 uppercase">Atalhos por nicho (Brasil, ativos)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NICHOS.map((n) => (
            <a
              key={n}
              href={linkBibliotecaMeta(n, "BR")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-sm text-white/75 hover:border-white/30 hover:text-white"
            >
              {n}
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/55">
          Dica: anúncio ativo há muitas semanas costuma ser anúncio que dá resultado. Abra o anúncio, copie o link (“Ver detalhes do anúncio”) e cole
          no mural abaixo.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {OUTRAS.map((o) => (
            <a key={o.nome} href={o.link} target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-white">
              {o.nome} ↗
            </a>
          ))}
        </div>
      </section>

      <Detalhes className="painel-cartao mt-4 p-5" inicialAberto={referencias.length === 0 && !busca} resumo="+ Guardar referência">
        <FormComEstado acao={salvarReferencia} limparAoSalvar className="mt-4 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Título</span>
              <input name="titulo" required className="painel-campo" placeholder="Ex.: Vídeo de tour no decorado com prova social" />
            </label>
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Link do anúncio (Biblioteca, Instagram, TikTok...)</span>
              <input name="link" type="url" className="painel-campo" placeholder="https://www.facebook.com/ads/library/?id=..." />
            </label>
            <label>
              <span className="painel-rotulo">Nicho</span>
              <input name="nicho" className="painel-campo" placeholder="Ex.: imobiliária" list="nichos-referencia" />
              <datalist id="nichos-referencia">
                {NICHOS.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </label>
            <label>
              <span className="painel-rotulo">Anunciante</span>
              <input name="anunciante" className="painel-campo" placeholder="Nome da página/concorrente" />
            </label>
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Print (opcional, até 4 MB)</span>
              <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="painel-campo" />
            </label>
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Por que é uma boa referência</span>
              <textarea name="observacao" rows={3} className="painel-campo" placeholder="Gancho, oferta, formato, chamada... O que dá para adaptar para o nosso cliente?" />
            </label>
          </div>
          <div className="mt-5">
            <BotaoEnviar enviando="Guardando...">Guardar no mural</BotaoEnviar>
          </div>
        </FormComEstado>
      </Detalhes>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">Mural de referências ({referencias.length})</h2>
        <form className="flex gap-2" action="/painel/admin/pesquisa">
          <input name="busca" defaultValue={busca ?? ""} className="painel-campo !min-h-[38px] !w-56" placeholder="Filtrar por nicho, marca..." aria-label="Filtrar referências" />
          <button className="botao-painel botao-painel-sec !min-h-[38px]">Filtrar</button>
        </form>
      </div>

      {referencias.length === 0 ? (
        <p className="painel-cartao mt-4 p-5 text-white/55">{busca ? "Nada encontrado com esse filtro." : "Nenhuma referência guardada ainda."}</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {referencias.map((r) => (
            <article key={r.id} className="painel-cartao flex flex-col overflow-hidden">
              {r.imagem && (
                <a href={`/painel/midia/${r.imagem}`} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagem privada servida pela rota do painel */}
                  <img src={`/painel/midia/${r.imagem}`} alt="" className="aspect-[4/5] w-full bg-black/40 object-cover" loading="lazy" />
                </a>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap gap-1.5">
                  {r.nicho && <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">{r.nicho}</span>}
                  {r.anunciante && <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/70">{r.anunciante}</span>}
                </div>
                <h3 className="mt-2 font-semibold">{r.titulo}</h3>
                {r.observacao && <p className="mt-1 text-sm whitespace-pre-line text-white/65">{r.observacao}</p>}
                <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-white/45">
                  <span>
                    {r.autor ?? "Equipe"} · {dataHora(r.criado_em, "pt")}
                  </span>
                  <span className="flex items-center gap-3">
                    {r.link && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 underline underline-offset-2">
                        Abrir ↗
                      </a>
                    )}
                    <form action={excluirReferencia}>
                      <input type="hidden" name="id" value={r.id} />
                      <BotaoEnviar className="text-white/45 hover:text-[#ff6b72]" confirmar="Apagar esta referência?">
                        Apagar
                      </BotaoEnviar>
                    </form>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
