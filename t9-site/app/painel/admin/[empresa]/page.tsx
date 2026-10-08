import Link from "next/link";
import { notFound } from "next/navigation";
import { empresaPermitida, exigirEquipe } from "@/lib/painel/auth";
import { consulta } from "@/lib/painel/db";
import { hoje, itensDoPlano } from "@/lib/painel/dados";
import { dataHora, dinheiro, numero } from "@/lib/painel/formato";
import {
  adicionarItemPlano,
  atribuirGestor,
  convidar,
  criarPlanoPadrao,
  excluirEmpresa,
  excluirItemPlano,
  excluirMetrica,
  gerarLink,
  importarCsv,
  lancarMetrica,
  removerAcesso,
  salvarComentario,
  salvarEmpresa,
} from "../acoes";
import CamposEmpresa from "../CamposEmpresa";
import SecaoMeta from "../SecaoMeta";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import { mudarStatusPlano } from "../../acoes";
import { SelectAutoEnvio } from "../../_ui/Botoes";
import { STATUS_PLANO, TEXTOS_PAINEL } from "@/lib/painel/textos";

const PLATAFORMAS = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Outro"];

export default async function GestaoCliente({ params }: { params: Promise<{ empresa: string }> }) {
  const usuario = await exigirEquipe();
  const empresa = await empresaPermitida(usuario, (await params).empresa);
  if (!empresa) notFound();
  const admin = usuario.perfil === "admin";

  const [pessoas, recentes, plano, time] = await Promise.all([
    consulta<{ id: number; email: string; nome: string | null; perfil: string; ultimo_acesso: string | null }>(
      `select u.id, u.email, u.nome, u.perfil, u.ultimo_acesso from usuarios u join acessos a on a.usuario_id = u.id
        where a.empresa_id = $1 order by u.perfil desc, u.email`,
      [empresa.id],
    ),
    consulta<{ id: number; data: string; plataforma: string; campanha: string; gasto: number; impressoes: number; cliques: number; leads: number; conversoes: number; receita: number; origem: string }>(
      "select id, data, plataforma, campanha, gasto, impressoes, cliques, leads, conversoes, receita, origem from metricas where empresa_id = $1 order by data desc, gasto desc limit 20",
      [empresa.id],
    ),
    itensDoPlano(empresa.id),
    admin
      ? consulta<{ id: number; email: string; nome: string | null }>(
          `select id, email, nome from usuarios where perfil in ('gestor', 'admin')
             and id not in (select usuario_id from acessos where empresa_id = $1) order by email`,
          [empresa.id],
        )
      : Promise.resolve([]),
  ]);

  const $ = (v: number) => dinheiro(v, empresa.moeda, "pt");
  const n = (v: number) => numero(v, "pt");
  const ecommerce = empresa.tipo === "ecommerce";
  const tPlano = TEXTOS_PAINEL[empresa.idioma].plano;
  const clientes = pessoas.filter((p) => p.perfil === "cliente");
  const equipe = pessoas.filter((p) => p.perfil !== "cliente");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/painel/admin" className="text-sm text-white/50 hover:text-white">
            ← Carteira
          </Link>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{empresa.nome}</h1>
          <p className="mt-1 text-sm text-white/50">
            {ecommerce ? "E-commerce" : "Geração de leads"} · {empresa.pais} · {empresa.moeda} · painel em {empresa.idioma.toUpperCase()}
          </p>
        </div>
        <Link href={`/painel/${empresa.slug}`} className="botao-painel botao-painel-sec">
          Ver painel do cliente →
        </Link>
      </div>

      <SecaoMeta empresa={empresa} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Lançamento manual */}
        <FormComEstado acao={lancarMetrica} className="painel-cartao p-6">
          <h2 className="font-display text-lg font-extrabold">Lançar dados do dia</h2>
          <p className="mt-1 text-sm text-white/50">Mesmo dia + plataforma + campanha substitui o lançamento anterior.</p>
          <input type="hidden" name="empresa" value={empresa.id} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label>
              <span className="painel-rotulo">Data</span>
              <input type="date" name="data" required defaultValue={hoje()} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">Plataforma</span>
              <select name="plataforma" className="painel-campo">
                {PLATAFORMAS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="col-span-2">
              <span className="painel-rotulo">Campanha (opcional)</span>
              <input name="campanha" className="painel-campo" placeholder="Deixe vazio para o total do dia" />
            </label>
            <Campo nome="gasto" rotulo={`Investimento (${empresa.moeda})`} />
            <Campo nome="impressoes" rotulo="Impressões" />
            <Campo nome="cliques" rotulo="Cliques" />
            {ecommerce ? (
              <>
                <Campo nome="conversoes" rotulo="Vendas" />
                <Campo nome="receita" rotulo={`Receita (${empresa.moeda})`} />
              </>
            ) : (
              <Campo nome="leads" rotulo="Leads" />
            )}
          </div>
          <BotaoEnviar enviando="Salvando..." className="botao-painel mt-5">
            Salvar
          </BotaoEnviar>
        </FormComEstado>

        <div className="grid content-start gap-4">
          {/* Importação CSV */}
          <FormComEstado acao={importarCsv} limparAoSalvar className="painel-cartao p-6">
            <h2 className="font-display text-lg font-extrabold">Importar planilha (CSV)</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/50">
              Use o{" "}
              <a href="/painel/admin/modelo-csv" download className="text-[#ff8a90] underline">
                modelo da T9
              </a>{" "}
              ou exporte do Gerenciador de Anúncios da Meta / Google Ads com quebra por dia (colunas de data, campanha, valor
              usado, impressões, cliques e resultados). Dias já lançados são substituídos.
            </p>
            <input type="hidden" name="empresa" value={empresa.id} />
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input type="file" name="arquivo" accept=".csv,text/csv,text/plain" required className="painel-campo !py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white" />
              <select name="plataforma" className="painel-campo" aria-label="Plataforma, se a planilha não tiver essa coluna">
                {PLATAFORMAS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <BotaoEnviar enviando="Importando..." className="botao-painel mt-4">
              Importar
            </BotaoEnviar>
          </FormComEstado>

          {/* Comentário */}
          <FormComEstado acao={salvarComentario} className="painel-cartao p-6">
            <h2 className="font-display text-lg font-extrabold">Palavra do gestor</h2>
            <p className="mt-1 text-sm text-white/50">Aparece no topo da visão geral do cliente. Deixe vazio para remover.</p>
            <input type="hidden" name="empresa" value={empresa.id} />
            <textarea
              name="comentario"
              rows={4}
              defaultValue={empresa.comentario ?? ""}
              className="painel-campo mt-4"
              placeholder="Ex.: Semana com CPL 18% menor depois da troca de criativos. Próximo passo: escalar o conjunto de lookalike."
            />
            <BotaoEnviar enviando="Publicando..." className="botao-painel mt-4">
              Publicar
            </BotaoEnviar>
          </FormComEstado>
        </div>
      </div>

      {/* Acessos */}
      <section className="painel-cartao mt-4 p-6">
        <h2 className="font-display text-lg font-extrabold">Quem acessa este painel</h2>
        {pessoas.length === 0 && <p className="mt-2 text-sm text-white/50">Ninguém ainda. Libere o acesso do cliente abaixo.</p>}
        <ul className="mt-3 divide-y divide-white/6">
          {[...clientes, ...equipe].map((p) => (
            <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.nome ?? p.email}</p>
                <p className="truncate text-xs text-white/50">
                  {p.nome ? `${p.email} · ` : ""}
                  {p.perfil === "cliente" ? "Cliente" : p.perfil === "admin" ? "Admin T9" : "Gestor T9"} ·{" "}
                  {p.ultimo_acesso ? `último acesso ${dataHora(p.ultimo_acesso, "pt")}` : "ainda não entrou"}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                {p.perfil === "cliente" && (
                  <FormComEstado acao={gerarLink} className="max-w-md">
                    <input type="hidden" name="empresa" value={empresa.id} />
                    <input type="hidden" name="usuario" value={p.id} />
                    <BotaoEnviar enviando="Gerando..." className="botao-painel botao-painel-sec !min-h-[34px] !px-3 !text-xs">
                      Gerar link de acesso
                    </BotaoEnviar>
                  </FormComEstado>
                )}
                {(p.perfil === "cliente" || admin) && (
                  <form action={removerAcesso}>
                    <input type="hidden" name="empresa" value={empresa.id} />
                    <input type="hidden" name="usuario" value={p.id} />
                    <BotaoEnviar className="px-2 py-2 text-xs text-[#ff8a90] hover:underline" confirmar={`Tirar o acesso de ${p.email} a ${empresa.nome}?`}>
                      Remover
                    </BotaoEnviar>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>

        <FormComEstado acao={convidar} limparAoSalvar className="mt-4 rounded-2xl border border-white/8 p-4">
          <h3 className="font-display font-extrabold">Liberar acesso para o cliente</h3>
          <input type="hidden" name="empresa" value={empresa.id} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="painel-rotulo">E-mail</span>
              <input name="email" type="email" required className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">Nome (opcional)</span>
              <input name="nome" className="painel-campo" />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" name="enviar" defaultChecked className="h-4 w-4 accent-[#e3121c]" />
            Enviar o convite por e-mail (o link também aparece aqui para mandar pelo WhatsApp)
          </label>
          <BotaoEnviar enviando="Liberando..." className="botao-painel mt-4">
            Liberar acesso
          </BotaoEnviar>
        </FormComEstado>

        {admin && time.length > 0 && (
          <form action={atribuirGestor} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="empresa" value={empresa.id} />
            <label className="min-w-60 flex-1">
              <span className="painel-rotulo">Atribuir gestor da T9</span>
              <select name="usuario" className="painel-campo">
                {time.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome ? `${m.nome} (${m.email})` : m.email}
                  </option>
                ))}
              </select>
            </label>
            <BotaoEnviar className="botao-painel botao-painel-sec">Atribuir</BotaoEnviar>
          </form>
        )}
      </section>

      {/* Plano */}
      <section className="painel-cartao mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold">Plano de 4 semanas</h2>
          {plano.length === 0 && (
            <form action={criarPlanoPadrao}>
              <input type="hidden" name="empresa" value={empresa.id} />
              <BotaoEnviar className="botao-painel botao-painel-sec">Criar com os itens padrão</BotaoEnviar>
            </form>
          )}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((semana) => (
            <div key={semana} className="rounded-2xl border border-white/8 p-4">
              <p className="font-display text-sm font-extrabold text-[#ff4550]">Semana {semana}</p>
              <p className="font-display font-extrabold">{tPlano.semanas[semana - 1]}</p>
              <ul className="mt-3 grid gap-2">
                {plano
                  .filter((i) => i.semana === semana)
                  .map((i) => (
                    <li key={i.id} className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1">{i.titulo}</span>
                      <form action={mudarStatusPlano}>
                        <input type="hidden" name="item" value={i.id} />
                        <SelectAutoEnvio
                          name="status"
                          valor={i.status}
                          rotulo={i.titulo}
                          opcoes={STATUS_PLANO.map((s) => ({ valor: s, rotulo: TEXTOS_PAINEL.pt.plano.status[s] }))}
                        />
                      </form>
                      <form action={excluirItemPlano}>
                        <input type="hidden" name="item" value={i.id} />
                        <BotaoEnviar className="px-1 text-white/40 hover:text-[#ff8a90]" confirmar={`Excluir "${i.titulo}"?`}>
                          <span aria-hidden="true">✕</span>
                          <span className="sr-only">Excluir {i.titulo}</span>
                        </BotaoEnviar>
                      </form>
                    </li>
                  ))}
              </ul>
              <form action={adicionarItemPlano} className="mt-3 flex gap-2">
                <input type="hidden" name="empresa" value={empresa.id} />
                <input type="hidden" name="semana" value={semana} />
                <input name="titulo" required placeholder="Novo item" className="painel-campo !min-h-[36px] !py-1.5 !text-sm" aria-label={`Novo item na semana ${semana}`} />
                <BotaoEnviar className="botao-painel botao-painel-sec !min-h-[36px] !px-3">+</BotaoEnviar>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Lançamentos recentes */}
      <section className="painel-cartao mt-4 overflow-hidden">
        <h2 className="px-6 pt-6 font-display text-lg font-extrabold">Últimos lançamentos</h2>
        {recentes.length === 0 ? (
          <p className="px-6 pt-2 pb-6 text-sm text-white/50">Nenhum dado lançado ainda.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="painel-tabela w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Plataforma / campanha</th>
                  <th className="text-right">Invest.</th>
                  <th className="text-right">Impr.</th>
                  <th className="text-right">Cliques</th>
                  <th className="text-right">{ecommerce ? "Vendas" : "Leads"}</th>
                  {ecommerce && <th className="text-right">Receita</th>}
                  <th>Origem</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recentes.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap">{m.data.split("-").reverse().join("/")}</td>
                    <td>
                      {m.plataforma}
                      {m.campanha && <span className="block text-xs text-white/45">{m.campanha}</span>}
                    </td>
                    <td className="text-right tabular-nums">{$(m.gasto)}</td>
                    <td className="text-right tabular-nums">{n(m.impressoes)}</td>
                    <td className="text-right tabular-nums">{n(m.cliques)}</td>
                    <td className="text-right tabular-nums">{n(ecommerce ? m.conversoes : m.leads)}</td>
                    {ecommerce && <td className="text-right tabular-nums">{$(m.receita)}</td>}
                    <td className="text-xs text-white/45">{m.origem}</td>
                    <td className="text-right">
                      <form action={excluirMetrica}>
                        <input type="hidden" name="metrica" value={m.id} />
                        <BotaoEnviar className="text-xs text-white/40 hover:text-[#ff8a90]" confirmar="Excluir este lançamento?">
                          Excluir
                        </BotaoEnviar>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dados e metas */}
      <FormComEstado acao={salvarEmpresa} className="painel-cartao mt-4 p-6">
        <h2 className="mb-4 font-display text-lg font-extrabold">Dados e metas</h2>
        <input type="hidden" name="empresa" value={empresa.id} />
        <CamposEmpresa empresa={empresa} />
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-6">
          Salvar dados e metas
        </BotaoEnviar>
      </FormComEstado>

      {admin && (
        <details className="painel-cartao mt-4 p-6">
          <summary className="cursor-pointer text-sm text-[#ff8a90]">Excluir cliente</summary>
          <form action={excluirEmpresa} className="mt-4">
            <p className="text-sm text-white/60">
              Apaga o cliente com todas as métricas, leads, plano e acessos. Não dá para desfazer. Digite{" "}
              <strong className="text-white">{empresa.slug}</strong> para confirmar.
            </p>
            <input type="hidden" name="empresa" value={empresa.id} />
            <div className="mt-3 flex gap-3">
              <input name="confirmacao" required className="painel-campo max-w-xs" autoComplete="off" />
              <BotaoEnviar className="botao-painel">Excluir definitivamente</BotaoEnviar>
            </div>
          </form>
        </details>
      )}
    </>
  );
}

function Campo({ nome, rotulo }: { nome: string; rotulo: string }) {
  return (
    <label>
      <span className="painel-rotulo">{rotulo}</span>
      <input name={nome} inputMode="decimal" className="painel-campo" placeholder="0" />
    </label>
  );
}
