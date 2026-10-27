// O comportamento da seção da plataforma: abas, telas que trocam sozinhas,
// réplicas clicáveis do cronograma e do edital, painel pericial e a lista de
// aulas de cada matéria.
//
// VEIO PRONTO, NO PACOTE DA BLACK, E FOI PORTADO SEM REESCREVER A LÓGICA. A
// seção foi desenhada e aprovada como HTML com JavaScript próprio; refazê-la
// em estado de React seria refazer o comportamento inteiro e torcer para sair
// igual. Aqui o script original roda tal qual, com três mudanças só:
//
// 1. Escopo. Tudo é procurado dentro do elemento da seção, e não no documento
//    inteiro — a página da Black tem outras seções e não pode haver colisão.
// 2. Limpeza. Cada ouvinte é registrado com um AbortSignal, e cada temporizador
//    é parado ao sair. Sem isso, montar a seção duas vezes (o React faz isso em
//    desenvolvimento, e a navegação pode fazer em produção) deixava dois
//    ouvintes por botão e duas apresentações rodando ao mesmo tempo.
// 3. O atalho "eBook" saiu do cronograma. O próprio pacote avisa que ele ainda
//    está chegando na plataforma e pede para avaliar tirá-lo se a página for
//    ao ar antes — e ela já está no ar. Mostrar um botão que a plataforma
//    ainda não tem é prometer o que o aluno não vai encontrar.
//
// Os textos que entram por innerHTML são constantes deste arquivo; o que vem
// de dado (nome de matéria e de aula) passa por `esc`.

import { MATERIAS, type Materia } from "./aulas";

const BASE = "/black/plataforma/";

/** Caminho público de um arquivo da seção. */
const A = (n: string) => BASE + (n.startsWith("capas/") ? n : `img/${n}`);

const esc = (t: string) =>
  String(t).replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );

const ICO: Record<string, string> = {
  aula: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
  questao:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  ebook:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5a2 2 0 012-2h5v16H5a2 2 0 00-2 2zM21 5a2 2 0 00-2-2h-5v16h5a2 2 0 012 2z"/></svg>',
  cards:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="14" height="16" rx="2"/><path d="M4 7v12a2 2 0 002 2h10"/></svg>',
  mapa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.3" fill="currentColor"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="10" r="1.3" fill="currentColor"/></svg>',
  simulado:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  timer:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>',
};

type Quadro = [arquivo: string, legenda: string];

// Destinos reais de Tanatologia (o que abre ao clicar no cronograma e no edital).
const DESTINOS: Record<string, { t: string; imgs: Quadro[] }> = {
  aula: {
    t: "Aula · Tanatologia I · Dra. Erika Anjos",
    imgs: [["destino-aula.jpg", "Aula do professor"]],
  },
  questao: {
    t: "Questões · Tanatologia forense",
    imgs: [["destino-questao.jpg", "Banco de questões no assunto"]],
  },
  simulado: {
    t: "Simulado · Tanatologia forense",
    imgs: [["destino-questao.jpg", "Simulado só com o assunto"]],
  },
  ebook: {
    t: "eBook · Tanatologia Forense",
    imgs: [
      ["destino-ebook-1.jpg", "eBook do assunto"],
      ["destino-ebook-2.jpg", "Página do eBook"],
    ],
  },
  cards: {
    t: "Flashcards",
    imgs: [["destino-cards.jpg", "Cards dos professores"]],
  },
  mapa: {
    t: "Mapa mental · Tanatologia",
    imgs: [
      ["destino-mapa-1.jpg", "Mapa mental ilustrado"],
      ["destino-mapa-2.jpg", "Por dentro do mapa"],
    ],
  },
};

interface Aba {
  id: string;
  nome: string;
  titulo: string;
  texto: string;
  midia: "slides" | "crono" | "video" | "rolagem" | "edital" | "painel";
  frames?: Quadro[];
  chips?: [string, number][];
  destaque?: [string, string];
  video?: string;
  img?: string;
  extra?: "capas";
}

const ABAS: Aba[] = [
  {
    id: "aulas",
    nome: "Aulas",
    titulo: "Conheça nossas aulas",
    texto:
      "Clique na matéria que você tem interesse e veja a lista de aulas já disponíveis. Por dentro, cada aula tem o vídeo do professor, a lista das próximas aulas ao lado, os <b>bizus</b>, os <b>slides para baixar</b> e a nossa IA para tirar dúvida na hora.",
    midia: "slides",
    frames: [
      ["aula-1.jpg", "Aula do professor + lista de aulas"],
      ["aula-2.jpg", "Bizus da aula"],
      ["aula-3.jpg", "Slides para baixar"],
    ],
    extra: "capas",
  },
  {
    id: "questoes",
    nome: "Questões",
    titulo: "Mais de 25 mil questões das bancas do cargo",
    texto:
      "Filtre por banca, ano, assunto e órgão. E veja os comentários dos professores <b>em texto, em áudio e em vídeo</b> — o professor resolvendo a questão com você.",
    midia: "slides",
    frames: [
      ["questao-1.jpg", "Questão real de prova"],
      ["questao-2.jpg", "Você marca a alternativa"],
      ["questao-3.jpg", "Comentário em texto"],
      ["questao-4.jpg", "Comentário em vídeo"],
    ],
    chips: [
      ["Questão", 0],
      ["Comentário em texto", 2],
      ["Comentário em vídeo", 3],
    ],
  },
  {
    id: "cronograma",
    nome: "Cronograma",
    titulo: "Abriu o dia, já sabe o que estudar",
    texto:
      "O cronograma monta as sessões do dia a partir do seu edital. Cada sessão já traz os atalhos: <b>clique em Aulas e a aula abre na tela</b>; em Mapas, o mapa mental; em Questões, as questões daquele tema. Experimente ao lado.",
    midia: "crono",
  },
  {
    id: "mapas",
    nome: "Mapas mentais",
    titulo: "Cada assunto numa página ilustrada",
    texto:
      "Mapas mentais desenhados pelo Clube, para a revisão da véspera: você olha o mapa e lembra do resto.",
    destaque: ["+30", "mapas mentais de Medicina Legal e Direito"],
    midia: "video",
    video: "mapas.mp4",
  },
  {
    id: "ebooks",
    nome: "eBooks",
    titulo: "eBooks de todas as matérias",
    texto:
      "Escritos pelos nossos professores a partir das principais bibliografias, já no recorte que a prova de médico legista cobra. Ao lado, as primeiras páginas do eBook de Traumatologia Forense.",
    midia: "rolagem",
    img: "ebook-trauma-pilha.jpg",
  },
  {
    id: "flashcards",
    nome: "Flashcards",
    titulo: "Revisão ativa, no intervalo do plantão",
    texto:
      "Flashcards feitos pelos nossos professores médicos legistas: a pergunta de um lado, a resposta do outro, e a repetição espaçada cuidando de quando cada card volta para você.",
    midia: "slides",
    frames: [
      ["flash-2.jpg", "Cards dos professores"],
      ["flash-3.jpg", "Virou, conferiu"],
    ],
  },
  {
    id: "jogos",
    nome: "Mini-jogos",
    titulo: "Espectro Equimótico: acerte a idade da lesão",
    texto:
      "Uma equimose na tela, a cor dela e uma pergunta: há quantos dias foi a lesão? O jogo corrige na hora e explica pelo espectro de Legrand du Saulle. É o primeiro de uma série de mini-jogos de medicina legal — os próximos já estão a caminho.",
    midia: "slides",
    frames: [
      ["jogo-2.jpg", "Espectro Equimótico"],
      ["jogo-3.jpg", "Leia a cor e responda"],
      ["jogo-4.jpg", "Correção com explicação"],
    ],
  },
  {
    id: "edital",
    nome: "Edital verticalizado",
    titulo: "O edital inteiro, item por item — e cada item leva ao material",
    texto:
      "Cada tópico do edital vira uma linha, com teoria e revisões para marcar. E no ícone de <b>Materiais</b> você vai direto para a aula, as questões, um simulado, os cards ou o mapa daquele item. Clique ao lado.",
    midia: "edital",
  },
  {
    id: "painel",
    nome: "Painel pericial",
    titulo: "Onde você está, em números",
    texto:
      "Acertos e erros no período, por disciplina e por assunto — para a próxima hora de estudo ir onde ela rende mais.",
    midia: "painel",
  },
];

/**
 * Liga a seção dentro de `raiz` e devolve a função que desliga tudo.
 */
export function iniciarPlataforma(raiz: HTMLElement): () => void {
  const controle = new AbortController();
  const { signal } = controle;
  const $ = <T extends Element = HTMLElement>(sel: string) =>
    raiz.querySelector(sel) as T;

  const abas = $("#cf-pl-abas");
  const painel = $("#cf-pl-painel");
  let pararAtual: () => void = () => {};

  abas.innerHTML = ABAS.map(
    (a, i) =>
      `<button class="aba" type="button" role="tab" data-i="${i}">${a.nome}</button>`,
  ).join("");
  abas.addEventListener(
    "click",
    (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".aba");
      if (b) mostra(Number(b.dataset.i));
    },
    { signal },
  );

  // ---------- slideshow ("GIF") ----------
  function slides(vidro: HTMLElement, frames: Quadro[], intervalo = 3000) {
    vidro.innerHTML =
      frames
        .map(
          ([src], k) =>
            `<img class="slide${k ? "" : " on"}" src="${A(src)}" alt="">`,
        )
        .join("") +
      `<span class="legenda">${esc(frames[0][1])}</span>` +
      (frames.length > 1
        ? `<span class="pontos">${frames.map((_, k) => `<i class="${k ? "" : "on"}"></i>`).join("")}</span>`
        : "");
    const ims = vidro.querySelectorAll(".slide");
    const leg = vidro.querySelector(".legenda") as HTMLElement;
    const pts = vidro.querySelectorAll(".pontos i");
    let i = 0;
    let t: ReturnType<typeof setInterval> | undefined;
    const vai = (n: number) => {
      i = (n + frames.length) % frames.length;
      ims.forEach((m, k) => m.classList.toggle("on", k === i));
      pts.forEach((p, k) => p.classList.toggle("on", k === i));
      leg.textContent = frames[i][1];
    };
    const roda = () => {
      clearInterval(t);
      if (frames.length > 1) t = setInterval(() => vai(i + 1), intervalo);
    };
    roda();
    return {
      vai: (n: number) => {
        vai(n);
        roda();
      },
      para: () => clearInterval(t),
    };
  }

  // ---------- janela dentro da tela (destino de um clique) ----------
  function janela(app: HTMLElement, chave: string, titulo?: string) {
    app.querySelector(".janela")?.remove();
    const d = DESTINOS[chave];
    const j = document.createElement("div");
    j.className = "janela";
    j.innerHTML = `<header><span>${esc(titulo || d.t)}</span><button type="button" aria-label="Fechar">×</button></header><div class="corpo"></div>`;
    app.appendChild(j);
    const s = slides(j.querySelector(".corpo") as HTMLElement, d.imgs, 2600);
    j.querySelector("button")!.addEventListener("click", () => {
      s.para();
      j.remove();
    });
    return () => {
      s.para();
      j.remove();
    };
  }
  function aviso(app: HTMLElement, texto: string) {
    app.querySelector(".janela")?.remove();
    const j = document.createElement("div");
    j.className = "janela";
    j.innerHTML = `<header><span>Edital verticalizado</span><button type="button" aria-label="Fechar">×</button></header><div class="corpo"><div class="aviso">${texto}</div></div>`;
    app.appendChild(j);
    j.querySelector("button")!.addEventListener("click", () => j.remove());
  }

  // ---------- cronograma (réplica clicável) ----------
  function cronograma(vidro: HTMLElement) {
    // Sem o atalho "eBook" — ver o topo do arquivo.
    const atalhos: [string, string][] = [
      ["aula", "Aulas"],
      ["questao", "Questões"],
      ["cards", "Cards"],
      ["mapa", "Mapas"],
    ];
    const sessao = (n: number, ass: string, ativo: boolean) =>
      `<div class="sessao${ativo ? "" : " apagado"}"><div class="linha"><div><h5>SESSÃO ${n}</h5><div class="mat">MEDICINA LEGAL</div>
      <div class="ass">${ass}</div></div><span class="iniciar">⏱ INICIAR</span></div>
      <div class="atalhos">${atalhos.map(([k, r]) => `<button class="atalho" type="button" data-k="${k}">${ICO[k]}${r}</button>`).join("")}</div></div>`;
    vidro.innerHTML = `<div class="app"><div class="cabapp" style="background:#b8930a"><div><b>Estudos</b><small>Você tem <strong>4 itens pendentes</strong> de 4 programados para hoje.</small></div>📅</div>
      ${sessao(1, "Tanatologia forense: a vida e a morte, sinais de morte real, diagnóstico da morte, cronotanatognose, fenômenos cadavéricos.", true)}
      ${sessao(2, "Tanatologia forense: putrefação, transformações especiais do cadáver, lesões intra vitam e post mortem.", false)}
      ${sessao(3, "Traumatologia forense: lesões por instrumentos contundentes, cortantes, perfurantes e perfurocortantes.", false)}</div>`;
    const app = vidro.querySelector(".app") as HTMLElement;
    const botoes = [
      ...app.querySelectorAll<HTMLElement>(".sessao .atalho"),
    ].filter((b) => !b.closest(".apagado"));
    let fecha: (() => void) | null = null;
    let demo: ReturnType<typeof setTimeout> | undefined;
    let passo = 0;
    let mexeu = false;
    const abre = (k: string) => {
      fecha?.();
      fecha = janela(app, k);
    };
    app.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".atalho");
      if (!b) return;
      mexeu = true;
      clearTimeout(demo);
      botoes.forEach((x) => x.classList.remove("foco"));
      abre(b.dataset.k!);
    });
    // Demonstração sozinha até a pessoa clicar: destaca o atalho, abre, fecha, vai para o próximo.
    const ciclo = () => {
      if (mexeu) return;
      const b = botoes[passo % botoes.length];
      botoes.forEach((x) => x.classList.toggle("foco", x === b));
      demo = setTimeout(() => {
        if (mexeu) return;
        abre(b.dataset.k!);
        demo = setTimeout(() => {
          if (mexeu) return;
          fecha?.();
          fecha = null;
          b.classList.remove("foco");
          passo++;
          demo = setTimeout(ciclo, 700);
        }, 3200);
      }, 1100);
    };
    demo = setTimeout(ciclo, 900);
    return () => {
      mexeu = true;
      clearTimeout(demo);
      fecha?.();
    };
  }

  // ---------- edital verticalizado (réplica clicável) ----------
  function edital(vidro: HTMLElement) {
    const itens: [string, number, string, boolean?][] = [
      [
        "Antropologia forense: identidade, identificação, identidades médico-legal e judiciária.",
        1,
        "60%",
      ],
      [
        "Traumatologia forense: lesões por instrumentos contundentes, cortantes, perfurantes e perfurocortantes; projéteis de arma de fogo.",
        1,
        "82%",
      ],
      [
        "Asfixiologia forense: enforcamento, estrangulamento, esganadura, sufocação, afogamento.",
        0,
        "",
      ],
      [
        "Tanatologia forense: a vida e a morte, sinais de morte real, diagnóstico da morte, cronotanatognose, putrefação.",
        0,
        "",
        true,
      ],
      [
        "Toxicologia forense: venenos, vias de penetração, eliminação, perícia toxicológica.",
        0,
        "",
      ],
      ["Necropsia: inspeções interna e externa do cadáver.", 0, ""],
    ];
    const cx = (on: boolean | number) =>
      `<button class="cx${on ? " on" : ""}" type="button" aria-label="Marcar">${on ? "✓" : ""}</button>`;
    const rev = () =>
      [1, 2, 3, 4, 5, 6]
        .map((n) => `<td class="${n > 3 ? "r46" : ""}">${cx(false)}</td>`)
        .join("");
    vidro.innerHTML = `<div class="app" style="padding:0">
      <div class="cabapp" style="background:#55565c;border-radius:0"><span style="font-size:10px;padding:5px 8px;border-radius:6px;background:#3d3e44">MEU CICLO · TODO O EDITAL</span><b>Edital verticalizado</b><span></span></div>
      <table class="ed"><thead><tr><th style="text-align:left;padding-left:8px">Disciplina / assunto</th><th class="vt">Iniciar</th><th class="vt">Materiais</th><th class="vt">Teoria</th>
        <th>1ª</th><th>2ª</th><th>3ª</th><th class="r46">4ª</th><th class="r46">5ª</th><th class="r46">6ª</th><th>Meu</th></tr></thead><tbody>
        <tr class="grupo"><td class="as">⌄ MEDICINA LEGAL</td><td></td><td></td><td>${cx(false)}</td>${rev()}<td class="pct">25%</td></tr>
        ${itens
          .map(
            (
              [t, teoria, pct, alvo],
              k,
            ) => `<tr><td class="as">${t}</td><td><button class="ic" type="button" aria-label="Iniciar">${ICO.timer}</button></td>
          <td><button class="ic mats${alvo ? " pulsa" : ""}" type="button" data-k="${k}" aria-label="Materiais">${ICO.ebook}</button></td><td>${cx(teoria)}</td>${rev()}<td class="pct">${pct}</td></tr>`,
          )
          .join("")}
        <tr class="grupo"><td class="as">› NOÇÕES DE DIREITO PENAL</td><td></td><td></td><td>${cx(false)}</td>${rev()}<td></td></tr>
        <tr class="grupo"><td class="as">› NOÇÕES DE DIREITO PROCESSUAL PENAL</td><td></td><td></td><td>${cx(false)}</td>${rev()}<td></td></tr>
      </tbody></table></div>`;
    const app = vidro.querySelector(".app") as HTMLElement;
    const opcoes: [string, string][] = [
      ["aula", "Aulas"],
      ["questao", "Resolver no banco de questões"],
      ["simulado", "Criar e resolver simulado"],
      ["cards", "Resolver cards"],
      ["mapa", "Mapas"],
    ];
    let fecha: (() => void) | null = null;
    const fechaMenu = () => app.querySelector(".menu")?.remove();
    app.addEventListener("click", (e) => {
      const alvo = e.target as HTMLElement;
      const c = alvo.closest(".cx");
      if (c) {
        c.classList.toggle("on");
        c.textContent = c.classList.contains("on") ? "✓" : "";
        return;
      }
      const op = alvo.closest<HTMLElement>(".menu button");
      if (op) {
        const k = Number((op.closest(".menu") as HTMLElement).dataset.item);
        fechaMenu();
        if (itens[k][3]) {
          fecha?.();
          fecha = janela(app, op.dataset.k!);
        } else {
          aviso(
            app,
            "Nesta prévia, só o item de <b>Tanatologia</b> abre o material.<br>Na plataforma, todos os itens abrem.",
          );
        }
        return;
      }
      const m = alvo.closest<HTMLElement>(".mats");
      if (m) {
        fechaMenu();
        app
          .querySelectorAll(".pulsa")
          .forEach((x) => x.classList.remove("pulsa"));
        const r = m.getBoundingClientRect();
        const a = app.getBoundingClientRect();
        const menu = document.createElement("div");
        menu.className = "menu";
        menu.dataset.item = m.dataset.k;
        menu.innerHTML = opcoes
          .map(
            ([k, t]) =>
              `<button type="button" data-k="${k}">${ICO[k]}${t}</button>`,
          )
          .join("");
        app.appendChild(menu);
        const top = r.bottom - a.top + app.scrollTop + 4;
        const left = Math.min(r.left - a.left, a.width - 222);
        menu.style.top =
          Math.min(top, app.scrollHeight - menu.offsetHeight - 6) + "px";
        menu.style.left = Math.max(6, left) + "px";
        return;
      }
      if (!alvo.closest(".menu")) fechaMenu();
    });
    return () => {
      fecha?.();
    };
  }

  // ---------- painel pericial (réplica da tela, com números de exemplo) ----------
  function painelPericial(vidro: HTMLElement) {
    const MATS: [string, number, number][] = [
      ["Medicina Legal", 612, 557],
      ["Direito Penal", 188, 158],
      ["Direito Processual Penal", 164, 134],
      ["Língua Portuguesa", 142, 122],
      ["Direito Constitucional", 98, 83],
      ["Raciocínio Lógico", 80, 64],
    ];
    const total = MATS.reduce((s, m) => s + m[1], 0);
    const certas = MATS.reduce((s, m) => s + m[2], 0);
    const pct = Math.round((certas / total) * 100);
    const n = (x: number) => x.toLocaleString("pt-BR");
    // Curvas do gráfico: acertos (azul) bem acima dos erros (vermelho), mês a mês.
    const ac = [8, 14, 22, 31, 38, 47, 55, 61, 70, 78, 86, 92];
    const er = [5, 6, 7, 7, 8, 8, 9, 8, 9, 9, 10, 10];
    const caminho = (v: number[]) => {
      const pts = v.map((y, i) => [10 + i * (280 / 11), 120 - y * 1.15]);
      return (
        "M" + pts.map((p) => p.map((c) => c.toFixed(1)).join(",")).join(" L")
      );
    };
    const area = (v: number[]) => caminho(v) + " L290,120 L10,120 Z";
    vidro.innerHTML = `<div class="app pp">
      <div class="pp-topo"><b>PAINEL PERICIAL</b><span class="pp-abas"><i class="on">Questões</i><i>Flashcards</i><i>Turmas</i></span></div>
      <div class="pp-per">${["HOJE", "7 DIAS", "15 DIAS", "UM MÊS", "TRÊS MESES", "SEIS MESES", "1 ANO"].map((p) => `<i class="${p === "1 ANO" ? "on" : ""}">${p}</i>`).join("")}</div>
      <div class="pp-num"><div><strong>${n(total)}</strong><span>questões resolvidas</span></div><div><strong>${pct}%</strong><span>de acerto</span></div><div><strong>${MATS.length}</strong><span>matérias</span></div></div>
      <div class="pp-graf">
        <div class="pp-card"><h6>ACERTEI x ERREI</h6>
          <svg viewBox="0 0 300 130" preserveAspectRatio="none"><defs>
            <linearGradient id="ppA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6" stop-opacity=".75"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></linearGradient>
            <linearGradient id="ppE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f43f5e" stop-opacity=".7"/><stop offset="1" stop-color="#f43f5e" stop-opacity="0"/></linearGradient></defs>
            ${[30, 60, 90].map((y) => `<line x1="10" x2="290" y1="${y}" y2="${y}" stroke="#3a3b41" stroke-dasharray="3 3"/>`).join("")}
            <path d="${area(ac)}" fill="url(#ppA)"/><path d="${caminho(ac)}" fill="none" stroke="#60a5fa" stroke-width="2"/>
            <path d="${area(er)}" fill="url(#ppE)"/><path d="${caminho(er)}" fill="none" stroke="#fb7185" stroke-width="2"/>
            <line x1="10" x2="290" y1="120" y2="120" stroke="#6b7280"/></svg></div>
        <div class="pp-card"><h6>TOTAL DO PERÍODO</h6><div class="pp-rosca" style="--p:${pct}"><span>${pct}%</span></div>
          <div class="pp-leg"><i style="background:#3b82f6"></i>Acertei <i style="background:#f43f5e"></i>Errei</div></div>
      </div>
      <div class="pp-card pp-tab"><h6>ANÁLISE DE PERFORMANCE</h6>
        ${MATS.map(([m, t, c]) => {
          const p = Math.round((c / t) * 100);
          return `<div class="pp-lin"><span>${m}</span><b>${n(t)}</b><em>${n(c)} <small>(${p}%)</small> / ${n(t - c)}</em>
          <span class="pp-bar"><i style="width:${p}%"></i></span></div>`;
        }).join("")}</div>
      <span class="pp-ex">exemplo ilustrativo</span></div>`;
    return () => {};
  }

  // ---------- aba ----------
  function mostra(i: number) {
    pararAtual();
    const a = ABAS[i];
    [...abas.children].forEach((b, k) =>
      b.setAttribute("aria-selected", k === i ? "true" : "false"),
    );
    painel.innerHTML = `<div class="painel">
      <div><div class="num">${String(i + 1).padStart(2, "0")}</div><h3>${a.titulo}</h3><p class="texto">${a.texto}</p>
        ${a.destaque ? `<div class="destaque"><strong>${a.destaque[0]}</strong><span>${a.destaque[1]}</span></div>` : ""}
        ${a.chips ? `<div class="chips">${a.chips.map(([t, n], k) => `<button class="chip${k ? "" : " on"}" type="button" data-n="${n}">${t}</button>`).join("")}</div>` : ""}
        ${
          a.extra === "capas"
            ? `<div class="capas-wrap"><div class="capas" id="cf-pl-capas">${MATERIAS.map((m, k) => `<button class="capa" type="button" data-k="${k}"><img src="${A(m.capa)}" alt="${esc(m.nome)}"><span>ver lista</span></button>`).join("")}</div>
          <div class="setas"><button class="seta" type="button" data-d="-1" aria-label="Anteriores">←</button><button class="seta" type="button" data-d="1" aria-label="Próximas">→</button></div></div>`
            : ""
        }
      </div>
      <div class="tela"><div class="vidro"></div></div></div>`;
    const vidro = painel.querySelector(".vidro") as HTMLElement;
    if (a.midia === "slides" && a.frames) {
      const s = slides(vidro, a.frames);
      pararAtual = s.para;
      painel.querySelectorAll<HTMLElement>(".chip").forEach((c) =>
        c.addEventListener("click", () => {
          painel
            .querySelectorAll(".chip")
            .forEach((x) => x.classList.toggle("on", x === c));
          s.vai(Number(c.dataset.n));
        }),
      );
    } else if (a.midia === "video" && a.video) {
      // Duas fontes: o webm toca onde não há H.264 (Chromium livre, parte do
      // Linux); o mp4, no resto. O navegador baixa só a que sabe ler.
      const base = a.video.replace(/\.mp4$/, "");
      vidro.innerHTML = `<video class="slide" autoplay loop muted playsinline><source src="${A(base + ".webm")}" type="video/webm"><source src="${A(a.video)}" type="video/mp4"></video>`;
      pararAtual = () => {};
    } else if (a.midia === "rolagem" && a.img) {
      vidro.innerHTML = `<div class="rolagem"><img src="${A(a.img)}" alt="Primeiras páginas do eBook de Traumatologia Forense"></div><span class="legenda">eBook · Traumatologia Forense</span>`;
      const img = vidro.querySelector("img") as HTMLImageElement;
      const ajusta = () =>
        img.style.setProperty(
          "--fim",
          `${-(img.offsetHeight - vidro.offsetHeight + 12)}px`,
        );
      if (img.complete) ajusta();
      else img.addEventListener("load", ajusta);
      pararAtual = () => {};
    } else if (a.midia === "crono") pararAtual = cronograma(vidro);
    else if (a.midia === "edital") pararAtual = edital(vidro);
    else if (a.midia === "painel") pararAtual = painelPericial(vidro);

    const capas = painel.querySelector<HTMLElement>("#cf-pl-capas");
    if (capas) {
      capas.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>(".capa");
        if (b) lista(MATERIAS[Number(b.dataset.k)]);
      });
      painel
        .querySelectorAll<HTMLElement>(".seta")
        .forEach((s) =>
          s.addEventListener("click", () =>
            capas.scrollBy({
              left: Number(s.dataset.d) * capas.clientWidth * 0.8,
            }),
          ),
        );
    }
  }

  // ---------- lista de aulas ----------
  const dlg = $<HTMLDialogElement>("#cf-pl-dlg");
  function lista(m: Materia) {
    $<HTMLImageElement>("#cf-pl-dlg-capa").src = A(m.capa);
    $("#cf-pl-dlg-t").textContent = m.nome;
    const varios = m.modulos.length > 1;
    const caixa = $("#cf-pl-dlg-lista");
    caixa.innerHTML = m.modulos
      .map(
        (mod) =>
          `${varios ? `<h5>${esc(mod.nome)}</h5>` : ""}<ol>${mod.aulas.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`,
      )
      .join("");
    caixa.scrollTop = 0;
    dlg.showModal();
  }
  $("#cf-pl-dlg-x").addEventListener("click", () => dlg.close(), { signal });
  dlg.addEventListener(
    "click",
    (e) => {
      if (e.target === dlg) dlg.close();
    },
    { signal },
  );

  mostra(0);

  return () => {
    controle.abort();
    pararAtual();
    if (dlg.open) dlg.close();
    abas.innerHTML = "";
    painel.innerHTML = "";
  };
}
