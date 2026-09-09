// Interruptores de recursos do site.
//
// Um lugar só para "isto está no ar ou não". Existe porque tirar um recurso
// apagando o código custa caro para trazer de volta — some o histórico, some a
// migração do banco, some a decisão de por que cada coisa era daquele jeito. Um
// booleano deixa o trabalho inteiro no lugar e desliga só a porta de entrada.
//
// Constante, e não variável de ambiente, de propósito: assim o estado do site
// está versionado e é greppável. Religar é trocar `false` por `true` e publicar.

/**
 * Ranking e Notas — cartão-resposta, ranking por prova e estimativa de corte.
 *
 * Desligado a pedido do Clube, temporariamente. O que isto esconde:
 *   - o botão "Ranking e Notas" no cabeçalho;
 *   - os botões de ranking no card do estado, no mapa;
 *   - as páginas /ranking e /ranking/<uf>, que passam a responder 404;
 *   - o envio de cartão-resposta, que é recusado mesmo por POST direto — uma
 *     Server Action é alcançável sem passar pela nossa tela.
 *
 * O que isto NÃO mexe: as tabelas (provas, matérias, gabaritos e os cartões já
 * enviados continuam no banco) e o painel administrativo, onde as provas
 * seguem editáveis. Religar não perde nada.
 */
export const RANKING_ATIVO = false;
