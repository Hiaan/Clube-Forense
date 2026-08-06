// Dashboard: o estado do monitor numa tela.

import Link from "next/link";

import BotaoImportar from "../BotaoImportar";
import Barras, { type Barra } from "../graficos/Barras";
import { Cartao, Numero } from "../graficos/Cartao";
import LinhaLeads from "../graficos/LinhaLeads";
import { lerEstados, type EstadoCuradoria } from "../../lib/estadosRepo";
import { leadsPorDia, listarLeads, resumoLeads } from "../../lib/leadsRepo";
import { lerUltimaColeta, type Coleta } from "../../lib/sistemaRepo";
import { ESTADO_POR_UF } from "../../monitor/lib/estados";
import { NIVEL_COR, NIVEL_LABEL, type Nivel } from "../../monitor/lib/tipos";

export const dynamic = "force-dynamic";

/** Funil do edital, do mais avançado ao mais incipiente. */
const FUNIL: Nivel[] = [
  "edital", "banca", "comissao", "autorizado", "solicitado", "estudo", "noticia", "sem",
];

/** A caminho: já saiu do papel, ainda não virou edital. */
const A_CAMINHO: Nivel[] = ["banca", "comissao", "autorizado", "solicitado"];

/** Depois disto, a conferência humana está velha. */
const DIAS_PARA_CONFERIR = 60;

/** Acima disto, a coleta automática provavelmente parou. */
const HORAS_COLETA_ATRASADA = 6;

/** True quando a coleta automática passou do intervalo esperado. */
function coletaAtrasada(iso: string): boolean {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000 > HORAS_COLETA_ATRASADA;
}

/** "há 40 minutos", "há 3 horas", "há 2 dias" — do jeito que se fala. */
function haQuantoTempo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 2) return "agora";
  if (min < 60) return `há ${min} minutos`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function dias(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86_400_000);
}

function dataBr(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function nome(uf: string): string {
  return ESTADO_POR_UF[uf]?.nome ?? uf;
}

export default async function Dashboard() {
  const [estados, resumo, porDia, recentes, coleta] = await Promise.all([
    lerEstados(),
    resumoLeads(),
    leadsPorDia(14),
    listarLeads(5),
    lerUltimaColeta(),
  ]);

  if (estados === null) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Banco indisponível. Confira a variável <code>DATABASE_URL</code> do projeto
          na Vercel — enquanto isso o site está usando a curadoria embutida no código.
        </div>
      </>
    );
  }

  const total = estados.length;
  const conta = (n: Nivel) => estados.filter((e) => e.etapa === n).length;
  const comEdital = conta("edital");
  const aCaminho = estados.filter((e) => A_CAMINHO.includes(e.etapa)).length;

  const atrasados = estados
    .map((e) => ({ e, d: dias(e.verificadoEm) }))
    .filter(({ d }) => d === null || d > DIAS_PARA_CONFERIR)
    .sort((a, b) => (b.d ?? 9e9) - (a.d ?? 9e9));

  const serie = porDia ?? [];
  const ultimos7 = serie.slice(-7).reduce((s, d) => s + d.total, 0);
  const totalLeads = resumo?.total ?? 0;

  // Prazos: o que tem data marcada daqui para a frente, do mais próximo.
  const hoje = new Date().toISOString().slice(0, 10);
  const prazos = estados
    .flatMap((e: EstadoCuradoria) => [
      ...(e.inscricoesAte && e.inscricoesAte >= hoje
        ? [{ uf: e.uf, quando: e.inscricoesAte, o_que: "Inscrições até" }]
        : []),
      ...(e.dataProva && e.dataProva >= hoje
        ? [{ uf: e.uf, quando: e.dataProva, o_que: "Prova" }]
        : []),
    ])
    .sort((a, b) => a.quando.localeCompare(b.quando))
    .slice(0, 6);

  const funil: Barra[] = FUNIL.map((n) => ({
    chave: n,
    rotulo: NIVEL_LABEL[n],
    valor: conta(n),
    cor: NIVEL_COR[n],
    href: "/admin/estados",
  })).filter((b) => b.valor > 0);

  const origem: Barra[] = (resumo?.porUf ?? []).slice(0, 6).map((u) => ({
    chave: u.uf,
    rotulo: `${u.uf} · ${nome(u.uf)}`,
    valor: u.total,
    cor: "#2563eb",
  }));

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Como está o monitor dos 27 estados e quem chegou pelo mapa.
          </p>
        </div>
        <Link
          href="/admin/estados"
          className="rounded-xl bg-[#ffcd07] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#e6b800]"
        >
          Editar estados
        </Link>
      </header>

      {total === 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-800">
            O banco está vazio. Importe a planilha para trazer os 27 estados — até
            lá, o site usa a curadoria embutida no código.
          </p>
          <BotaoImportar />
        </div>
      )}

      <ChecagemDoSistema coleta={coleta} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Numero
          rotulo="Editais abertos"
          valor={comEdital}
          rodape={`de ${total || 27} estados`}
          icone="estrela"
          destaque
        />
        <Numero
          rotulo="A caminho"
          valor={aCaminho}
          rodape="da solicitação à banca definida"
          icone="mapa"
        />
        <Numero
          rotulo="Cadastros pelo mapa"
          valor={totalLeads}
          rodape={`${ultimos7} nos últimos 7 dias`}
          icone="pessoas"
        />
        <Numero
          rotulo="A conferir"
          valor={atrasados.length}
          rodape={`sem conferência há mais de ${DIAS_PARA_CONFERIR} dias`}
          icone="relogio"
        />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
        <Cartao
          titulo="Cadastros nos últimos 14 dias"
          descricao={
            porDia === null ? "Não consegui ler o banco agora." : "Passe o mouse para ver o dia."
          }
          className="xl:col-span-2"
        >
          <LinhaLeads dados={serie} />
        </Cartao>

        <Cartao titulo="Estágio dos estados" descricao="As mesmas cores do mapa.">
          <Barras barras={funil} vazio="Importe a planilha para ver o funil." />
        </Cartao>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
        <Cartao titulo="Prazos à vista" descricao="Inscrições e provas já marcadas.">
          {prazos.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Nenhuma data marcada no momento.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {prazos.map((p) => (
                <li key={`${p.uf}-${p.o_que}`} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    href={`/admin/estados/${p.uf}`}
                    className="min-w-0 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <span className="font-mono text-xs font-bold text-gray-400">{p.uf}</span>{" "}
                    {p.o_que}
                  </Link>
                  <span className="shrink-0 text-sm font-medium text-gray-900">
                    {dataBr(p.quando)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Precisam de conferência" descricao="Do mais esquecido para o menos.">
          {atrasados.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Todos conferidos nos últimos {DIAS_PARA_CONFERIR} dias.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {atrasados.slice(0, 6).map(({ e, d }) => (
                <li key={e.uf} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    href={`/admin/estados/${e.uf}`}
                    className="min-w-0 truncate text-sm text-gray-700 hover:text-gray-900"
                  >
                    <span className="font-mono text-xs font-bold text-gray-400">{e.uf}</span>{" "}
                    {nome(e.uf)}
                  </Link>
                  <span className="shrink-0 text-xs text-gray-400">
                    {d === null ? "nunca" : `há ${d} dias`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao
          titulo="De onde vêm os leads"
          descricao="Estado que a pessoa tentou abrir."
        >
          <Barras barras={origem} vazio="Nenhum cadastro com estado ainda." />
        </Cartao>
      </div>

      <Cartao
        titulo="Cadastros recentes"
        className="mt-4"
        acao={
          <Link href="/admin/leads" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
            Ver todos →
          </Link>
        }
      >
        {!recentes || recentes.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Nenhum cadastro ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {recentes.map((l) => (
              <li key={l.email} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{l.nome}</p>
                  <p className="truncate text-xs text-gray-500">{l.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {l.ufInteresse && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono font-bold text-gray-600">
                      {l.ufInteresse}
                    </span>
                  )}
                  {dataBr(l.criadoEm)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </>
  );
}

/**
 * Quando o robô buscou notícias pela última vez.
 *
 * É outra data que a de "conferido em", que é quando VOCÊ olhou. Ela vem do
 * cron, não da montagem da página: enquanto isto não existia, a tela mostrava a
 * hora em que a página foi montada, e podia dizer "agora" exibindo notícia de
 * uma hora atrás.
 */
function ChecagemDoSistema({ coleta }: { coleta: Coleta | null }) {
  if (!coleta) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <strong>O sistema ainda não checou notícias sozinho.</strong> A rotina
        horária existe, mas só passa a funcionar quando a variável{" "}
        <code>MONITOR_BASE_URL</code> estiver definida no GitHub, em Settings →
        Secrets and variables → Actions → Variables. Até lá, as notícias só são
        buscadas quando alguém abre o site.
      </div>
    );
  }

  const atrasada = coletaAtrasada(coleta.em);

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-sm ${
        atrasada
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <span>
        Última checagem do sistema:{" "}
        <strong className="text-gray-900">{haQuantoTempo(coleta.em)}</strong>
        {atrasada && " — a rotina horária pode ter parado."}
      </span>
      <span className="text-xs text-gray-400">
        {coleta.fonteIndisponivel
          ? "nenhuma fonte externa respondeu nessa rodada"
          : `${coleta.estadosComNovidade} estados com novidade`}
      </span>
    </div>
  );
}
