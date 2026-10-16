/**
 * Ponte do WhatsApp da T9.
 *
 * Um processo sempre ligado, conectado ao número da T9 como "aparelho conectado"
 * (o mesmo QR do WhatsApp Web). Serve só para o painel mandar mensagens: hoje,
 * o aviso de lead novo no WhatsApp do cliente.
 *
 * Diferente da ponte da central Clarear (de onde veio), esta não guarda conversas,
 * não baixa histórico nem responde comandos: mensagens recebidas são ignoradas e
 * continuam aparecendo normalmente no celular do número da T9.
 *
 * Roda no PC da T9 com um túnel rápido da Cloudflare (compose.yml): o túnel dá um endereço
 * público que muda a cada reinício, e a ponte avisa o painel do endereço novo sozinha.
 *
 * Rotas (todas exigem "Authorization: Bearer <PONTE_SEGREDO>"):
 *   GET  /estado      fase da conexão, número conectado e o QR (imagem) quando houver
 *   POST /enviar      { numero, texto } → manda a mensagem
 *   POST /reconectar  volta a tentar depois de três quedas seguidas
 *   POST /sair        desconecta o número (sai um QR novo)
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
/** Intervalo mínimo entre duas mensagens: rajada é o que mais chama atenção do WhatsApp. */
const INTERVALO = Number(process.env.PONTE_INTERVALO_MS || 4000);
const TENTATIVAS = 3;
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

let sock = null;
let quedas = 0;
const estado = { fase: "iniciando", qr: "", numero: "", nome: "", desde: "", erro: "" };

async function conectar() {
  await fs.mkdir(SESSAO, { recursive: true });
  const { state, saveCreds } = await abrirSessao(SESSAO);
  estado.fase = "conectando";
  sock = makeWASocket({
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
  const este = sock;
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (este !== sock) return;
    if (qr) {
      estado.fase = "qr";
      estado.qr = await QRCode.toDataURL(qr, { margin: 1, width: 320 }).catch(() => "");
      // O mesmo QR no terminal (docker compose logs ponte), para quando o painel não abrir.
      const texto = await QRCode.toString(qr, { type: "terminal", small: true }).catch(() => "");
      if (texto) log(`QR Code para conectar o número da T9 (vale ~20 s):\n${texto}`);
    }
    if (connection === "open") {
      quedas = 0;
      Object.assign(estado, { fase: "conectado", qr: "", erro: "", desde: new Date().toISOString() });
      estado.numero = jidNormalizedUser(sock.user.id).split("@")[0];
      estado.nome = sock.user.name || "";
      log("conectado como", estado.numero);
    }
    if (connection === "close") {
      const codigo = lastDisconnect?.error?.output?.statusCode;
      estado.numero = "";
      estado.nome = "";
      if (codigo === DisconnectReason.loggedOut) {
        // Desconectado pelo celular ou pelo painel: a sessão antiga não serve mais, sai um QR novo.
        await fs.rm(SESSAO, { recursive: true, force: true });
      }
      // Sair e "reinicie" (o que o WhatsApp pede logo depois de ler o QR) são passos normais; o resto é queda.
      // Ainda sem pareamento, a queda é o QR que venceu sem ninguém ler: sai um QR novo, sem contar como falha.
      const normal = codigo === DisconnectReason.loggedOut || codigo === DisconnectReason.restartRequired || !state.creds.me;
      quedas = normal ? 0 : quedas + 1;
      // Três quedas seguidas e a ponte para: insistir contra o WhatsApp não resolve e pode custar o número.
      if (quedas >= TENTATIVAS) {
        estado.fase = "parada";
        estado.erro = `a conexão caiu ${quedas} vezes seguidas (${codigo ?? "sem código"}) e parei de tentar`;
        return void log(estado.erro, lastDisconnect?.error?.message || "");
      }
      const espera = normal ? 2000 : 5000 * quedas;
      estado.fase = "conectando";
      estado.erro = normal ? "" : `conexão caiu (${codigo ?? "sem código"}); tentativa ${quedas}`;
      if (!normal) log(estado.erro, lastDisconnect?.error?.message || "");
      setTimeout(() => conectar().catch((e) => log("não reconectou", e?.message || e)), espera);
    }
  });
}

/* ------------------------------------------------------------------- envio */

let fila = Promise.resolve();
let ultimoEnvio = 0;

/**
 * "+<país><número>" vale como está (o painel sempre manda assim); sem "+", 10 ou 11 dígitos são
 * um número brasileiro. O WhatsApp diz o endereço certo (número antigo fica sem o nono dígito).
 */
async function destinoDe(numero) {
  const internacional = String(numero).trim().startsWith("+");
  const digitos = String(numero).replace(/\D/g, "");
  if (digitos.length < 8 || digitos.length > 15) throw new Error("número inválido");
  const comPais = !internacional && digitos.length <= 11 ? `55${digitos}` : digitos;
  const [achado] = (await sock.onWhatsApp(comPais).catch(() => [])) ?? [];
  if (!achado?.exists) throw new Error(`o número ${comPais} não tem WhatsApp`);
  return achado.jid;
}

function enviar({ numero, texto }) {
  const corpo = String(texto ?? "").trim().slice(0, 4000);
  if (!corpo) return Promise.reject(new Error("mensagem vazia"));
  // Uma de cada vez, com intervalo: a fila nunca trava por causa de um erro.
  const tarefa = fila.then(async () => {
    if (!sock || estado.fase !== "conectado") throw new Error("o WhatsApp da T9 não está conectado");
    const jid = await destinoDe(numero);
    const espera = ultimoEnvio + INTERVALO - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    const enviada = await sock.sendMessage(jid, { text: corpo });
    ultimoEnvio = Date.now();
    return { ok: true, id: enviada?.key?.id ?? "", para: jid.split("@")[0] };
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
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

http
  .createServer(async (req, res) => {
    const json = (status, dados) => {
      res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
      res.end(JSON.stringify(dados));
    };
    if (!autorizado(req)) return json(401, { erro: "não autorizado" });
    const url = new URL(req.url, "http://ponte");
    try {
      if (req.method === "GET" && url.pathname === "/estado") return json(200, estado);
      if (req.method === "POST" && url.pathname === "/enviar") return json(200, await enviar(await corpo(req)));
      if (req.method === "POST" && url.pathname === "/reconectar") {
        if (estado.fase === "parada") {
          quedas = 0;
          void conectar().catch((e) => log("não reconectou", e?.message || e));
        }
        return json(200, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/sair") {
        await sock?.logout().catch(() => {});
        return json(200, { ok: true });
      }
      json(404, { erro: "rota desconhecida" });
    } catch (e) {
      json(400, { erro: e?.message || String(e) });
    }
  })
  .listen(PORTA, () => log(`ouvindo na porta ${PORTA}`));

conectar().catch((e) => {
  // Sem isto a ponte ficaria em "iniciando" para sempre, sem dizer por quê.
  estado.fase = "parada";
  estado.erro = `não consegui abrir a sessão do WhatsApp: ${e?.message || e}`;
  log(estado.erro);
});

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
 * os avisos. É a garantia de que o lead chega sem ninguém clicar em "Atualizar agora", mesmo
 * quando o aviso em tempo real da Meta não vem.
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
  const { resultado = [] } = await r.json().catch(() => ({}));
  for (const x of resultado) {
    if (x.enviados) log(`rotina: ${x.enviados} lead(s) novo(s) de ${x.empresa} enviado(s)`);
    if (x.erro) log(`rotina: ${x.empresa}: ${x.erro}`);
  }
  ultimaRotina = "";
}
setTimeout(() => void rotina().catch(() => {}), 30000);
setInterval(() => void rotina().catch(() => {}), ROTINA_MIN * 60000);
