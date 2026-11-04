/**
 * Ponte do WhatsApp da T9.
 *
 * Um processo sempre ligado, conectado ao WhatsApp como "aparelho conectado" (o mesmo QR do
 * WhatsApp Web). Serve só para o painel mandar mensagens:
 *   - pelo número da T9: o aviso de lead novo no WhatsApp do cliente;
 *   - pelo número de cada cliente que conectou o próprio WhatsApp no painel: a primeira
 *     mensagem para o lead, saindo do celular do próprio cliente.
 *
 * Não guarda conversas, não baixa histórico nem responde nada: mensagens recebidas são ignoradas
 * e continuam aparecendo normalmente no celular de cada número.
 *
 * Rotas (todas exigem "Authorization: Bearer <PONTE_SEGREDO>"):
 *   GET  /estado                  número da T9: fase, número conectado e o QR (imagem) quando houver
 *   POST /enviar                  { numero, texto } pelo número da T9
 *   POST /reconectar              volta a tentar depois de três quedas seguidas
 *   POST /sair                    desconecta o número da T9 (sai um QR novo)
 *   GET  /clientes/<id>/estado    o mesmo, para o WhatsApp de um cliente
 *   POST /clientes/<id>/conectar  liga a sessão do cliente (gera o QR, se ainda não conectou)
 *   POST /clientes/<id>/enviar    { numero, texto } pelo WhatsApp do cliente
 *   POST /clientes/<id>/sair      desconecta e apaga a sessão do cliente
 */
import { timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import makeWASocket, { Browsers, DisconnectReason, jidNormalizedUser, useMultiFileAuthState as abrirSessao } from "baileys";
import QRCode from "qrcode";

// PORT: o nome que as plataformas de nuvem (Railway, Render, Fly) usam para dizer a porta.
const PORTA = Number(process.env.PONTE_PORTA || process.env.PORT || 3100);
const SEGREDO = (process.env.PONTE_SEGREDO || "").trim();
const SESSAO = path.resolve(process.env.PONTE_SESSAO || ".data/sessao");
/** Sessões dos clientes, uma pasta por cliente (no mesmo volume da sessão da T9). */
const CLIENTES = path.resolve(process.env.PONTE_CLIENTES || path.join(path.dirname(SESSAO), "clientes"));
/** Teto de WhatsApps de clientes ligados ao mesmo tempo: cada um ocupa memória do servidor. */
const MAX_CLIENTES = Number(process.env.PONTE_MAX_CLIENTES || 20);
/** Intervalo mínimo entre duas mensagens do mesmo número: rajada é o que mais chama atenção do WhatsApp. */
const INTERVALO = Number(process.env.PONTE_INTERVALO_MS || 4000);
const TENTATIVAS = 3;
/** Quanto tempo um QR de cliente fica sendo renovado sem ninguém ler, antes de a ponte desistir. */
const ESPERA_QR_MS = Number(process.env.PONTE_ESPERA_QR_MS || 3 * 60_000);
/** Onde está o painel (para avisar o endereço do túnel) e o painel de métricas do cloudflared. */
const PAINEL = (process.env.PAINEL_URL || "https://t9company.com.br").replace(/\/$/, "");
const TUNEL = (process.env.TUNEL_METRICAS || "").replace(/\/$/, "");
/** Na nuvem a ponte já tem endereço fixo (ex.: https://t9-ponte.up.railway.app): ela informa este, sem túnel. */
const URL_PUBLICA = (process.env.PONTE_URL_PUBLICA || "").replace(/\/$/, "");
/** De quantos em quantos minutos a ponte pede ao painel para buscar leads novos e enviar. */
const ROTINA_MIN = Math.max(2, Number(process.env.PONTE_ROTINA_MIN || 5));

if (SEGREDO.length < 32) {
  console.error("Defina PONTE_SEGREDO com pelo menos 32 caracteres (ex.: openssl rand -hex 32).");
  process.exit(1);
}

// A biblioteca de criptografia despeja o estado das sessões no console a cada troca de chave: isso não vai para o registro.
console.info = () => {};
console.debug = () => {};
const calado = { level: "silent", child: () => calado, trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {} };
const log = (...a) => console.log(new Date().toISOString(), "[ponte]", ...a);

/* ----------------------------------------------------------------- conexão */

/**
 * Uma conexão com o WhatsApp: a do número da T9 ou a de um cliente. Cada uma tem a própria
 * pasta de sessão, o próprio estado e a própria fila de envio (o intervalo vale por número).
 */
class Sessao {
  constructor({ id, pasta, cliente }) {
    this.id = id;
    this.pasta = pasta;
    this.cliente = cliente;
    this.sock = null;
    this.quedas = 0;
    this.qrDesde = 0;
    this.ligada = false;
    this.fila = Promise.resolve();
    this.ultimoEnvio = 0;
    this.estado = { fase: "desligado", qr: "", numero: "", nome: "", desde: "", erro: "" };
  }

  get rotulo() {
    return this.cliente ? `cliente ${this.id}` : "T9";
  }

  async conectar() {
    this.ligada = true;
    await fs.mkdir(this.pasta, { recursive: true });
    const { state, saveCreds } = await abrirSessao(this.pasta);
    this.estado.fase = "conectando";
    const sock = makeWASocket({
      auth: state,
      logger: calado,
      // Sempre como navegador: outra identidade faz o WhatsApp derrubar a conexão antes do QR, em laço.
      browser: Browsers.ubuntu("Chrome"),
      // Só envio: nada de histórico.
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      markOnlineOnConnect: false,
      getMessage: async () => undefined,
    });
    this.sock = sock;
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      if (sock !== this.sock) return;
      if (qr) {
        if (!this.qrDesde) {
          this.qrDesde = Date.now();
          // Cliente que abriu o QR e foi embora: depois de alguns minutos a ponte para de gerar QR
          // e apaga a sessão que nunca foi pareada.
          if (this.cliente) {
            setTimeout(() => {
              if (this.sock !== sock || this.estado.fase === "conectado") return;
              void this.desligar("o QR Code venceu sem ser lido; clique em Conectar de novo")
                .then(() => (state.creds.me ? undefined : fs.rm(this.pasta, { recursive: true, force: true })))
                .catch(() => {});
            }, ESPERA_QR_MS);
          }
        }
        this.estado.fase = "qr";
        this.estado.qr = await QRCode.toDataURL(qr, { margin: 1, width: 320 }).catch(() => "");
        if (!this.cliente) {
          // O mesmo QR no terminal (docker compose logs ponte), para quando o painel não abrir.
          const texto = await QRCode.toString(qr, { type: "terminal", small: true }).catch(() => "");
          if (texto) log(`QR Code para conectar o número da T9 (vale ~20 s):\n${texto}`);
        }
      }
      if (connection === "open") {
        this.quedas = 0;
        this.qrDesde = 0;
        Object.assign(this.estado, { fase: "conectado", qr: "", erro: "", desde: new Date().toISOString() });
        this.estado.numero = jidNormalizedUser(sock.user.id).split("@")[0];
        this.estado.nome = sock.user.name || "";
        log(this.rotulo, "conectado como", this.estado.numero);
      }
      if (connection === "close") {
        const codigo = lastDisconnect?.error?.output?.statusCode;
        this.estado.numero = "";
        this.estado.nome = "";
        if (codigo === DisconnectReason.loggedOut) {
          // Desconectado pelo celular ou pelo painel: a sessão antiga não serve mais.
          await fs.rm(this.pasta, { recursive: true, force: true });
          if (this.cliente) {
            // O cliente reconecta pelo painel quando quiser; a ponte não fica gerando QR sozinha.
            this.ligada = false;
            this.sock = null;
            Object.assign(this.estado, { fase: "desligado", qr: "", erro: "o WhatsApp foi desconectado pelo celular" });
            return void log(this.rotulo, "desconectado pelo celular");
          }
        }
        if (!this.ligada) return;
        // Sair e "reinicie" (o que o WhatsApp pede logo depois de ler o QR) são passos normais; o resto é queda.
        // Ainda sem pareamento, a queda é o QR que venceu sem ninguém ler: sai um QR novo, sem contar como falha.
        const normal = codigo === DisconnectReason.loggedOut || codigo === DisconnectReason.restartRequired || !state.creds.me;
        this.quedas = normal ? 0 : this.quedas + 1;
        // Três quedas seguidas e a sessão para: insistir contra o WhatsApp não resolve e pode custar o número.
        if (this.quedas >= TENTATIVAS) {
          this.estado.fase = "parada";
          this.estado.erro = `a conexão caiu ${this.quedas} vezes seguidas (${codigo ?? "sem código"}) e parei de tentar`;
          return void log(this.rotulo, this.estado.erro, lastDisconnect?.error?.message || "");
        }
        const espera = normal ? 2000 : 5000 * this.quedas;
        this.estado.fase = "conectando";
        this.estado.erro = normal ? "" : `conexão caiu (${codigo ?? "sem código"}); tentativa ${this.quedas}`;
        if (!normal) log(this.rotulo, this.estado.erro, lastDisconnect?.error?.message || "");
        setTimeout(() => {
          if (this.ligada) this.conectar().catch((e) => log(this.rotulo, "não reconectou", e?.message || e));
        }, espera);
      }
    });
  }

  /** Para a sessão sem apagar o pareamento (o QR venceu, ou a ponte vai desligar). */
  async desligar(erro = "") {
    this.ligada = false;
    const sock = this.sock;
    this.sock = null;
    this.qrDesde = 0;
    Object.assign(this.estado, { fase: "desligado", qr: "", numero: "", nome: "", erro });
    try {
      sock?.end(undefined);
    } catch {}
  }

  /** Desconecta o número e apaga a sessão (o celular deixa de mostrar o aparelho conectado). */
  async sair() {
    const sock = this.sock;
    this.ligada = false;
    if (sock && this.estado.fase === "conectado") await sock.logout().catch(() => {});
    await this.desligar();
    await fs.rm(this.pasta, { recursive: true, force: true });
  }

  /**
   * "+<país><número>" vale como está (o painel sempre manda assim); sem "+", 10 ou 11 dígitos são
   * um número brasileiro. O WhatsApp diz o endereço certo (número antigo fica sem o nono dígito).
   */
  async destinoDe(numero) {
    const internacional = String(numero).trim().startsWith("+");
    const digitos = String(numero).replace(/\D/g, "");
    if (digitos.length < 8 || digitos.length > 15) throw new Error("número inválido");
    const comPais = !internacional && digitos.length <= 11 ? `55${digitos}` : digitos;
    const [achado] = (await this.sock.onWhatsApp(comPais).catch(() => [])) ?? [];
    if (!achado?.exists) throw new Error(`o número ${comPais} não tem WhatsApp`);
    return achado.jid;
  }

  enviar({ numero, texto }) {
    const corpo = String(texto ?? "").trim().slice(0, 4000);
    if (!corpo) return Promise.reject(new Error("mensagem vazia"));
    // Uma de cada vez, com intervalo: a fila nunca trava por causa de um erro.
    const tarefa = this.fila.then(async () => {
      if (!this.sock || this.estado.fase !== "conectado") {
        throw new Error(this.cliente ? "o WhatsApp do cliente não está conectado" : "o WhatsApp da T9 não está conectado");
      }
      const jid = await this.destinoDe(numero);
      const espera = this.ultimoEnvio + INTERVALO - Date.now();
      if (espera > 0) await new Promise((r) => setTimeout(r, espera));
      const enviada = await this.sock.sendMessage(jid, { text: corpo });
      this.ultimoEnvio = Date.now();
      return { ok: true, id: enviada?.key?.id ?? "", para: jid.split("@")[0] };
    });
    this.fila = tarefa.catch(() => undefined);
    return tarefa;
  }
}

const t9 = new Sessao({ id: "t9", pasta: SESSAO, cliente: false });
t9.estado.fase = "iniciando";

/** Sessões dos clientes já abertas nesta execução, por id. */
const clientes = new Map();
const ID_VALIDO = /^[a-z0-9][a-z0-9-]{0,39}$/;

function clienteDe(id, criar = false) {
  if (!ID_VALIDO.test(id)) throw new Error("cliente inválido");
  let s = clientes.get(id);
  if (!s && criar) {
    s = new Sessao({ id, pasta: path.join(CLIENTES, id), cliente: true });
    clientes.set(id, s);
  }
  return s ?? null;
}

const ligados = () => [...clientes.values()].filter((s) => s.ligada).length;

/** Ao ligar, reabre as sessões dos clientes que já tinham lido o QR. */
async function reabrirClientes() {
  const pastas = await fs.readdir(CLIENTES).catch(() => []);
  for (const id of pastas) {
    if (!ID_VALIDO.test(id)) continue;
    const pareado = await fs.access(path.join(CLIENTES, id, "creds.json")).then(() => true, () => false);
    if (!pareado) continue;
    if (ligados() >= MAX_CLIENTES) return log("teto de clientes atingido; não reabri", id);
    const s = clienteDe(id, true);
    await s.conectar().catch((e) => log(s.rotulo, "não reabriu", e?.message || e));
    // Um de cada vez: muitas conexões no mesmo segundo chamam atenção do WhatsApp.
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/* ---------------------------------------------------------------- servidor */

function autorizado(req) {
  const enviado = Buffer.from(String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
  const certo = Buffer.from(SEGREDO);
  return enviado.length === certo.length && timingSafeEqual(enviado, certo);
}

async function corpo(req) {
  const partes = [];
  let tamanho = 0;
  for await (const p of req) {
    tamanho += p.length;
    if (tamanho > 64 * 1024) throw new Error("corpo grande demais");
    partes.push(p);
  }
  return partes.length ? JSON.parse(Buffer.concat(partes).toString("utf8")) : {};
}

async function rotaDeCliente(req, id, acao) {
  if (req.method === "GET" && acao === "estado") {
    return clienteDe(id)?.estado ?? { fase: "desligado", qr: "", numero: "", nome: "", desde: "", erro: "" };
  }
  if (req.method === "POST" && acao === "conectar") {
    const s = clienteDe(id, true);
    if (!s.ligada || s.estado.fase === "parada") {
      if (!s.ligada && ligados() >= MAX_CLIENTES) throw new Error("a ponte já está no limite de WhatsApps conectados; fale com a T9");
      s.quedas = 0;
      s.estado.erro = "";
      await s.conectar();
    }
    return s.estado;
  }
  if (req.method === "POST" && acao === "enviar") {
    const s = clienteDe(id);
    if (!s) throw new Error("o WhatsApp do cliente não está conectado");
    return s.enviar(await corpo(req));
  }
  if (req.method === "POST" && acao === "sair") {
    const s = clienteDe(id, true);
    await s.sair();
    clientes.delete(id);
    return { ok: true };
  }
  return null;
}

http
  .createServer(async (req, res) => {
    const json = (status, dados) => {
      res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
      res.end(JSON.stringify(dados));
    };
    if (!autorizado(req)) return json(401, { erro: "não autorizado" });
    const url = new URL(req.url, "http://ponte");
    try {
      const cliente = url.pathname.match(/^\/clientes\/([^/]+)\/([a-z]+)$/);
      if (cliente) {
        const r = await rotaDeCliente(req, cliente[1], cliente[2]);
        return r ? json(200, r) : json(404, { erro: "rota desconhecida" });
      }
      if (req.method === "GET" && url.pathname === "/estado") return json(200, t9.estado);
      if (req.method === "POST" && url.pathname === "/enviar") return json(200, await t9.enviar(await corpo(req)));
      if (req.method === "POST" && url.pathname === "/reconectar") {
        if (t9.estado.fase === "parada") {
          t9.quedas = 0;
          void t9.conectar().catch((e) => log("não reconectou", e?.message || e));
        }
        return json(200, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/sair") {
        await t9.sock?.logout().catch(() => {});
        return json(200, { ok: true });
      }
      json(404, { erro: "rota desconhecida" });
    } catch (e) {
      json(400, { erro: e?.message || String(e) });
    }
  })
  .listen(PORTA, () => log(`ouvindo na porta ${PORTA}`));

t9.conectar().catch((e) => {
  // Sem isto a ponte ficaria em "conectando" para sempre, sem dizer por quê.
  t9.estado.fase = "parada";
  t9.estado.erro = `não consegui abrir a sessão do WhatsApp: ${e?.message || e}`;
  log(t9.estado.erro);
});
setTimeout(() => void reabrirClientes().catch((e) => log("não reabri os clientes", e?.message || e)), 5000);

/* ------------------------------------------------------------------- túnel */

/**
 * O túnel rápido da Cloudflare ganha um endereço novo a cada vez que liga. A ponte o lê nas
 * métricas do cloudflared e informa o painel; repete quando muda e, por garantia, a cada 10 minutos
 * (se outra ponte tiver avisado por último, esta retoma o endereço; só deixe uma ligada).
 */
let informado = "";
let informadoEm = 0;
async function informarEndereco() {
  let url = URL_PUBLICA;
  if (!url) {
    const r = await fetch(`${TUNEL}/quicktunnel`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
    const host = r?.ok ? String((await r.json().catch(() => ({}))).hostname || "") : "";
    if (!host) return;
    url = `https://${host}`;
  }
  if (url === informado && Date.now() - informadoEm < 10 * 60_000) return;
  const resposta = await fetch(`${PAINEL}/api/painel/whatsapp/ponte`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${SEGREDO}` },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(20000),
  }).catch((e) => ({ ok: false, status: e?.message || e }));
  if (resposta.ok) {
    if (url !== informado) log("painel avisado do endereço", url);
    informado = url;
    informadoEm = Date.now();
  } else log("não consegui avisar o painel", resposta.status);
}
if (TUNEL || URL_PUBLICA) {
  setInterval(() => void informarEndereco().catch(() => {}), 15000);
  void informarEndereco().catch(() => {});
}

/* ------------------------------------------------------------------ rotina */

/**
 * A cada poucos minutos, pede ao painel que busque os leads de formulário novos na Meta e mande
 * os avisos e as primeiras mensagens. É a garantia de que o lead chega sem ninguém clicar em
 * "Atualizar agora", mesmo quando o aviso em tempo real da Meta não vem.
 */
let ultimaRotina = "";
async function rotina() {
  const r = await fetch(`${PAINEL}/api/painel/whatsapp/rotina`, {
    method: "POST",
    headers: { authorization: `Bearer ${SEGREDO}` },
    signal: AbortSignal.timeout(150000),
  }).catch((e) => ({ ok: false, status: e?.message || e }));
  if (!r.ok) {
    const aviso = `rotina de leads falhou: ${r.status}`;
    if (aviso !== ultimaRotina) log(aviso);
    ultimaRotina = aviso;
    return;
  }
  const { resultado = [], chamadas = [] } = await r.json().catch(() => ({}));
  for (const x of resultado) {
    if (x.enviados) log(`rotina: ${x.enviados} lead(s) novo(s) de ${x.empresa} enviado(s)`);
    if (x.erro) log(`rotina: ${x.empresa}: ${x.erro}`);
  }
  for (const x of chamadas) if (x.enviados) log(`rotina: ${x.enviados} primeira(s) mensagem(ns) de ${x.empresa}`);
  ultimaRotina = "";
}
setTimeout(() => void rotina().catch(() => {}), 30000);
setInterval(() => void rotina().catch(() => {}), ROTINA_MIN * 60000);
