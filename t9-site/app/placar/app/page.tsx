import Link from "next/link";
import type { Metadata } from "next";
import { dinheiro, numero } from "@/lib/painel/formato";
import { hoje, somarDias } from "@/lib/painel/dados";
import { DIAS_SEMANA } from "@/lib/painel/relatorioWhatsapp";
import { q } from "@/lib/placar/banco";
import { exigirAcesso, limiteDeClientes } from "@/lib/placar/conta";
import { botao, botaoSec, cartao } from "../_ui/estilo";

export const metadata: Metadata = { title: "Clientes" };

type Linha = {
  id: number;
  nome: string;
  moeda: string;
  tipo: string;
  meta_conta: string | null;
  conta_alerta: string | null;
  erro_meta: string | null;
  rel_ativo: boolean;
  rel_frequencia: string;
  rel_dia_semana: number;
  rel_dia_mes: number;
  rel_hora: number;
  gasto: number;
  leads: number;
  receita: number;
  conversoes: number;
};

const quando = (c: Linha) =>
  !c.rel_ativo
    ? "Relatório desligado"
    : `Relatório ${c.rel_frequencia === "diario" ? "todo dia" : c.rel_frequencia === "semanal" ? `toda ${DIAS_SEMANA[c.rel_dia_semana].toLowerCase()}` : `todo dia ${c.rel_dia_mes}`}, ${c.rel_hora}h`;

export default async function InicioApp() {
  const { usuario, agencia } = await exigirAcesso();
  const fim = somarDias(hoje(), -1);
  const clientes = await q<Linha>(
    `select c.id, c.nome, c.moeda, c.tipo, c.meta_conta, c.conta_alerta, c.erro_meta, c.rel_ativo, c.rel_frequencia, c.rel_dia_semana, c.rel_dia_mes, c.rel_hora,
            coalesce(sum(m.gasto), 0) as gasto, coalesce(sum(m.leads), 0)::int as leads, coalesce(sum(m.receita), 0) as receita, coalesce(sum(m.conversoes), 0)::int as conversoes
       from placar.clientes c left join placar.metricas m on m.cliente_id = c.id and m.data between $2 and $3
      where c.agencia_id = $1 group by c.id order by c.nome`,
    [agencia.id, somarDias(fim, -6), fim],
  );
  const pendencias = [
    ...(!agencia.meta_token ? [{ id: "meta", nome: "Facebook não conectado", texto: "Conecte para puxar os números das campanhas.", acao: "Conectar", href: "/placar/app/config" }] : []),
    ...(!agencia.wa_numero ? [{ id: "wa", nome: "WhatsApp não conectado", texto: "Sem ele, relatórios e alertas não saem.", acao: "Conectar", href: "/placar/app/config" }] : []),
    ...clientes
      .filter((c) => c.conta_alerta || c.erro_meta)
      .map((c) => ({ id: `c${c.id}`, nome: c.nome, texto: (c.conta_alerta ?? c.erro_meta)!, acao: "Ver cliente", href: `/placar/app/clientes/${c.id}` })),
  ];
  const primeiro = (usuario.nome ?? "").split(" ")[0];
  const cheio = clientes.length >= limiteDeClientes(agencia);

  if (!clientes.length) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Olá{primeiro ? `, ${primeiro}` : ""}!</h1>
        <p className="mt-2 text-gray-600">Vamos deixar tudo pronto em 3 passos.</p>
        <Link href="/placar/app/comecar" className={`${botao} mt-6`}>
          Começar a configuração
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Olá{primeiro ? `, ${primeiro}` : ""}</h1>
          <p className="mt-1 text-[15px] text-gray-600">
            {pendencias.length ? `${pendencias.length === 1 ? "1 coisa precisa" : `${pendencias.length} coisas precisam`} de você.` : "Tudo em dia."}
          </p>
        </div>
        {cheio ? (
          <Link href="/placar/app/plano" className={botaoSec}>
            Limite do plano atingido
          </Link>
        ) : (
          <Link href="/placar/app/clientes/novo" className={botao}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Adicionar cliente
          </Link>
        )}
      </div>

      {pendencias.length > 0 && (
        <section aria-labelledby="atencao" className={`${cartao} mt-6`}>
          <h2 id="atencao" className="border-b border-gray-100 px-5 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Precisa de atenção
          </h2>
          <ul>
            {pendencias.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3.5 last:border-0">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />
                <div className="min-w-0 flex-[1_1_320px]">
                  <p className="font-semibold">{p.nome}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{p.texto}</p>
                </div>
                <Link href={p.href} className={`${botaoSec} min-h-[40px] px-4 text-sm`}>
                  {p.acao}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-8 text-lg font-bold">Seus clientes</h2>
      <p className="text-sm text-gray-500">Últimos 7 dias</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clientes.map((c) => {
          const ecommerce = c.tipo === "ecommerce";
          const selo = c.conta_alerta || c.erro_meta ? ["Atenção", "bg-red-50 text-red-800"] : !c.meta_conta ? ["Sem conta", "bg-gray-100 text-gray-700"] : ["Em dia", "bg-green-50 text-green-800"];
          return (
            <Link key={c.id} href={`/placar/app/clientes/${c.id}`} className={`${cartao} block p-5 transition hover:border-gray-300 hover:shadow-sm`}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold">{c.nome}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${selo[1]}`}>{selo[0]}</span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <div>
                  <dt className="text-xs text-gray-500">Investido</dt>
                  <dd className="mt-0.5 font-semibold">{dinheiro(c.gasto, c.moeda, "pt", true)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">{ecommerce ? "Vendas" : "Leads"}</dt>
                  <dd className="mt-0.5 font-semibold">{numero(ecommerce ? c.conversoes : c.leads, "pt")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">{ecommerce ? "Retorno" : "Por lead"}</dt>
                  <dd className="mt-0.5 font-semibold">
                    {ecommerce ? (c.gasto ? (c.receita / c.gasto).toFixed(2).replace(".", ",") : "–") : c.leads ? dinheiro(c.gasto / c.leads, c.moeda, "pt") : "–"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-gray-100 pt-3 text-[13px] text-gray-600">{quando(c)}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
