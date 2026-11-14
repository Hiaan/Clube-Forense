// Os depoimentos dos aprovados, como dado: a seção em vídeo (Depoimentos.tsx)
// e os dados estruturados das páginas (lib/schema.ts) leem daqui. Fica fora do
// componente porque ele é de cliente, e o servidor não lê constante de módulo
// de cliente.

export interface Depoimento {
  nome: string;
  /** Onde a pessoa passou, como está na arte do próprio depoimento. */
  cargo: string;
  /** Texto exatamente como publicado pelo Clube. */
  texto: string;
  /** Arquivo da capa em public/black/depoimentos/ (sem extensão). */
  capa: string;
  /** Vídeo do YouTube, quando é de lá. */
  youtube?: string;
  /** Arquivo .mp4 em public/black/depoimentos/, quando é nosso. */
  arquivo?: string;
  /** Molda o player: vertical (celular) ou horizontal (live). */
  formato?: "vertical" | "horizontal";
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Dr. Bruno Viana",
    cargo: "SPTC-GO · aprovado em 1º lugar",
    texto:
      "Entrei no Clube Forense durante o intensivão de questões… Eu precisava de alguém que já tivesse passado pelo o que eu passei e nisso, o Clube Forense foi EXCELENTE.",
    capa: "bruno-viana",
    youtube: "N5l6oScrxBc",
    formato: "vertical",
  },
  {
    nome: "Dra. Laís Nader",
    cargo: "PC-PR · 1º lugar na ampla concorrência",
    texto:
      "Comprei todo o material, ebooks, mentoria… e agora, já aprovada, estou ainda com a ficha caindo, eufórica, a sensação é de dever cumprido.",
    capa: "lais-nader",
    youtube: "MvjUy5K9Vn4",
    formato: "horizontal",
  },
  {
    nome: "Dr. Marcel Medeiros",
    cargo: "PC-PE · médico-legista",
    texto:
      "Foi o grande diferencial na minha preparação, os encontros com os professores, bem como a disponibilidade para tirar dúvidas e discutir casos reais fizeram total diferença.",
    capa: "marcel-medeiros",
    arquivo: "marcel-medeiros.mp4",
    formato: "vertical",
  },
  {
    nome: "Dr. Pietro Tenório",
    cargo: "POLITEC-PE · médico-legista",
    texto:
      "Esses encontros semanais foram incrivelmente importantes… mnemônicos, mapas mentais fizeram total diferença… atribuo meu sucesso a essa equipe… gratidão.",
    capa: "pietro-tenorio",
    arquivo: "pietro-tenorio.mp4",
    formato: "vertical",
  },
  {
    nome: "Dr. André Souza",
    cargo: "aluno aprovado",
    texto:
      // Recortado do depoimento publicado, com as reticências marcando o
      // corte: inteiro, ele tinha o dobro do tamanho dos outros cinco e
      // esticava todos os cartões da faixa para caber.
      "De início achei que não conseguiria estudar… No final acreditei que teria chances: persisti e continuei esperançoso, assim hoje aprovado.",
    capa: "andre-souza",
  },
  {
    nome: "Dra. Carla Bandeira",
    cargo: "aluna do Clube",
    texto:
      "Para mim vcs se tornaram uma família por tanto cuidado que vai além de uma simples questão contratual de entregar conteúdos. A dedicação, atenção, cordialidade de cada um do Clube é incrível.",
    capa: "carla-bandeira",
  },
];
