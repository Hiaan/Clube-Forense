// O texto dos posts que vieram do blog antigo.
//
// POR QUE ESTÁ NO CÓDIGO. O feed do Wix entrega título, data e capa, mas não o
// corpo — ele é montado no navegador de quem lê. O texto chegou aqui colado à
// mão, e este arquivo é onde ele fica: versionado, revisável num diff e
// aplicado pelo mesmo caminho em qualquer ambiente. A alternativa seria digitar
// vinte vezes no painel de produção, sem registro de quem mudou o quê.
//
// A CHAVE É O ENDEREÇO DE ORIGEM, e não o título nem o slug. O título o Wix
// deixa editar a qualquer momento, e o slug daqui é derivado dele; o endereço
// do post lá é o que não muda. É por ele que a importação já casa os
// rascunhos.
//
// O TEXTO É DELES, não meu. O que fiz foi converter o formato: a tabela virou
// tabela de verdade, os subtítulos viraram `##`, o link do preparatório virou
// link e as menções ao estado ganharam o gancho para o mapa. Nenhum número,
// nenhuma afirmação e nenhuma data foram mexidos — inclusive onde o texto
// diverge da nossa própria base, que é assunto a resolver com quem escreveu, e
// não em silêncio durante uma migração.

export interface TextoImportado {
  /** Resumo de duas linhas para o cartão e para a prévia do buscador. */
  resumo: string;
  /** Corpo em markdown. */
  corpo: string;
}

/** Endereço do post no blog antigo → o texto dele. */
export const TEXTOS_IMPORTADOS: Record<string, TextoImportado> = {
  "https://www.clubeforense.com.br/post/concurso-pc-ac-edital-previsto-at%C3%A9-dezembro-ter%C3%A1-4-vagas-para-m%C3%A9dico-legistado-delegado-geral":
    {
      resumo:
        "O delegado-geral da PC-AC diz esperar o edital até dezembro de 2026. São 139 vagas no total, 4 delas para Perito Médico-Legista — carreira que ficou de fora do último concurso, em 2017.",
      corpo: `O novo concurso da Polícia Civil do Acre (PC-AC) ganhou uma previsão concreta para a publicação do edital. Segundo o delegado-geral da corporação, Pedro Buzolin, a expectativa é que o documento seja publicado **até dezembro de 2026**.

Para quem acompanha os concursos de Medicina Legal, a informação principal é a confirmação de **4 vagas para Perito Médico-Legista**. Ao todo, o concurso terá 139 vagas, mas o foco para os médicos está nessas quatro oportunidades específicas de ingresso na carreira médico-legal.

## Resumo do certame

| Informação | Detalhe |
| --- | --- |
| Situação | Concurso anunciado e banca em definição |
| Cargo | Perito Médico-Legista |
| Vagas para Médico-Legista | 4 |
| Total do concurso | 139 vagas |
| Previsão do edital | Até dezembro de 2026 |
| Banca | Em definição |
| Escolaridade | Nível superior |

## PC-AC confirma 4 vagas para Médico-Legista

A distribuição anunciada prevê 4 vagas para Perito Médico-Legista, além das oportunidades destinadas às demais carreiras da Polícia Civil.

Esse é um dado importante porque confirma que a Medicina Legal estará presente no próximo concurso da PC-AC. Agora, a expectativa fica pela publicação do edital, que deverá detalhar requisitos, remuneração, conteúdo programático, etapas e demais regras específicas para os médicos.

O concurso foi inicialmente anunciado em abril e agora entra em uma nova fase de organização.

## Banca deve ser anunciada em breve

Atualmente, o processo está na etapa de definição da banca organizadora.

Após a escolha da instituição e a assinatura do contrato, será possível avançar para a definição precisa do cronograma da seleção.

A declaração do delegado-geral estabelece dezembro como prazo esperado para a publicação do edital, o que reduz significativamente a janela disponível para quem pretende iniciar a preparação somente após conhecer todas as regras.

## Último concurso não teve Médico-Legista

O último concurso da Polícia Civil do Acre ocorreu em 2017, sob organização do Ibade, e ofertou 250 vagas.

Um detalhe importante para os médicos é que não houve oferta para Perito Médico-Legista naquele edital.

Isso torna o novo concurso particularmente relevante para a Medicina Legal: além de confirmar a presença da carreira, já estabelece 4 vagas específicas para Médico-Legista.

## Por que começar a preparação antes do edital?

A PC-AC já confirmou três informações fundamentais: o concurso será realizado, haverá 4 vagas para Médico-Legista e o edital é esperado até dezembro.

O que falta agora é a definição da banca e a publicação das regras detalhadas.

Para o candidato, isso significa que o período pré-edital já pode ser utilizado para construir uma base sólida em Medicina Legal, deixando o período posterior à publicação do edital para adequação ao conteúdo e ao perfil da banca escolhida.

Com apenas 4 vagas previstas, a preparação específica ganha ainda mais importância. Esperar a publicação do edital para iniciar os estudos reduz o tempo disponível justamente para uma área técnica e extensa como a Medicina Legal.

## Onde o estado está hoje

No nosso monitor, o Acre aparece com a banca em definição. Veja a etapa, as vagas e o salário no [mapa dos concursos](/?uf=AC).

## Prepare-se para os concursos de Médico-Legista

O [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio) é voltado especificamente para médicos que desejam ingressar na carreira de Médico-Legista e permite começar a preparação ainda no período pré-edital.

Com a previsão de edital até dezembro e 4 vagas já confirmadas para Perito Médico-Legista, a PC-AC passa a integrar oficialmente o radar dos próximos concursos de Medicina Legal.`,
    },
};
