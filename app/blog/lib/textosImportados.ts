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
  // 1. Concurso Perícia Oficial MA: 25 vagas para Médico-Legista e salário que chega 
  "https://www.clubeforense.com.br/post/concurso-per%C3%ADcia-oficial-ma-25-vagas-para-m%C3%A9dico-legista-e-sal%C3%A1rio-que-chega-a-r-21-mil":
    {
      resumo:
        "Edital do Cebraspe publicado: 25 vagas só para médico-legista, inscrições até 05/10/2026 e remuneração que parte de R$ 14.675,58 e passa de R$ 21 mil no topo da carreira.",
      corpo: `Acabou a espera. O **concurso Perícia Oficial MA** saiu do campo das promessas: com edital publicado pelo **Cebraspe** e janela de inscrições já definida, a notícia interessa diretamente a quem sonha com a carreira de **Médico-Legista**. São **25 vagas** só para o cargo — o maior contingente técnico de todo o certame —, com remuneração que parte de **R$ 14.675,58** e ultrapassa **R$ 21 mil** no topo da carreira. Agora, cada dia conta.

## Concurso Médico-Legista MA: resumo do certame

| Informação | Detalhe |
| --- | --- |
| **Situação** | Edital publicado (Cebraspe) |
| **Cargo (foco)** | Médico-Legista |
| **Banca** | Cebraspe |
| **Vagas (Médico-Legista)** | 25 |
| **Vagas (total Perícia Oficial)** | 76 |
| **Salário inicial** | R$ 14.675,58 |
| **Salário no topo** | R$ 21.496,79 |
| **Inscrições** | 31/07 a 05/10/2026 |
| **Escolaridade** | Nível superior (Medicina + CRM) |

## O que muda para o Médico-Legista

Diferentemente de certames antigos, em que o médico entrava quase como coadjuvante dentro de um bloco maior de cargos policiais, o novo **concurso Perícia Oficial MA** coloca o **Médico-Legista** no centro da reestruturação da perícia maranhense. A Perícia Oficial do Maranhão hoje possui autonomia administrativa, financeira e orçamentária, o que dá à carreira um peso institucional próprio dentro da estrutura de segurança do estado.

Na prática, isso significa três coisas para o médico interessado: **mais vagas**, **remuneração reestruturada** e **um plano de carreira estável em classes e referências**. O foco deste artigo é justamente esse — tudo o que envolve outros cargos (agentes de perícia, perito criminal, odontolegista) aparece aqui apenas para contextualizar o tamanho da seleção.

## Vagas do concurso Perícia Oficial MA

O certame oferta **76 vagas** distribuídas entre os cargos da Perícia Oficial. E aqui está o dado que mais importa para o médico: o **Médico-Legista lidera a distribuição técnica**, com 25 vagas.

| Cargo | Vagas |
| --- | --- |
| Agente de Perícia Criminal | 30 |
| **Médico-Legista** | **25** |
| Agente de Perícia Médico-legal | 11 |
| Perito Criminal | 9 |
| Odontolegista | 1 |
| **Total** | **76** |

Para efeito de comparação, o último edital da Perícia no Maranhão (2017) reservou ao Médico-Legista **7 vagas imediatas** e 18 para cadastro de reserva. O novo certame já nasce com **25 vagas de largada** — um salto expressivo que sinaliza a intenção do estado de recompor o quadro pericial médico.

## Salário do Médico-Legista no MA: um dos grandes atrativos da carreira

Este é o ponto que merece toda a atenção. A remuneração inicial do Médico-Legista no Maranhão **parte de R$ 14.675,58** a partir de julho de 2026, valor que reajustou o piso anterior de R$ 13.191,02. Mas o número que impressiona está no **desenvolvimento da carreira**: o médico avança por classes e referências até alcançar **R$ 21.496,79**.

| Classe / Referência | Remuneração (a partir de julho/2026) |
| --- | --- |
| A1 (inicial) | R$ 14.675,58 |
| A2 | R$ 15.115,85 |
| A3 | R$ 15.569,32 |
| B4 | R$ 16.503,49 |
| B5 | R$ 16.998,58 |
| B6 | R$ 17.508,54 |
| C7 | R$ 18.559,05 |
| C8 | R$ 19.115,83 |
| C9 | R$ 19.689,31 |
| Especial 10 | R$ 20.870,67 |
| **Especial 11 (topo)** | **R$ 21.496,79** |

Alguns destaques que o candidato precisa enxergar:

- **O piso já entra acima de R$ 14 mil**, patamar superior ao de diversos concursos de Médico-Legista realizados recentemente em outros estados.
- **A progressão é real e estruturada** — não depende de gratificações incertas, mas de referências previstas em lei.
- Somado à **estabilidade do serviço público** e à autonomia orçamentária da Perícia Oficial, o cargo se firma como um dos mais sólidos para o médico que deseja migrar para a **Medicina Legal**.

## Etapas do concurso Perícia Oficial MA

Seguindo o modelo do Cebraspe para a perícia maranhense, a seleção é composta por **duas etapas**, com múltiplas fases de caráter eliminatório e/ou classificatório.

| Etapa | Fase | Caráter |
| --- | --- | --- |
| 1ª | Prova Objetiva | Eliminatório e classificatório |
| 1ª | Prova Discursiva | Eliminatório e classificatório |
| 1ª | Avaliação de Títulos | Classificatório |
| 1ª | Exames médicos e toxicológico | Eliminatório |
| 1ª | Teste de Aptidão Física (TAF) | Eliminatório |
| 1ª | Avaliação Psicológica | Eliminatório |
| 1ª | Investigação Social e Funcional | Eliminatório |
| 2ª | Curso de Formação Profissional | Eliminatório e classificatório |

A **prova objetiva** reúne **20 questões de Conhecimentos Gerais** e **40 questões de Conhecimentos Específicos**, com eliminação de quem não atingir a pontuação mínima. É uma prova em que o **domínio técnico da área específica pesa o dobro** — exatamente onde o preparo em Medicina Legal faz diferença. Confira sempre o edital publicado para as datas exatas de cada fase.

## Disciplinas cobradas para Médico-Legista

O conteúdo se divide entre **Conhecimentos Gerais** e **Conhecimentos Específicos**. Para o Médico-Legista, o coração da prova está na segunda parte — e o candidato que trata a **Medicina Legal** como prioridade sai na frente.

| Bloco | Principais disciplinas |
| --- | --- |
| **Conhecimentos Gerais** | Língua Portuguesa, Direito Constitucional, Direito Administrativo, Direitos Humanos, Legislação institucional |
| **Conhecimentos Específicos** | **Medicina Legal**, Tanatologia Forense, Traumatologia Forense, Sexologia Forense, Toxicologia Forense, Patologia Forense, Psiquiatria Forense, Antropologia e Identificação Médico-Legal |

Vale reforçar: **Medicina Legal é a espinha dorsal da prova específica**. Temas como exame de corpo de delito, tanatologia (fenômenos cadavéricos e cronotanatognose), lesões corporais, asfixiologia e documentos médico-legais são recorrentes nas provas do Cebraspe e costumam separar os aprovados dos reprovados.

## Requisitos para o cargo de Médico-Legista

Os requisitos são objetivos e concentram-se na formação médica:

- **Diploma de graduação em Medicina**, emitido por instituição reconhecida pelo MEC;
- **Registro ativo no Conselho Regional de Medicina (CRM)**;
- Demais requisitos gerais de investidura em cargo público (nacionalidade, quitação eleitoral e militar, idade mínima etc.).

Não há exigência de residência ou especialização em Medicina Legal para concorrer — o que **amplia o público apto** e, ao mesmo tempo, aumenta a concorrência entre médicos de diferentes formações.

## Por que essa notícia é importante?

Porque o edital publicado muda completamente o jogo. Enquanto a seleção era apenas "prevista", ainda dava para adiar. Agora não dá mais — e é isso que o candidato precisa entender:

- **A janela de inscrições já tem data** (31/07 a 05/10/2026): o prazo é real e corre a partir de agora.
- **O relógio até a prova começou a contar.** Entre a publicação do edital e o dia da prova existe um intervalo curto, e ele é o mesmo para todo mundo — a diferença estará em quem já vinha estudando.
- **A concorrência se forma nesta fase.** Cada dia de edital aberto é um dia em que milhares de médicos de todo o país se organizam para disputar as 25 vagas.
- **As regras estão definidas.** Cargo, vagas, salário, etapas e conteúdo já são conhecidos. Não há mais o que esperar para direcionar os estudos exatamente ao que cai.

Quando o edital sai, a preparação deixa de ser uma aposta e passa a ser uma corrida contra o cronograma. **Quem se movimenta primeiro larga na frente.**

## Por que começar a estudar agora?

Porque a Medicina Legal não se aprende em regime de urgência. Veja o raciocínio com calma:

- **O conteúdo específico é extenso e técnico.** Tanatologia, traumatologia, sexologia forense, toxicologia, patologia e psiquiatria forense exigem tempo de assentamento e revisão — não se consolida em poucas semanas.
- **São poucas vagas para um universo grande de médicos.** Com 25 vagas e sem exigência de especialização prévia, a concorrência tende a ser acirrada, e a diferença virá do preparo específico.
- **O estilo Cebraspe tem particularidades.** O modelo "certo/errado" pune o chute e premia quem domina o detalhe. Isso se treina com antecedência.
- **Com o edital na rua, o tempo de estudo virou recurso escasso.** O candidato que só começa agora, sem direcionamento, disputa em desvantagem contra quem já tem meses de Medicina Legal rodando. A única forma de recuperar terreno é estudar o conteúdo certo, na ordem certa, com quem conhece a prova.

Com o edital publicado, não existe mais "depois". **É agora que se constrói a aprovação — e com método.**

## 🎯 Mentoria Aprova Legista: sua vaga começa por aqui

Estudar sozinho, sem direção, é o caminho mais longo — e, com o edital já na rua, é o mais arriscado. A **Mentoria Aprova Legista**, do Clube Forense, foi criada exatamente para o médico que quer transformar o tempo curto até a prova em aprovação.

O que torna a mentoria diferente de estudar por conta própria:

- **Direcionamento cirúrgico ao edital.** Nada de se perder em conteúdo que não cai. Você estuda o que a banca cobra, na profundidade que ela exige.
- **Foco total em Medicina Legal e nas disciplinas específicas** — o bloco que decide a aprovação no cargo de Médico-Legista.
- **Acompanhamento próximo e correção de rota**, para você não desperdiçar semanas em caminhos errados nem chegar à prova com lacunas.
- **Método construído para a realidade do médico**, que concilia estudo com plantões, rotina clínica e pouco tempo livre.

As vagas da mentoria são limitadas e a preparação já está em andamento junto com a abertura das inscrições do concurso. **Entrar agora é a diferença entre correr atrás e sair na frente.**

👉 [Mentoria Aprova Legista](http://clubeforense.com.br/mentoriaaprovalegista)

Não espere para começar. As 25 vagas já têm dono na cabeça de quem começou antes — garanta que seja você.

## Onde o Maranhão está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=MA).`,
    },
  // 2. Concurso PC-AC: edital previsto até dezembro segundo o delegado-geral.
  "https://www.clubeforense.com.br/post/concurso-pc-ac-edital-previsto-at%C3%A9-dezembro-ter%C3%A1-4-vagas-para-m%C3%A9dico-legistado-delegado-geral":
    {
      resumo:
        "O delegado-geral da PC-AC diz esperar o edital até dezembro de 2026. São 139 vagas no total, 4 delas para Perito Médico-Legista — carreira que ficou de fora do último concurso, em 2017.",
      corpo: `O novo concurso da **Polícia Civil do Acre (PC-AC)** ganhou uma previsão concreta para publicação do edital. De acordo com o delegado-geral da corporação, Pedro Buzolin, a expectativa é que o documento seja publicado **até dezembro de 2026**.

Para quem acompanha os concursos de **Medicina Legal**, a principal informação é a confirmação de **4 vagas para Perito Médico-Legista**.

Ao todo, o concurso terá **139 vagas**, mas o foco para os médicos deve estar nessas quatro oportunidades específicas para ingresso na carreira médico-legal.

## Concurso PC-AC para Médico-Legista: resumo

| Informação | Detalhe |
| --- | --- |
| **Situação** | Concurso anunciado e banca em definição |
| **Cargo** | Perito Médico-Legista |
| **Vagas para Médico-Legista** | **4** |
| **Total do concurso** | 139 vagas |
| **Previsão do edital** | **Até dezembro de 2026** |
| **Banca** | Em definição |
| **Escolaridade** | Nível superior |

## PC-AC confirma 4 vagas para Médico-Legista

A distribuição anunciada prevê **4 vagas para Perito Médico-Legista**, além das oportunidades destinadas às demais carreiras da Polícia Civil.

Esse é um dado importante porque confirma que a **Medicina Legal estará presente no próximo concurso da PC-AC**. Agora, a expectativa fica pela publicação do edital, que deverá detalhar requisitos, remuneração, conteúdo programático, etapas e demais regras específicas para os médicos.

O concurso foi inicialmente anunciado em abril e agora entra em uma nova fase de organização.

## Banca deve ser anunciada em breve

Atualmente, o processo está na etapa de **definição da banca organizadora**.

Após a escolha da instituição e a assinatura do contrato, será possível avançar para a definição precisa do cronograma da seleção.

A declaração do delegado-geral estabelece **dezembro como prazo esperado para a publicação do edital**, o que reduz significativamente a janela disponível para quem pretende iniciar a preparação somente após conhecer todas as regras.

## Último concurso não teve Médico-Legista

O último concurso da Polícia Civil do Acre ocorreu em **2017**, sob organização do **Ibade**, e ofertou 250 vagas.

Um detalhe importante para os médicos é que **não houve oferta para Perito Médico-Legista naquele edital**.

Isso torna o novo concurso particularmente relevante para a Medicina Legal: além de confirmar a presença da carreira, já estabelece **4 vagas específicas** para Médico-Legista.

## Por que começar a preparação antes do edital?

A PC-AC já confirmou três informações fundamentais: **o concurso será realizado, haverá 4 vagas para Médico-Legista e o edital é esperado até dezembro**.

O que falta agora é a definição da banca e a publicação das regras detalhadas.

Para o candidato, isso significa que o período pré-edital já pode ser utilizado para construir uma base sólida em **Medicina Legal**, deixando o período posterior à publicação do edital para adequação ao conteúdo e ao perfil da banca escolhida.

Com apenas **4 vagas previstas**, a preparação específica ganha ainda mais importância. Esperar a publicação do edital para iniciar os estudos reduz o tempo disponível justamente para uma área técnica e extensa como a Medicina Legal.

## Prepare-se para os concursos de Médico-Legista

O **Preparatório do Clube Forense** é voltado especificamente para médicos que desejam ingressar na carreira de Médico-Legista e permite começar a preparação ainda no período pré-edital.

**Preparatório Clube Forense:**[Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

Com a previsão de edital até dezembro e **4 vagas já confirmadas para Perito Médico-Legista**, a PC-AC passa a integrar oficialmente o radar dos próximos concursos de Medicina Legal.

## Onde o Acre está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=AC).`,
    },
  // 3. Concurso PC-TO: Termo de Referência confirma Medicina Legal entre as 60 vagas 
  "https://www.clubeforense.com.br/post/concurso-pc-to-termo-de-refer%C3%AAncia-confirma-medicina-legal-entre-as-60-vagas-para-perito-oficial":
    {
      resumo:
        "O Termo de Referência da PC-TO confirma Medicina Legal entre as áreas do cargo de Perito Oficial, dentro das 60 vagas da carreira.",
      corpo: `O novo concurso da **Polícia Civil do Tocantins (PC-TO)** acaba de avançar mais uma etapa importante. O **Termo de Referência foi divulgado** e estabelece os principais parâmetros da seleção, incluindo **452 vagas imediatas** e, principalmente para os médicos, a confirmação de **Medicina Legal entre as áreas do cargo de Perito Oficial**.

Ao todo, serão **60 vagas para Perito Oficial**. A quantidade específica destinada à **Medicina Legal ainda não foi apresentada no Termo de Referência**, portanto é importante aguardar o edital antes de afirmar quantas dessas oportunidades serão destinadas aos médicos.

O documento também estabelece um ponto importante: **não haverá cadastro de reserva**. A previsão é de que as nomeações fiquem restritas aos candidatos classificados dentro das vagas ofertadas.

## PC-TO: situação atual do concurso

| Informação | Situação |
| --- | --- |
| **Status** | Termo de Referência divulgado |
| **Total de vagas** | 452 |
| **Vagas para Perito Oficial** | **60** |
| **Medicina Legal** | **Área confirmada** |
| **Vagas específicas para Medicina Legal** | Aguardando definição no edital |
| **Cadastro de reserva** | Não haverá |
| **Banca** | Em processo de definição |
| **Escolaridade** | Nível superior |
| **Taxa estimada para Perito** | R$ 250,00 |

## 60 vagas para Perito Oficial: Medicina Legal está confirmada

As **60 oportunidades para Perito Oficial** serão distribuídas entre diferentes formações técnicas.

O Termo de Referência já relaciona áreas como Engenharia, Computação, Medicina Veterinária, Química/Farmácia e, de especial interesse para nosso público, **Medicina Legal**.

Esse é um avanço importante porque deixa de existir apenas uma expectativa sobre a participação dos médicos no próximo concurso: **Medicina Legal está formalmente contemplada no planejamento da seleção**.

O que ainda precisamos aguardar é o quadro definitivo do edital informando **quantas das 60 vagas serão destinadas especificamente à Medicina Legal**.

## Como serão as provas para Perito Oficial?

O Termo de Referência já antecipa uma parte considerável da estrutura da seleção.

Para **Perito Oficial**, estão previstas **80 questões na prova objetiva**, divididas entre conteúdos comuns e conhecimentos relacionados à área específica escolhida pelo candidato.

Além disso, haverá **prova discursiva com duas questões relacionadas à área de atuação**.

Isso torna a preparação específica especialmente importante para quem pretende concorrer pela área de Medicina Legal.

## Etapas previstas para Perito Oficial

A seleção deverá ser dividida em duas etapas. Para Perito Oficial, estão previstas:

| Fase | Característica |
| --- | --- |
| **Prova objetiva** | 80 questões |
| **Prova discursiva** | 2 questões da área específica |
| **Avaliação psicológica** | Eliminatória |
| **Avaliação médica** | Eliminatória |
| **Avaliação de capacidade física** | Eliminatória |
| **Investigação social** | Eliminatória |
| **Curso de Formação Policial** | Segunda etapa / eliminatório |

A prova oral e a avaliação de títulos previstas no planejamento são específicas para Delegado e **não integram as fases indicadas para Perito Oficial**.

## Termo de Referência coloca o edital da PC-TO mais perto

A divulgação do Termo de Referência é especialmente relevante porque o documento estabelece elementos essenciais para a contratação da instituição que organizará o concurso.

Já estão definidos pontos como **quantidade de vagas, estrutura das avaliações, número de questões, estimativa das taxas e áreas contempladas**.

Agora, um dos principais passos é a definição da banca organizadora e, posteriormente, a publicação do edital.

Para quem pretende disputar uma vaga em **Medicina Legal**, portanto, o concurso deixa de ser apenas uma possibilidade distante: já existe uma estrutura concreta para a realização da seleção.

## Por que começar a preparação para PC-TO agora?

Para os médicos interessados na PC-TO, o momento é particularmente importante.

Já sabemos que haverá **Medicina Legal**, sabemos que existem **60 vagas para Perito Oficial** e que a prova específica terá peso relevante, inclusive com **duas questões discursivas diretamente relacionadas à área de atuação**.

Esperar a publicação do edital significa deixar para iniciar a preparação quando a banca, o cronograma e a distribuição definitiva das vagas já estiverem definidos.

Quem começa agora pode construir a base de **Medicina Legal** antes da abertura oficial das inscrições e, depois da publicação do edital, concentrar esforços nos ajustes específicos exigidos pela banca escolhida.

## Prepare-se para Medicina Legal na PC-TO

O **Preparatório do Clube Forense já está com vagas abertas** para médicos que desejam começar a preparação para concursos de Médico-Legista e Medicina Legal.

A preparação antecipada permite avançar no conteúdo específico enquanto os últimos passos administrativos da PC-TO são concluídos.

👉 **Comece sua preparação:** [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Grupo gratuito para Médicos-Legistas

Também temos uma comunidade gratuita para quem deseja acompanhar as principais movimentações dos concursos de Medicina Legal em todo o Brasil.

👉 **Entre gratuitamente no grupo:** [Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

## Onde o Tocantins está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=TO).`,
    },
  // 4. Concurso PCDF: edital cada vez mais próximo e salário de R$ 27.831,70
  "https://www.clubeforense.com.br/post/concurso-pcdf-edital-cada-vez-mais-pr%C3%B3ximo-e-sal%C3%A1rio-de-r-27-831-70":
    {
      resumo:
        "O concurso mais aguardado da área pericial segue avançando: 75 vagas no total, sendo 25 imediatas e 50 de cadastro de reserva, com remuneração inicial de R$ 27.831,70.",
      corpo: `O concurso da **Polícia Civil do Distrito Federal (PCDF)** segue avançando e se consolida, sem exagero, como **um dos concursos mais aguardados da área pericial — se não o mais aguardado do país**.

As informações mais recentes indicam que o processo para publicação do novo edital **está bem encaminhado**, reforçando que a abertura do certame é questão de tempo.

## 📌 Visão geral do concurso PCDF

- **Órgão:** Polícia Civil do Distrito Federal
- **Cargo:** Perito Criminal
- **Situação:** Concurso em fase avançada de preparação, com movimentações administrativas e planejamento em andamento
- **Área:** Polícia Científica / Perícia Criminal

Esse cenário demonstra claramente que o edital **não está apenas no campo das expectativas**, mas em **fase concreta de organização**.

## 📊 Vagas previstas

Até o momento, as informações mais consistentes apontam para:

- **75 vagas no total** — 25 imediatas e 50 para cadastro de reserva

Esse quantitativo reforça o alto potencial de nomeações ao longo da validade do concurso, especialmente considerando o histórico da PCDF.

## 💰 Salário inicial: um dos maiores do país

O grande destaque do concurso PCDF está na remuneração:

> **💰 Salário inicial de R$ 27.831,70**

Esse valor coloca o concurso da PCDF no **topo da carreira pericial no Brasil**, sendo atualmente **o melhor salário entre os concursos da área de perícia criminal**, o que explica o altíssimo nível de interesse e concorrência esperada.

## 🔥 Por que este é um dos concursos mais aguardados da área?

Alguns fatores tornam o concurso PCDF extremamente desejado:

- Um dos **maiores salários da perícia criminal no país**
- Estrutura de carreira sólida e valorizada
- Órgão reconhecido nacionalmente pela excelência técnica
- Alta expectativa de nomeações ao longo do cadastro de reserva
- Longo intervalo desde o último certame, aumentando a demanda reprimida

Por esses motivos, muitos especialistas já consideram este **o concurso mais aguardado da área pericial atualmente**.

## ⏳ O que as movimentações indicam?

O avanço das discussões, estudos e divulgações sobre vagas e estrutura do concurso indicam que:

- O edital **está em fase de amadurecimento**
- As etapas burocráticas estão sendo vencidas
- O concurso **não será uma surpresa**, mas sim um processo anunciado gradualmente

Ou seja, quem esperar pelo edital para começar a estudar **chegará atrasado**.

## 🎯 Preparação antecipada é fundamental

Diante de:

- **Salário de R$ 27.831,70**
- **75 vagas previstas**
- **Altíssimo nível de concorrência**
- **Concurso em fase avançada**

👉 **Começar a preparação agora não é diferencial, é necessidade.**

Nosso **preparatório já está com vagas abertas**, estruturado exatamente para quem quer chegar competitivo quando o edital for publicado, cobrindo desde a base até os conteúdos mais específicos da carreira pericial.

👉 **Participe do Preparatório Aprova Legista – Clube Forense**

[Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Distrito Federal está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=DF).`,
    },
  // 5. Concurso Polícia Científica SC: Edital Publicado com Salário Inicial de R$ 27.
  "https://www.clubeforense.com.br/post/concurso-pol%C3%ADcia-cient%C3%ADfica-sc-edital-publicado-com-sal%C3%A1rio-inicial-de-r-27-737-para-m%C3%A9dico-legist":
    {
      resumo:
        "Edital da Polícia Científica de Santa Catarina publicado pela FEPESE: inscrições de 19/12/2025 a 19/01/2026, prova objetiva em 22/02/2026 e salário inicial de R$ 27.737.",
      corpo: `Foi publicado o edital para o concurso da Polícia Científica (PCI-SC), organizado pela banca **FEPESE**. O certame oferece vagas imediatas para Medicina Legal com uma das remunerações mais atrativas do país. As inscrições estão abertas de **19/12/2025 a 19/01/2026**, e a prova objetiva será realizada no dia **22/02/2026**. É o momento ideal para focar na sua aprovação e garantir estabilidade financeira e profissional.

**🩺 Vagas para Médico Legista**

O edital contempla um total de **30 vagas** para médicos, além de formação de Cadastro de Reserva (CR), distribuídas da seguinte forma:

- **Medicina Legal:** 24 vagas + CR (Ampla concorrência).
- **Medicina Legal (Psiquiatria):** 6 vagas + CR (Exige especialização ou residência em Psiquiatria).

A lotação é estratégica e abrange diversas regiões do estado, incluindo cidades como Florianópolis, Balneário Camboriú, Joinville, Chapecó, Criciúma, Lages, entre outras.

**💰 Remuneração e Benefícios**

A valorização da carreira em Santa Catarina é um grande diferencial. O subsídio inicial para a Classe III é de **R$ 27.737,24**. Ao longo da carreira, o valor pode chegar a **R$ 39.623,58** na Classe Especial.

**📝 O que cai na prova?**

Para conquistar sua vaga, é fundamental dominar o conteúdo programático. A prova exigirá conhecimentos gerais de Direito e Criminalística, além de um aprofundamento técnico em Medicina Legal. Confira os principais tópicos:

- **Conhecimentos Gerais:**
- **Conhecimentos Específicos (Medicina Legal):**

👉 Garanta a sua aprovação com o curso mais completo para Médico Legista do Brasil: [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatoriosc)

## Onde Santa Catarina está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=SC).`,
    },
  // 6. Polícia Científica de Santa Catarina: Concurso Autorizado! 60 Vagas Para Perit
  "https://www.clubeforense.com.br/post/pol%C3%ADcia-cient%C3%ADfica-de-santa-catarina-concurso-autorizado-60-vagas-para-perito-oficial":
    {
      resumo:
        "Santa Catarina anunciou 60 vagas para perito oficial pelo canal oficial no Instagram. No último concurso foram 12 vagas imediatas de médico-legista, com R$ 15.820,84.",
      corpo: `Estamos no anos dos concursos para médico-legista e agora Santa Catarina anúncia novo concurso com 60 vagas para perito oficial.

A divulgação foi feita através do seu canal oficial no Instagram, através da publicação de um vídeo.

Vale lembrar que no último concurso foram ofertadas 12 vagas imediatas para médico-legista e remuneração de R$ 15.820,84.

Com o reajuste salarial de 2025 é esperado salário de mais de R$ 27 mil.

----------------------------------------------------------------------------

**Prepare-se com quem já trilhou esse caminho!**

✅ Comece agora mesmo com nosso **preparatório completo para Médico Legista**, com aulas gravadas, resumos, simulados e banco de questões:

👉 [**clique aqui para acessar o preparatório**](https://www.clubeforense.com.br/preparatorio)

**Participe da Imersão Aprova Legista**

Quer aprender com **quem já passou por isso**? Nos dias **30 de setembro, 01 e 02 de outubro**, você terá a chance de participar da nossa **Imersão gratuita com médicos legistas aprovados**, em 3 noites de aulas ao vivo e 100% online.

Aprenda o que realmente faz a diferença na sua preparação!

🎓 Garanta sua vaga gratuitamente:

👉 [**clique aqui para entrar na Imersão Aprova Legista**](https://www.clubeforense.com.br/imersaoaprovalegista)

## Onde Santa Catarina está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=SC).`,
    },
  // 7. Edital PC PI publicado: vagas para Médico Legista!
  "https://www.clubeforense.com.br/post/edital-pc-pi-publicado-vagas-para-m%C3%A9dico-legista":
    {
      resumo:
        "Edital da PC-PI publicado com vagas de Perito Oficial Criminal Médico Legista nas especialidades geral, psiquiatria e patologia. Inicial de R$ 12.360,80 e prova em 17/11/2025.",
      corpo: `Foi publicado o edital do concurso da **Polícia Civil do Piauí (PC PI)** com **vagas para Perito Oficial Criminal Médico Legista**, incluindo oportunidades para as especialidades **geral, psiquiatria e patologia**. A remuneração inicial é de **R$ 12.360,80** e as provas serão aplicadas no dia **17 de novembro de 2025**.

As inscrições ficarão abertas entre os dias **19 de setembro e 18 de outubro**, pelo site da **FGV**. A taxa é de **R$ 120,00**.

**Quantas vagas para Médico Legista?**

O edital prevê:

- **9 vagas imediatas** — Médico Legista (Geral) 5, Psiquiatra 3, Patologista 1
- **11 vagas para cadastro de reserva**

🧾 Veja a distribuição completa de vagas por ampla concorrência, cotas e PcD:

**Como será a prova?**

A prova objetiva será composta por **80 questões**, com destaque para **Medicina Legal** e **Conhecimentos Específicos por Perfil**, que juntos representam **50% da nota total**.

**Por que começar a se preparar agora?**

O conteúdo é extenso, a concorrência é alta, e **o número de vagas é limitado**. Quem se destacar no cargo de Médico Legista precisa ter uma base sólida em áreas como **Medicina Legal, Noções de Direito, Raciocínio Lógico e Informática** — além, é claro, da sua especialidade médica.

✅ Comece agora mesmo com nosso **preparatório completo para Médico Legista da PC PI**, com aulas gravadas, resumos, simulados e banco de questões:👉 [**clique aqui para acessar o preparatório**](https://www.clubeforense.com.br/preparatoriopi)

**Participe da Imersão Aprova Legista**

Quer aprender com **quem já passou por isso**? Nos dias **30 de setembro, 01 e 02 de outubro**, você terá a chance de participar da nossa **Imersão gratuita com médicos legistas aprovados**, em 3 noites de aulas ao vivo e 100% online.

Aprenda o que realmente faz a diferença na sua preparação!

🎓 Garanta sua vaga gratuitamente:

👉 [**clique aqui para entrar na Imersão Aprova Legista**](https://www.clubeforense.com.br/imersaoaprovalegista)

## Onde o Piauí está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PI).`,
    },
  // 8. EDITAL IGP‑RS PUBLICADO! 54 vagas para Médico Legista
  "https://www.clubeforense.com.br/post/edital-igp-rs-publicado-54-vagas-para-m%C3%A9dico-legista":
    {
      resumo:
        "O maior concurso para médico legista da história do Rio Grande do Sul: 54 vagas imediatas, sendo 50 de Legista e 4 de Legista Psiquiatria, dentro de 234 vagas no total.",
      corpo: `O novo edital do Instituto‑Geral de Perícias do Rio Grande do Sul (IGP‑RS) foi publicado na data de 16 de setembro de 2025. São **234 vagas** distribuídas entre Perito Criminal, Perito Médico‑Legista e Técnico em Perícias. Para Médico Legista, há **54 vagas imediatas**, sendo **50 para Legista** e **4 para Legista Psiquiatria**.

Este já é o maior concurso público para Médico Legista da história do Rio Grande do Sul.

## Principais dados para Médico Legista

| Item | Detalhes |
| --- | --- |
| Vagas | 54 vagas imediatas (50 Legista + 4 Psiquiatria) |
| Remuneração inicial | R$ 17.078,17 |
| Inscrições | 16 de setembro a 16 de outubro de 2025 |
| Prova objetiva / redação | 14 de dezembro de 2025 |
| Banca organizadora | Fundatec |

## Requisitos para o cargo

- Diploma em Medicina reconhecido pelo MEC
- Registro profissional ativo no CRM
- Para o subtipo “Legista Psiquiatria”, também exigido especialização em Psiquiatria

**Etapas do concurso para Médico Legista**

As fases previstas que envolvem diretamente o cargo de Medicina Legista:

- Prova teórico‑objetiva e redação (eliminatórias e classificatórias)
- Avaliação psicológica
- Análise de vida pregressa
- Análise de títulos (aplicável a Perito Médico‑Legista)

## Por que se preparar agora?

- Edital já publicado — ação imediata possível pra garantir preparação em tempo útil
- Vagas expressivas para Médico Legista neste edital, com salário elevado que ultrapassa R$ 17.000
- Conteúdo das provas inclui conhecimentos específicos que exigem preparo técnico aprofundado
- Provas já programadas para dezembro, com poucas semanas até lá para consolidar estudos

**📲 Infomação extra!**

Gostaria de entender tudo do edital e ainda como cairão os assuntos de maneira gratuita? Participe da Imersão Aprova Legista nos dias 30 de setembro, 01 e 02 de outubro, gratuitamente.

**Garanta já a sua vaga!**

[Imersão Aprova Legista](https://www.clubeforense.com.br/imersaoaprovalegista)

[🎯](https://www.clubeforense.com.br/imersaoaprovalegista%F0%9F%8E%AF) **Preparatório completo para Médico Legista no Clube Forense**: [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Rio Grande do Sul está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=RS).`,
    },
  // 9. Resultado definitivo da prova discursiva da PF 2025 é divulgado
  "https://www.clubeforense.com.br/post/resultado-definitivo-da-prova-discursiva-da-pf-2025-%C3%A9-divulgado":
    {
      resumo:
        "Saiu o resultado final da prova discursiva e a convocação para o TAF do concurso da Polícia Federal 2025, que tem vagas de Perito Criminal na área Médico-Legista.",
      corpo: `Foi publicado nesta quinta-feira (5) o **resultado final da prova discursiva** e a **convocação oficial para o Teste de Aptidão Física (TAF)** do concurso da Polícia Federal 2025.

Para quem concorreu ao cargo de **Perito Criminal – Área Médico-Legista**, o momento agora é de acompanhar as próximas etapas do cronograma, que já está bastante avançado.

**Próximas etapas para Perito Médico-Legista**

As datas e atividades seguintes já foram divulgadas:

| Etapa | Data |
| --- | --- |
| **TAF (Teste de Aptidão Física)** | 13 e 14 de setembro de 2025 |
| **Envio do Formulário de Investigação Social** | 8 a 15 de setembro de 2025 |
| **Avaliações médica e biopsicossocial** | Datas previstas para setembro e outubro |

A banca organizadora do concurso é o **Cebraspe**, e o edital prevê remuneração inicial de **R$ 26.800,00** para os cargos de Perito Criminal, incluindo a especialidade Médico-Legista.

**Concursos semelhantes estão no horizonte**

Se você ainda não participou deste concurso da PF, vale ficar atento(a): **outros editais para Médico Legista já estão em fase final de preparação**, como é o caso da:

- **Polícia Civil do Piauí (PC PI)** — edital previsto para setembro
- **Polícia Civil do Distrito Federal (PC DF)** — com orçamento aprovado para 2026

**Para continuar acompanhando**

📲 **Receba atualizações em tempo real** sobre os concursos da área forense diretamente no seu celular:

👉 [Entrar no grupo gratuito do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733?utm_source=chatgpt.com)

🎯 **Quer se preparar com quem é referência em concursos para Médico Legista?**

👉 [Acesse o preparatório completo do Clube Forense](https://www.clubeforense.com.br/preparatorio?utm_source=chatgpt.com)`,
    },
  // 10. CONCURSO PC PI: EDITAL NA PRIMEIRA QUINZENA DE SETEMBRO!
  "https://www.clubeforense.com.br/post/concurso-pc-pi-edital-na-primeira-quinzena-de-setembro":
    {
      resumo:
        "O secretário de Segurança do Piauí afirma que o edital sai entre o fim de agosto e a primeira quinzena de setembro. A FGV já está definida como banca organizadora.",
      corpo: `O novo concurso da Polícia Civil do Piauí (PC PI) está cada vez mais próximo. Segundo o Secretário de Segurança Pública, Chico Lucas, o **edital será publicado entre o fim de agosto e a primeira quinzena de setembro de 2025**.

A organizadora já está definida: **Fundação Getulio Vargas (FGV)**, que neste momento finaliza os ajustes para a publicação oficial do certame.

A expectativa foi reforçada tanto pelo Secretário quanto pelo Delegado-Geral Luccy Keiko, que afirmou que o edital está "na iminência" de ser lançado.

**Vagas para Médico Legista**

De acordo com o Termo de Referência já publicado, o concurso trará:

- **200 vagas imediatas** + **200 para cadastro de reserva** no total;
- Para o cargo de **Perito Médico-Legista**, serão **9 vagas imediatas** + **9 em cadastro de reserva**.

**Salário inicial para Médico Legista**

A tabela remuneratória oficial, presente no Termo de Referência, revela a seguinte remuneração:

| Cargo | Salário Inicial |
| --- | --- |
| Médico Legista | **R$ 12.360,80** |

⚠️ A carreira oferece progressão salarial ao longo dos anos, estabilidade e todos os benefícios da segurança pública estadual.

**Etapas do concurso para Médico Legista**

Confira as etapas previstas para o cargo de Médico Legista no concurso da PC PI:

- **Prova Objetiva** (eliminatória e classificatória)
- **Prova Discursiva** (eliminatória e classificatória)
- **Avaliação de Títulos** (classificatória)
- **Exame Psicopatológico** (eliminatório)
- **Avaliação Biopsicossocial**
- **Exame de Saúde** (eliminatório)
- **Teste de Aptidão Física – TAF** (eliminatório)
- **Investigação Social** (eliminatório)
- **Heteroidentificação**
- **Curso de Formação** (eliminatório)

> ✅ *A prova oral será aplicada apenas para o cargo de Delegado. Médico Legista não passará por essa fase.*

## Por que começar a se preparar agora?

- O **edital está confirmado para as próximas semanas**: quem esperar para começar, perderá tempo precioso.
- A **concorrência é alta** e o número de vagas reduzido.
- O conteúdo costuma ser técnico e exige conhecimento profundo em **Medicina Legal, Ética, Legislação, Direito Penal e Processual Penal.**
- A **FGV é uma banca exigente**, conhecida por pegadinhas e estilo próprio de cobrança.
- A **remuneração atrativa** e a **estabilidade da carreira pública** fazem dessa uma oportunidade rara para médicos.

**Próximos passos**

Se você é médico(a) e deseja atuar na perícia oficial, esse é o momento de agir.

📲 **Entre para o grupo gratuito de médicos no WhatsApp e receba todas as atualizações:** [Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

🎯 **Comece agora sua preparação com o Clube Forense — o preparatório mais completo do Brasil para Médico Legista:** [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Piauí está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PI).`,
    },
  // 11. Concurso PC‑PI: edital previsto para agosto com vagas para Médico Legista
  "https://www.clubeforense.com.br/post/concurso-pc-pi-edital-previsto-para-agosto-com-vagas-para-m%C3%A9dico-legista":
    {
      resumo:
        "A PC-PI confirmou o edital para agosto de 2025, com a FGV como banca e o termo de referência já divulgado — incluindo o detalhamento de vagas e salários de Médico Legista.",
      corpo: `A Polícia Civil do Piauí (PC‑PI) confirmou a publicação do novo edital para agosto de 2025. A banca organizadora será a FGV e o termo de referência já foi divulgado — incluindo **detalhamento completo das vagas e salários para o cargo de Médico Legista**.

Se você é médico e deseja ingressar na carreira pericial, a hora de começar sua preparação é **agora**.

## Situação atual

| Item | Detalhes |
| --- | --- |
| Edital previsto | Agosto de 2025 |
| Banca organizadora | FGV |
| Total de vagas | 400 (200 imediatas + 200 cadastro reserva) |
| Vagas para Médico Legista | 9 imediatas + 9 cadastro reserva |

## Especialidades e vagas para Médico Legista

| Especialidade | Vagas Imediatas | Cadastro Reserva |
| --- | --- | --- |
| Psiquiatria | 3 | – |
| Patologia | 1 | – |
| Médico Generalista | 5 | 9 |
| **Total** | **9** | **9** |

## Faixa salarial da carreira

| Classe / Nível | Remuneração Bruta |
| --- | --- |
| **Classe inicial (3ª classe)** | R$ 12.360,80 |
| **Topo da carreira (1ª classe)** | R$ 17.050,52 (estimado) |

*Valores atualizados conforme o termo de referência do edital e plano de cargos vigente para carreiras da perícia oficial no Piauí.*

**Etapas previstas do concurso**

1. Prova objetiva (com conteúdo técnico e jurídico)
2. Prova discursiva
3. Avaliação de títulos
4. Exames médicos e toxicológicos
5. Avaliação biopsicossocial
6. Teste de aptidão física (TAF)
7. Investigação social
8. Curso de formação técnico-profissional

## Requisitos para o cargo

- Diploma de Medicina reconhecido pelo MEC
- Registro ativo no CRM
- Especialidade ou residência médica exigida conforme área (clínica, psiquiatria ou patologia)

## Por que começar a se preparar agora?

- O edital **já está confirmado** e será publicado em agosto - faltam poucos dias.
- A banca FGV está definida, e o estilo da prova exige preparo técnico e estratégico.
- **Poucas vagas e alta concorrência** tornam a preparação antecipada um diferencial real.
- O conteúdo programático costuma englobar temas complexos como **Medicina Legal, Direito Penal, Direito Processual Penal e Legislação Específica**.
- A carreira oferece **remuneração inicial atrativa** e possibilidade de crescimento até mais de R$ 17 mil.

**Entre para nosso grupo gratuito no WhatsApp**

Receba atualizações, alertas de edital, simulados e dicas diretamente no seu celular:

👉 [**https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733**](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**Comece sua preparação com o Clube Forense**

O preparatório mais completo do Brasil para médicos legistas:

- Aulas gravadas direcionadas
- Resumos e mapas mentais
- Banco de questões
- Mentoria e grupo de apoio

✅ **Acesse agora mesmo:**

[**www.clubeforense.com.br/preparatoriopi**](http://www.clubeforense.com.br/preparatoriopi)

## Onde o Piauí está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PI).`,
    },
  // 12. Concurso PCDF: previsão orçamentária com vagas para Médico Legista
  "https://www.clubeforense.com.br/post/concurso-pcdf-previs%C3%A3o-or%C3%A7ament%C3%A1ria-com-vagas-para-m%C3%A9dico-legista":
    {
      resumo:
        "O concurso da PCDF está previsto na Lei Orçamentária de 2026, com autorização para 105 vagas imediatas e 210 em cadastro de reserva nas carreiras periciais.",
      corpo: `O concurso da Polícia Civil do Distrito Federal (PCDF) está previsto no Projeto de Lei Orçamentária para 2026, com autorização para 105 vagas imediatas e 210 em cadastro reserva para as carreiras de Perito Criminal, Médico-Legista e Papiloscopista. Esta antecipação orçamentária indica que o edital pode ser publicado em breve.

## Situação atual do cargo de Médico Legista

| Item | Detalhes |
| --- | --- |
| Autorização | Prevista na Lei Orçamentária (PLOA) |
| Vagas | 25 imediatas + 50 cadastro reserva |
| Previsão de publicação | Último Trimestre de 2025 |
| Banca organizadora | Ainda não definida |

## Remuneração atual estimada

| Categoria da carreira | Remuneração inicial estimada |
| --- | --- |
| Classe Especial | R$ 30.542,92 |
| Primeira Classe | R$ 25.815,00 |
| Segunda Classe | R$ 22.085,08 |
| Terceira Classe | R$ 21.449,24 |

Estas faixas correspondem ao subsídio previsto para peritos, incluindo o cargo de Médico Legista, com base na recomposição salarial recente.

**Requisitos para ingressar como Médico Legista**

Para concorrer ao cargo de Perito Médico-Legista, o candidato deverá apresentar:

- Diploma de graduação em Medicina, reconhecido pelo MEC
- Registro ativo no CRM (Conselho Regional de Medicina)

**Atribuições do Médico Legista**

O profissional apto a atuar como Médico Legista terá como principais responsabilidades:

- Realizar necropsias e determinar causas da morte
- Emitir laudos médico-legais em contextos como violência, embriaguez e lesões corporais
- Produzir pareceres técnico-jurídicos com valor de prova
- Apoiar investigações criminais com embasamento técnico e científico

## Por que começar a se preparar agora?

- A previsão orçamentária já inclui a vaga, o que reforça a concretização do concurso
- O conteúdo exigido é extenso e técnico, demandando preparo antecipado
- O cargo é disputado, com número limitado de vagas — quem se prepara antes tem vantagem estratégica

## Grupo gratuito no WhatsApp

Não fique de fora das novidades sobre o edital, dicas de estudo e conteúdos exclusivos para médicos-legistas:

**Participe do grupo gratuito:**

[Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**Preparatório ideal: Clube Forense**

Para garantir sua aprovação como Médico Legista, conte com:

- Aulas temáticas com foco total no cargo
- Banco de questões e simulados específicos
- Resumos, mapas mentais e materiais visuais otimizados
- Grupo de dúvidas e mentoria com especialistas

**Comece sua preparação agora:**

[Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatoriodf)

## Onde o Distrito Federal está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=DF).`,
    },
  // 13. Polícia Civil PI: termo de referência confirma vagas para Médico Legista
  "https://www.clubeforense.com.br/post/pol%C3%ADcia-civil-pi-termo-de-refer%C3%AAncia-confirma-vagas-para-m%C3%A9dico-legista":
    {
      resumo:
        "O termo de referência da PC-PI confirma 9 vagas imediatas e 9 de cadastro de reserva para Médico Legista, com a FGV já definida como banca.",
      corpo: `O concurso da Polícia Civil do Piauí (PC‑PI) avançou oficialmente com a **publicação do termo de referência**, documento que detalha os cargos, vagas, critérios técnicos e estrutura da seleção. A banca FGV já está definida, e estão confirmadas **9 vagas imediatas + 9 em cadastro de reserva para Médico Legista**.

## Situação atual do concurso

| Item | Detalhes |
| --- | --- |
| Status | Autorizado + Termo de Referência publicado |
| Edital previsto | 2025 |
| Banca organizadora | FGV |
| Vagas para Médico Legista | 9 imediatas + 9 CR |

## 💰 Remuneração estimada

| Referência | Valor |
| --- | --- |
| Último concurso (2018) | R$ 9.834,65 |
| Faixa atual estimada | R$ 12.810,30 a R$ 17.050,52 |

## Vagas previstas por especialidade

| Área | Vagas imediatas | Cadastro reserva |
| --- | --- | --- |
| Medicina (geral) | 5 | 5 |
| Psiquiatria | 1 | 1 |
| Patologia | 3 | 3 |

Totalizando **9 vagas imediatas + 9 para cadastro reserva** no cargo de **Perito Médico-Legista**, conforme detalhado no termo de referência da seleção.

## Histórico do último concurso

| Item | Detalhes |
| --- | --- |
| Ano | 2018 |
| Banca | NUCEPE |
| Vagas ofertadas | 9 |
| Jornada semanal | 40h |
| Salário da época | R$ 9.834,65 |

**Etapas previstas (com base no último edital)**

1. Prova objetiva (conteúdos médicos e jurídicos)
2. Prova discursiva
3. Avaliação de títulos
4. Exames médicos e toxicológicos
5. Avaliação psicológica
6. Investigação social
7. Curso de formação profissional
8. Teste de aptidão física (a confirmar para esta edição)

## Requisitos para o cargo

- Graduação em Medicina (reconhecida pelo MEC)
- Registro ativo no CRM
- Algumas especialidades podem ser exigidas conforme área de atuação

## Atribuições do Médico Legista

- Realizar necropsias e identificar causas de morte
- Avaliar lesões corporais, embriaguez, violência sexual e demais exames periciais
- Emitir laudos técnico-científicos com valor jurídico
- Apoiar investigações em articulação com a Polícia Civil e Ministério Público

## Por que começar a estudar agora?

- O termo de referência confirma as vagas, especialidades e banca
- A estrutura do edital está praticamente definida
- O conteúdo é técnico, interdisciplinar e exige preparo antecipado
- Concorrência alta, com poucas vagas específicas por área médica

**📲 Participe do nosso grupo gratuito**

👉 Receba avisos sobre o edital, dicas de preparação e materiais exclusivos: [Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**🎯 Estude com o Clube Forense**

O preparatório ideal para médicos que querem atuar na área da perícia:

- Aulas gravadas e atualizadas
- Banco de questões e resumos visuais
- Mapas mentais, PDFs e grupo de dúvidas com mentoria especializada

✅ Comece agora:

[Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatoriopi)

## Onde o Piauí está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PI).`,
    },
  // 14. PC-TO: Edital até novembro!
  "https://www.clubeforense.com.br/post/pc-to-edital-at%C3%A9-novembro":
    {
      resumo:
        "O concurso da PC-TO foi autorizado, a banca foi definida e há vagas confirmadas para Perito Médico-Legista, com edital esperado ainda em 2025.",
      corpo: `O novo concurso da Polícia Civil do Tocantins (PC‑TO) foi autorizado e está avançado. A banca organizadora já foi definida e existem **vagas confirmadas para Perito Médico‑Legista**. A expectativa é que o edital seja publicado ainda em 2025, com ações jurídicas acelerando a aprovação.

## Situação atual

| Situação | Detalhe |
| --- | --- |
| Status do concurso | Autorizado e com comissão formada |
| Previsão de edital | 2025 |
| Banca organizadora | Definida (FGV) |
| Vagas para médico legista | Aproximadamente 20 vagas |

## Remuneração esperada para Médico Legista

| Referência | Valor estimado |
| --- | --- |
| Último concurso (2014) | ~R$ 9.274,48 |
| Faixa atual estimada | ~R$ 10.300 a R$ 15.400 (primeiras classes) |

Esses valores refletem a estrutura remuneratória atual para cargos de nível superior da perícia médico‑legal no estado.

## Histórico do último concurso para Médico Legista (2014)

| Item | Detalhes |
| --- | --- |
| Ano e banca | 2014 – Fundação Aroeira |
| Vagas para médico legista | Cerca de 20 vagas |
| Salário inicial na época | Aproximadamente R$ 9.274 |
| Jornada de trabalho | 40 horas semanais |

**Etapas da seleção anterior**

1. Exame de habilidades e conhecimentos (80 questões específicas para médicos legistas/peritos)
2. Exame médico
3. Avaliação psicológica
4. Avaliação de títulos
5. (TAF não exigido para médico legista)
6. Investigações sociais e funcionais
7. Curso de formação técnico‑profissional

## Conteúdo exigido para Médico Legista

- Língua Portuguesa, Informática e Conhecimentos Regionais
- Direito Administrativo, Constitucional, Penal e Processual Penal
- Estatuto dos Policiais Civis do Tocantins
- Itens específicos da Medicina Legal e Perícia Oficial

## Requisitos para o cargo

- Bacharelado em Medicina (diploma reconhecido pelo MEC)
- Registro ativo no CRM
- CNH pode ser exigida conforme perfil da vaga

## Atribuições do Médico Legista

- Realizar necropsias e determinar causas da morte
- Avaliar lesões corporais, violência sexual, embriaguez e situações análogas
- Emitir laudos médico-legais com valor jurídico
- Apoiar investigações criminais com base científica e técnica

## Por que iniciar a preparação agora?

- Banca já definida e edital em caminho
- Conteúdo técnico e interdisciplinar exige dedicação prévia
- Vagas restritas e alta concorrência, mas índice de inscritos por vaga costuma ser menor para médico legista
- Estudar com antecedência é diferencial estratégico

**Participe da nossa comunidade gratuita**

Receba dicas, avisos sobre edital e conteúdos exclusivos voltados para médicos aspirantes à carreira de legista:

👉 **Grupo gratuito no WhatsApp:** [Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

## Comece sua preparação com o Clube Forense

O Curso ideal para médicos que desejam se especializar como médico legista:

- Aulas focadas e atualizadas
- Banco de questões e simulados
- Mapas mentais, resumos e materiais complementares
- Grupo de dúvidas com mentoria especializada

✅ **Inicie seus estudos agora mesmo:** [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Tocantins está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=TO).`,
    },
  // 15. PC-PI: FGV é a banca escolhida! Edital esperado ainda em 2025.
  "https://www.clubeforense.com.br/post/pc-pi-fgv-%C3%A9-a-banca-escolhida-edital-esperado-ainda-em-2025":
    {
      resumo:
        "A FGV foi escolhida como banca da PC-PI. O concurso está autorizado, com vagas confirmadas para Perito Médico-Legista e edital esperado para 2025.",
      corpo: `O concurso da Polícia Civil do Piauí (PC‑PI) foi oficialmente autorizado e está em fase avançada de preparação. A banca já foi definida, e há **vagas confirmadas para o cargo de Perito Médico-Legista**. A expectativa é que o edital seja publicado ainda em 2025.

## Situação atual do concurso

| Item | Detalhes |
| --- | --- |
| Situação do edital | Autorizado |
| Previsão de publicação | 2025 |
| Banca organizadora | FGV |
| Vagas para médico legista | 9 imediatas + 9 para cadastro reserva |

## 💰 Remuneração do Médico Legista

| Situação | Valor |
| --- | --- |
| Salário em 2018 | R$ 9.834,65 |
| Faixa atual estimada | R$ 12.810,30 (classe inicial) até R$ 17.050,52 (classe especial) |

Esses valores consideram a estrutura atualizada da carreira pericial médica no estado, após reajustes recentes.

## Último concurso para Médico Legista (2018)

| Item | Detalhes |
| --- | --- |
| Ano do concurso | 2018 |
| Banca organizadora | NUCEPE |
| Vagas para médico legista | 9 |
| Jornada de trabalho | 40 horas semanais |
| Salário inicial da época | R$ 9.834,65 |

**Etapas da seleção anterior**

1. Prova objetiva com conteúdos específicos (Medicina Legal, Criminalística e Direito)
2. Prova discursiva
3. Avaliação de títulos
4. Exames médicos e toxicológicos
5. Teste de aptidão física (TAF)
6. Avaliação psicológica
7. Investigação social
8. Curso de formação técnico-profissional

É possível que a nova seleção mantenha esse modelo, com adaptações específicas da banca FGV.

## Requisitos para o cargo

- Diploma de graduação em Medicina reconhecido pelo MEC
- Registro ativo no Conselho Regional de Medicina (CRM)

Algumas especializações, como Patologia, podem ser valorizadas dependendo do perfil da vaga.

## Principais atribuições do Médico Legista

- Realização de necropsias e emissão de laudos que atestam a causa da morte
- Avaliação médico-legal de vítimas e suspeitos, incluindo exames de lesões corporais, violência sexual e embriaguez
- Produção de laudos com validade jurídica para subsidiar processos criminais
- Apoio técnico a investigações conduzidas pela Polícia Civil

## Por que iniciar sua preparação agora?

- A banca FGV já foi contratada, e o edital está em fase final de ajustes
- O conteúdo exigido é denso e técnico, incluindo áreas jurídicas e médico-legais
- O número de vagas costuma ser baixo e a concorrência alta
- Quem começa antes consegue revisar o conteúdo com mais profundidade e estratégia

**📲 Grupo gratuito no WhatsApp**

Quer receber atualizações sobre o edital e materiais de estudo voltados para o cargo de médico legista?

👉 Entre no grupo gratuito:

[Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**🎯 Preparação com o Clube Forense**

O Clube Forense é o preparatório ideal para médicos que querem se tornar legistas:

- Aulas gravadas com foco total no edital
- Banco de questões e resumos visuais
- Mapas mentais, PDFs e grupo de dúvidas com especialistas

✅ Comece hoje:

[Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Piauí está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PI).`,
    },
  // 16. IGP RS: 54 Vagas Para Perito Médico Legista!
  "https://www.clubeforense.com.br/post/igp-rs-54-vagas-para-perito-m%C3%A9dico-legista":
    {
      resumo:
        "O IGP-RS prepara concurso com no mínimo 54 vagas para Perito Médico-Legista. A Fundatec já é a banca e o edital era esperado para 2025.",
      corpo: `O Instituto-Geral de Perícias do Rio Grande do Sul (IGP-RS) prepara um novo concurso público com **vagas confirmadas para o cargo de Perito Médico-Legista**. A **banca já foi definida** e a expectativa é de publicação do edital ainda em 2025.

## Situação atual

| Situação | Detalhes |
| --- | --- |
| Edital previsto | 2025 |
| **Banca organizadora** | **Fundatec** |
| Vagas para médico legista | Confirmadas (mínimo de 54 vagas) |

## 💰 Remuneração esperada para Médico Legista

| Concurso | Salário inicial estimado |
| --- | --- |
| **Último edital (2017)** | R$ 9.556,78 |
| **Faixa atual estimada para novo edital** | R$ 16.421,32 – R$ 20.526,64 |

A faixa atual é baseada na estrutura remuneratória vigente para cargos de nível superior da perícia médico-legal no estado.

## Histórico: último concurso para Médico Legista (2017)

| Item | Detalhes |
| --- | --- |
| Ano / Banca | 2017 – Fundatec |
| Vagas para médico legista | 35 |
| Salário inicial na época | R$ 9.556,78 |
| Jornada | 40 h/semana |

**🗂 Etapas da seleção anterior**

1. Prova objetiva (com foco em Medicina Legal e Direito Penal)
2. Prova discursiva
3. Avaliação de títulos
4. Exames médicos e toxicológicos
5. Avaliação psicológica
6. Investigação social
7. Curso de formação técnico‑profissional

## Conteúdo cobrado no último edital

| Tipo de conteúdo | Assuntos incluídos |
| --- | --- |
| Conhecimentos gerais | Língua Portuguesa, Informática, Raciocínio Lógico, Legislação |
| Conhecimentos específicos | Medicina Legal, Criminalística, Ética, Normas Técnicas |
| Redação | Tema dissertativo voltado ao perfil do cargo |
| Avaliações complementares | Psicológica, investigação social, saúde e condicionamento físico |

## Requisitos para o cargo

- Diploma de graduação em Medicina (nível superior reconhecido pelo MEC)
- Registro ativo no Conselho Regional de Medicina (CRM)

## Atribuições do Médico Legista

- Realizar necropsias e emitir laudos de causa da morte
- Avaliar lesões corporais, violência sexual, embriaguez e outros contextos médico-legais
- Produzir laudos com valor jurídico
- Apoiar investigações com fundamentação técnica e científica

## Por que começar a estudar agora?

- A **Fundatec já está confirmada** como banca organizadora
- O edital pode ser publicado a qualquer momento
- O conteúdo exigido é técnico, extenso e interdisciplinar
- A concorrência para o cargo de médico legista costuma ser alta
- Quem se antecipa amplia as chances de aprovação

**📲 Participe da nossa comunidade gratuita**

Quer receber atualizações, dicas e conteúdos exclusivos para concursos de médico legista?👉 **Entre no grupo gratuito do WhatsApp:**[Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**🎯 Comece sua preparação com o Clube Forense**

O **Clube Forense** é o preparatório ideal para médicos que desejam conquistar uma vaga como legista:

- Aulas gravadas com especialistas
- Banco de questões e simulados
- Mapas mentais, resumos e PDFs atualizados
- Grupo de dúvidas e mentoria

- ✅ **Comece hoje mesmo:** [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Rio Grande do Sul está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=RS).`,
    },
  // 17. PC-MA em 2025! Salários até R$ 21.496,79.
  "https://www.clubeforense.com.br/post/pc-ma-em-2025-sal%C3%A1rios-at%C3%A9-r-21-496-79":
    {
      resumo:
        "A comissão organizadora da PC-MA já está formada e há vaga confirmada para médico legista, com salários que podem chegar a R$ 21.496,79.",
      corpo: `Está iminente um novo concurso da Polícia Civil do Maranhão (PC‑MA), com previsão para **2025**, e vaga confirmada para o cargo de **médico legista**. A comissão organizadora já está formada.

## Situação atual

- **Edital previsto:** 2025
- **Comissão organizadora:** já formada
- **Cargo de médico legista:** confirmado entre as vagas da perícia oficial

## Remuneração esperada para Médico Legista

| Concurso | Salário inicial |
| --- | --- |
| **2017 (último edital)** | R$ 8.972,33 |
| **Faixa atual estimada** | R$ 12.106,46 – R$ 21.496,79 |

Valores atuais correspondem aos cargos de perícia médica no estado, com base na tabela salarial vigente.

## Histórico do último concurso para Médico Legista (2017)

| Item | Detalhes |
| --- | --- |
| **Ano / Banca** | 2017 – Cebraspe |
| **Vagas imediatas** | 7 |
| **Cadastro reserva** | 18 |
| **Carga de trabalho** | 40 h/semana |
| **Curso de formação** | Cerca de 438 horas presenciais |

**Etapas da seleção**

1. Prova objetiva (Medicina Legal + Direito Penal)
2. Prova discursiva
3. Avaliação de títulos
4. Exames médico e toxicológico
5. Teste de Aptidão Física (TAF)
6. Avaliação psicológica
7. Investigação social e funcional
8. Curso de formação técnico‑profissional

## Requisitos para o cargo

- Diploma de Medicina reconhecido pelo MEC
- Registro ativo no Conselho Regional de Medicina (CRM)

## Atribuições do Médico Legista

- Realizar necropsias e determinar causas da morte
- Produzir laudos de lesões corporais, violência sexual, embriaguez etc.
- Emitir pareceres técnicos com valor jurídico
- Auxiliar investigações com base científica e técnica

## Por que iniciar a preparação desde já?

- Comissão já formada e edital próximo
- Seleção técnica e exigente, com alto nível de concorrência
- Conteúdo exigido (Medicina Legal, Direito Penal, ética…) é amplo
- Estudar antes traz vantagem decisiva na preparação

**Entre para nossa comunidade gratuita**

👉 Receba avisos sobre edital, dicas e conteúdos exclusivos para médicos legistas

**Grupo gratuito no WhatsApp:** [Entrar no grupo do WhatsApp](https://chat.whatsapp.com/Ki5JgjFQ4tUDhzHmx29733)

**Comece sua preparação com o Clube Forense**

Preparatório completo para médicos que desejam a carreira de legista:

- Aulas gravadas 📚
- Banco de questões e mapas mentais
- Resumos, PDF e grupo de dúvidas
- Mentoria com especialistas

✅ **Acesse e comece agora mesmo:** [Preparatório do Clube Forense](https://www.clubeforense.com.br/preparatorio)

## Onde o Maranhão está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=MA).`,
    },
  // 18. Concurso PC MG: Provável banca e datas para 2024
  "https://www.clubeforense.com.br/post/concurso-pc-mg-prov%C3%A1vel-banca-e-datas-para-2024":
    {
      resumo:
        "Rumores apontam a FGV como provável banca do próximo concurso da PC-MG, com edital entre julho e agosto e provas entre outubro e dezembro.",
      corpo: `Muitos rumores estão surgindo nas redes sociais indicando que a Fundação Getulio Vargas (FGV) pode ser a escolhida como banca organizadora para o próximo concurso da PC MG (Polícia Civil de Minas Gerais).

Segundo essas fontes, a expectativa é de que o edital seja divulgado entre os meses de julho e agosto. As datas das provas, por sua vez, podem estar programadas para ocorrer entre outubro e dezembro deste ano.

No entanto, é importante ressaltar que essas especulações ainda não foram oficialmente confirmadas pela assessoria de comunicação da instituição.

O edital do concurso PC MG está previsto para oferecer um total de 255 vagas de nível superior. Essas oportunidades serão distribuídas entre os cargos de delegado de polícia (54), investigador de polícia (165), perito criminal (26) e médico-legista (10).

Para mais detalhes sobre o concurso da PC MG, possivelmente organizado pela FGV, convidamos você a acessar o link abaixo. Preparamos um artigo completo para mantê-lo informado sobre todas as atualizações relacionadas ao certame.

***Fique ligado com o Clube Forense e receba em primeira mão as atualizações referentes a todos os concursos para Médico Legista do Brasil.***

## Onde Minas Gerais está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=MG).`,
    },
  // 19. Novidades no Concurso da Politec PE: Inscrições Concluídas, Prova Agendada par
  "https://www.clubeforense.com.br/post/concurso-pol%C3%ADcia-cient%C3%ADfica-pa-banca-em-defini%C3%A7%C3%A3o-confira":
    {
      resumo:
        "As inscrições da Politec-PE foram encerradas, com 213 vagas de nível superior pelo Instituto AOCP e prova agendada para julho.",
      corpo: `As inscrições para o tão aguardado concurso da Politec PE (Polícia Técnica do Estado de Pernambuco) chegaram ao fim, com um total de 213 vagas disponíveis para candidatos com nível superior.

Os interessados tiveram a oportunidade de se inscrever até o dia 3 de junho, utilizando o portal do Instituto AOCP, responsável pela organização do certame. O valor das inscrições variou entre R$ 250,00 e R$ 300,00.

A data para a realização das provas foi marcada para o dia 21 de julho, um momento crucial para todos os candidatos que almejam uma posição na instituição.

Dentro das áreas de atuação, destacam-se as vagas para peritos criminais (77), médicos legistas (60) e agentes de medicina legal (76). Os salários oferecidos variam de R$ 4.700,00 a R$ 10.622,86, proporcionando uma oportunidade atrativa para profissionais qualificados.

É importante ressaltar que o edital passou por algumas modificações textuais recentemente. Para mais informações, recomendamos verificar as atualizações na seção de 'Retificações'.

**INFORMAÇÕES IMPORTANTES:**

Datas:

- **Inscrições**: 30/04 a 03/06
- **Isenção da taxa**: 30/04 a 06/05
- **Último dia para pagamento**: 03/06
- **Prova**: 21/07

## Sobre o concurso

- **Status:** inscrições encerradas
- **Banca**: Instituto AOCP
- **Vagas:** 213
- **Salário:** R$ 4.700,00 a R$ 10.622,86
- **Edital**: Politec PE-2024

## Onde Pernambuco está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=PE).`,
    },
  // 20. Concurso Polícia Científica GO: Falta menos de 1 semana para o fim das incriçõ
  "https://www.clubeforense.com.br/post/concurso-pol%C3%ADcia-cient%C3%ADfica-go-saiu-edital-com-117-vagas":
    {
      resumo:
        "A Polícia Científica de Goiás oferece 88 vagas imediatas e 29 de cadastro de reserva para Médico Legista e Odontolegista, com inscrições até 17/06/2024.",
      corpo: `A Polícia Científica do Estado de Goiás está oferecendo 88 vagas imediatas, além de 29 para cadastro de reserva, todas elas exigindo ensino superior para os cargos de Médico Legista e Odontolegista.

***As inscrições estão prestes a serem encerradas no dia 17 de junho de 2024.***

A taxa é de R$ 180,00. A remuneração oferecida é de R$ 12.974,15.

O certame está sendo organizado pela banca IADES, e as datas das provas objetivas estão definidas para 28 de julho de 2024 (Odontolegista) e 4 de agosto de 2024 (Médico-Legista).

Vale ressaltar que esse concurso tem um grande diferencial referente ao número significativo de vagas para o cargo de Perito Médico Legal.

Datas:

- **Inscrições**: 17 de maio a 17 de junho
- **Isenção da taxa**: 3 a 8 de maio
- **Último dia para pagamento**: 19 de junho
- **Prova**: 28 de julho e 4 de agosto

## Onde Goiás está hoje

Veja em que etapa está o edital, as vagas e o salário no [mapa dos concursos](/?uf=GO).`,
    },
};
