import { numeroLegivel } from "@/lib/painel/whatsapp";
import { q, type Agencia } from "@/lib/placar/banco";
import { contasDaAgencia, tokenDaAgencia } from "@/lib/placar/meta";
import { estadoWhatsapp } from "@/lib/placar/whatsapp";
import AtualizarSozinho from "@/app/painel/_ui/AtualizarSozinho";
import { desconectarMeta, desligarWhatsapp, ligarWhatsapp } from "../acoes";
import Form from "../_ui/Form";
import Enviar from "../_ui/Enviar";
import { botao, botaoSec } from "../_ui/estilo";

const Feito = () => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  </span>
);
const Numero = ({ n, ativo }: { n: number; ativo: boolean }) => (
  <span
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${ativo ? "bg-[#2F5BEA] text-white" : "bg-gray-100 text-gray-600"}`}
    aria-hidden="true"
  >
    {n}
  </span>
);

/** Passo/seção: conectar o Facebook (Meta) da agência. */
export async function ConexaoMeta({ agencia, passo, erro }: { agencia: Agencia; passo?: number; erro?: string }) {
  const conectado = Boolean(tokenDaAgencia(agencia));
  const contas = conectado ? await contasDaAgencia(agencia).catch(() => null) : [];
  const vencida = agencia.meta_token && !conectado;
  return (
    <div className="flex flex-wrap items-start gap-4">
      {conectado ? <Feito /> : passo ? <Numero n={passo} ativo /> : null}
      <div className="min-w-0 flex-[1_1_300px]">
        <h2 className="text-base font-semibold">Conectar o Facebook (Meta)</h2>
        {conectado ? (
          <p className="mt-0.5 text-sm text-gray-600">
            Conectado{agencia.meta_pessoa ? ` como ${agencia.meta_pessoa}` : ""}.{" "}
            {contas === null ? "Não consegui listar as contas agora." : `${contas.length} ${contas.length === 1 ? "conta de anúncio encontrada" : "contas de anúncio encontradas"}.`}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-gray-600">
            {vencida ? "A conexão venceu (a Meta pede para renovar a cada 60 dias). Conecte de novo." : "Para o Placar ler os números das campanhas. Só leitura: nada é alterado nos anúncios."}
          </p>
        )}
        {erro && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{erro}</p>}
      </div>
      {conectado ? (
        <form action={desconectarMeta}>
          <Enviar className={`${botaoSec} min-h-[40px] px-4 text-sm`} confirmar="Desconectar o Facebook? Os números param de atualizar.">
            Desconectar
          </Enviar>
        </form>
      ) : (
        <a href="/api/placar/meta?iniciar=1" className={botao}>
          Entrar com o Facebook
        </a>
      )}
    </div>
  );
}

/** Passo/seção: conectar o WhatsApp da agência pelo QR Code. */
export async function ConexaoWhatsapp({ agencia, passo }: { agencia: Agencia; passo?: number }) {
  const estado = await estadoWhatsapp(agencia.id);
  const conectado = estado.fase === "conectado";
  // Guarda o número conectado (aparece nas telas e libera os envios); limpa se caiu.
  if (conectado && estado.numero && estado.numero !== agencia.wa_numero) await q("update placar.agencias set wa_numero = $2 where id = $1", [agencia.id, estado.numero]);
  if (estado.fase === "desligado" && agencia.wa_numero) await q("update placar.agencias set wa_numero = null where id = $1", [agencia.id]);
  const aguardando = ["iniciando", "conectando", "qr"].includes(estado.fase);
  return (
    <div>
      {aguardando && <AtualizarSozinho segundos={4} />}
      <div className="flex flex-wrap items-start gap-4">
        {conectado ? <Feito /> : passo ? <Numero n={passo} ativo /> : null}
        <div className="min-w-0 flex-[1_1_300px]">
          <h2 className="text-base font-semibold">Conectar o seu WhatsApp</h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {conectado
              ? `Conectado: ${numeroLegivel(estado.numero)}. Relatórios e avisos saem deste número.`
              : "É por ele que os relatórios e avisos chegam aos seus clientes."}
          </p>
          {["fora", "sem-config"].includes(estado.fase) && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">O serviço de WhatsApp está fora do ar agora. Tente de novo em alguns minutos.</p>
          )}
          {estado.erro && estado.fase === "parada" && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{estado.erro}</p>}
        </div>
        {conectado ? (
          <form action={desligarWhatsapp}>
            <Enviar className={`${botaoSec} min-h-[40px] px-4 text-sm`} confirmar="Desconectar o WhatsApp? Relatórios e alertas param de sair.">
              Desconectar
            </Enviar>
          </form>
        ) : (
          !aguardando && (
            <Form acao={ligarWhatsapp}>
              <Enviar enviando="Gerando o código...">Mostrar o QR Code</Enviar>
            </Form>
          )
        )}
      </div>
      {aguardando && (
        <div className="mt-5 flex flex-wrap items-center gap-6">
          {estado.fase === "qr" && estado.qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- QR gerado na hora pelo serviço de WhatsApp
            <img src={estado.qr} alt="QR Code para conectar o WhatsApp" width={200} height={200} className="rounded-xl border border-gray-200 bg-white p-2" />
          ) : (
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-xl border border-dashed border-gray-400 bg-gray-50 text-sm text-gray-600">Gerando o código...</div>
          )}
          <ol className="min-w-0 flex-[1_1_240px] list-decimal space-y-1.5 pl-5 text-[15px] text-gray-700">
            <li>Abra o WhatsApp no celular</li>
            <li>Toque em Aparelhos conectados</li>
            <li>Toque em Conectar um aparelho e aponte para o código</li>
          </ol>
        </div>
      )}
    </div>
  );
}
