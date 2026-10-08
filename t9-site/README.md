# Site da T9 ADS Company

Landing page da T9, construída a partir do carrossel "Entenda o que a T9 faz", com um agendador de consultoria no final.

Projeto independente do site do Clube Forense: tem o próprio `package.json` e é publicado separadamente.

## Seções

1. **Hero** — "Entenda o que a T9 faz"
2. **Faixa rolante** — serviços e plataformas
3. **1 · Entender** — "Tudo começa no alinhamento", com os 8 pontos do diagnóstico
4. **2 · Estruturar** — trajetória Hoje → Objetivo, desenhada ao rolar
5. **3 · Construir** — serviços e "E muito mais"
6. **Resultados** — cards de valor gasto com contadores
7. **Feedbacks** — conversas de clientes, com nomes e marcas ocultados
8. **Método** — as 4 semanas, com a linha que acende ao rolar
9. **Agendamento** — dados (nome, e-mail, WhatsApp e faturamento opcional), depois data e horário, depois a confirmação

## Idiomas

O site existe em português (`/`), inglês (`/en`) e espanhol (`/es`). O seletor **PT · EN · ES** fica no cabeçalho.

- Todos os textos ficam em `lib/dicionarios/` (`pt.ts`, `en.ts`, `es.ts`), com a mesma estrutura. Para mudar um texto, edite o arquivo do idioma.
- Nos textos, `**trecho**` vira negrito e `{chave}` é preenchido pelo site (nome, data etc.).
- As conversas dos depoimentos ficam em português nos três idiomas, por serem mensagens reais.
- Cada lead registra o idioma em que a pessoa viu o site (campo `idioma`, também no e-mail e no CSV).

## Rodar localmente

```bash
cd t9-site
npm install
npm run dev
```

## Para onde vão os leads

O formulário envia para `POST /api/agendamento`, que repassa o lead:

- por e-mail para `NEXT_PUBLIC_LEAD_EMAIL`, usando o [FormSubmit](https://formsubmit.co), direto do navegador do visitante. O FormSubmit recusa chamadas vindas de servidores. Não precisa de conta. No primeiro envio, chega um e-mail de ativação que precisa ser clicado uma vez.
- em JSON para a URL de `LEAD_WEBHOOK_URL`. Essa URL pode ser de Zapier, Make, n8n, Google Apps Script (planilha) ou do próprio CRM.

São dois envios:

- `etapa: "lead"` — logo depois de preencher os dados. Assim o contato fica salvo mesmo que a pessoa não escolha horário.
- `etapa: "agendamento"` — com `reuniao.data` e `reuniao.horario`, no horário de Brasília.

```json
{
  "etapa": "agendamento",
  "nome": "Maria Silva",
  "email": "maria@empresa.com.br",
  "whatsapp": "5511912345678",
  "whatsappFormatado": "(11) 91234-5678",
  "faturamento": "De R$ 40 mil a R$ 100 mil/mês",
  "reuniao": {
    "data": "2026-10-01",
    "horario": "15:00",
    "fuso": "America/Sao_Paulo",
    "descricao": "quinta-feira, 1 de outubro, às 15:00 (horário de Brasília)"
  },
  "origem": "https://site.com/?utm_source=instagram",
  "recebidoEm": "2026-09-30T21:00:00.000Z"
}
```

Todo lead é guardado no **Vercel Blob** (um arquivo JSON por envio, na pasta `leads/`) e aparece em **`/leads?chave=SUA_CHAVE`**, agrupado por pessoa. A mesma página tem o botão para baixar a planilha em CSV.

Para funcionar, o Blob store precisa estar conectado ao projeto na Vercel (Storage → Create → Blob, com acesso **Private**). A conexão cria o `BLOB_READ_WRITE_TOKEN` sozinha.

> Os leads também vão para os logs da Vercel (`[agendamento] Lead recebido`), mas lá duram pouco: cerca de 1 hora no plano gratuito.

## Painel do cliente

O painel fica em **`/painel`** (e em `painel.t9company.com.br`, quando o subdomínio for apontado para a Vercel). Os dados ficam no Postgres da Neon, conectado ao projeto na Vercel (`DATABASE_URL`). As tabelas são criadas sozinhas no primeiro acesso.

**Entrar.** Não tem senha: a pessoa digita o e-mail e recebe um link de uso único, que vale 15 minutos. O link abre uma tela com o botão "Entrar no painel", para que antivírus de e-mail não gastem o link antes da pessoa. A sessão dura 30 dias.

- Os e-mails em `PAINEL_ADMINS` entram como administradores, mesmo antes de existirem no banco. É assim que o primeiro acesso acontece.
- Os e-mails saem pelo [Resend](https://resend.com) (`RESEND_API_KEY`). Sem a chave, o link vai para os logs da Vercel (Logs → procurar "RESEND_API_KEY ausente").

**Perfis.**

| Perfil | O que vê e faz |
|---|---|
| Administrador | Todos os clientes. Cria e exclui clientes, gerencia a equipe e tudo o que o gestor faz |
| Gestor | Só os clientes atribuídos a ele. Lança dados, importa CSV, edita metas, plano e comentário, libera acesso para o cliente |
| Cliente | Só a(s) própria(s) empresa(s): visão geral, campanhas, leads (pode mudar a etapa) e plano (só leitura) |

**Telas do cliente** (em português, inglês ou espanhol, conforme a conta):

- **Visão geral:** indicadores do período com a comparação contra o período anterior, gráficos diários, metas do mês com o ritmo e a "palavra do gestor". Para e-commerce o foco é ROAS e receita; para geração de leads, custo por lead.
- **Campanhas:** tabela por campanha e plataforma.
- **Leads:** funil (novo, em contato, reunião, proposta, fechado, perdido), com link direto para o WhatsApp.
- **Plano de 4 semanas:** os itens do método e o andamento de cada um.

**Gestão T9** (`/painel/admin`):

- **Carteira:** todos os clientes com investimento e resultado dos últimos 7 dias, comparação com a semana anterior e o mês contra a meta. Alertas automáticos para dados parados, CPL acima da meta, investimento sem leads, ROAS abaixo de 1, ritmo de investimento fora da meta e muitos leads sem atendimento.
- **Página de cada cliente:** lançamento manual do dia, importação de CSV, palavra do gestor, acessos (com o botão "Gerar link de acesso" para mandar pelo WhatsApp), plano, últimos lançamentos e metas.

**Importar CSV.** Aceita o modelo da T9 (baixado na própria página) e exportações do Gerenciador de Anúncios da Meta e do Google Ads, com quebra por dia. As colunas são reconhecidas pelo nome, em português, inglês ou espanhol. Números como `1.234,56` e `1,234.56` e datas `30/09/2026` ou `2026-09-30` funcionam. Mesmo dia + plataforma + campanha substitui o valor anterior, então reimportar uma planilha não duplica nada.

**Outras abas do cliente:**

- **Criativos:** validados (rodando com resultado), em teste e reprovados, com miniatura, números e o aprendizado de cada um. A equipe adiciona pela própria aba (imagem de capa vai para o Blob privado e só é entregue a quem tem acesso; links de arquivos do Drive compartilhados mostram a miniatura sozinhos) e muda a situação no seletor do cartão.
- **Reuniões:** próximas (com botão para entrar) e anteriores, com resumo e próximos passos.
- **Relatórios:** fechamento de cada mês calculado a partir das métricas, com a análise da equipe (fica como rascunho até ser publicada). O botão "Salvar em PDF" gera a versão para imprimir, em fundo branco.
- **Arquivos:** o cliente envia links do Google Drive para a equipe. Ele remove só o que enviou; a equipe remove qualquer um.
- **Baixar CSV** nas abas Leads e Campanhas (campanhas no período escolhido).

**Financeiro.**

- A aba **Financeiro** mostra ao cliente todos os vencimentos, o que está em aberto, em atraso e pago, além de "como pagar" (Pix, dados bancários) e o link de pagamento de cada cobrança, quando houver.
- **Pop-ups para o cliente:**
  - lembrete 7 dias antes, 3 dias antes, na véspera e no dia do vencimento (uma vez por dia);
  - aviso a cada dia de atraso, do 1º ao 6º, com quantos dias faltam para a suspensão (a cada nova visita);
  - a partir do 7º dia de atraso, o aviso diz que as campanhas serão suspensas.
- Em atraso, uma faixa fixa no topo do painel leva ao Financeiro.
- **Só o admin mexe no financeiro:**
  - cria cobranças (com repetição mensal);
  - dá baixa com a data do pagamento, desfaz a baixa, edita e exclui;
  - edita o texto de "como pagar".

  A visão geral fica em **Gestão T9 → Financeiro**: em atraso, vencendo em 7 dias, a receber e recebido no mês. A carteira e o resumo semanal alertam pagamentos atrasados.
- Na aba Financeiro de cada cliente, a equipe pode **pré-visualizar** todos os pop-ups.

**Meta Ads automático.**

- Na página de gestão de cada cliente, a seção "Meta Ads" vincula a conta de anúncio. Com o token configurado, as contas do Business Manager aparecem para escolher.
- O painel puxa, por dia e campanha:
  - investimento, impressões e cliques no link;
  - leads: cadastros pelo formulário ou pixel + conversas iniciadas no WhatsApp/Direct/Messenger;
  - compras e receita.
- Os anúncios com investimento nos últimos 30 dias viram cartões na aba Criativos, com miniatura e números. A situação (validado, em teste, reprovado) e o aprendizado continuam com a equipe e não são sobrescritos.
- **Quando sincroniza:**
  - ao conectar: últimos 90 dias;
  - todo dia às 6h (Brasília), pelo Cron `/api/painel/meta-sync`: últimos 30 dias;
  - no botão "Atualizar agora".
- Os dados da Meta substituem os do mesmo período vindos da própria Meta. Lançamentos manuais e CSV de outras plataformas não são tocados.
- **Configuração:**
  - `META_ACCESS_TOKEN`: token do usuário do sistema do Business Manager, com `ads_read` e as contas de anúncio atribuídas.
  - `META_APP_SECRET` (recomendado): ativa o `appsecret_proof`.
  - `META_API_VERSION`: opcional, padrão `v23.0`.

**Ver como cliente.** No cabeçalho do painel de um cliente, a equipe pode ligar o modo "Ver como cliente", que esconde todos os controles de edição. Uma faixa vermelha avisa que o modo está ligado.

**Cliente de demonstração.** Na Carteira, o botão "Recriar demonstração" (só admin) gera a "Clínica Exemplo (demonstração)" com 90 dias de métricas, leads, criativos, reuniões, relatório e arquivos fictícios. As artes ficam em `public/painel-demo/`.

**Resumo semanal.** Toda segunda às 8h (Brasília), cada pessoa da equipe recebe por e-mail os clientes dela, com investimento e resultado dos últimos 7 dias e os alertas da carteira (Cron da Vercel em `vercel.json`, rota `/api/painel/resumo-semanal`, protegida pelo `CRON_SECRET`). Precisa do Resend para chegar.

**Leads do site.** Cada lead do formulário de agendamento também entra no painel, na empresa "T9 ADS Company", com origem e campanha vindas dos parâmetros `utm_source` e `utm_campaign`.

Toda alteração fica registrada na tabela `registro` (quem fez o quê e quando).

## Variáveis de ambiente

Veja `.env.example`.

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_LEAD_EMAIL` | E-mail que recebe os leads (ou o código do FormSubmit) |
| `LEAD_WEBHOOK_URL` | Destino dos leads e agendamentos em JSON (opcional) |
| `NEXT_PUBLIC_T9_WHATSAPP` | WhatsApp da T9 (ex.: `5511999999999`). Mostra o botão "Confirmar pelo WhatsApp" depois do agendamento |
| `LEADS_CHAVE` | Chave de acesso da página `/leads` |
| `BLOB_READ_WRITE_TOKEN` | Criado pela Vercel ao conectar o Blob store |
| `NEXT_PUBLIC_SITE_URL` | Endereço final do site, usado na imagem de compartilhamento |
| `DATABASE_URL` | Banco do painel. Criado pela Vercel ao conectar a Neon |
| `PAINEL_ADMINS` | E-mails de administradores, separados por vírgula |
| `RESEND_API_KEY` | Envio dos e-mails de acesso ao painel |
| `PAINEL_EMAIL_REMETENTE` | Remetente dos e-mails (padrão: `T9 ADS Company <painel@t9company.com.br>`; o domínio precisa estar verificado no Resend) |
| `META_ACCESS_TOKEN` | Token do usuário do sistema da Meta (leitura das contas de anúncio) |
| `META_APP_SECRET` | Segredo do app da Meta (recomendado, protege o uso do token) |
| `CRON_SECRET` | Protege o resumo semanal e a rota que recria a demonstração |
| `PAINEL_URL` | Opcional. Endereço usado nos links de acesso (padrão: o endereço em que o painel foi aberto) |

## Horários da agenda

Ficam em `lib/agenda.ts`: dias úteis oferecidos, horários (`HORARIOS`), duração da reunião e faixas de faturamento.

A agenda não consulta um calendário real. A equipe confirma cada horário pelo WhatsApp. Para bloquear horários já ocupados automaticamente, o próximo passo é integrar com o Google Agenda ou o Cal.com.

## Imagens

A arte do hero (`public/img/hero-t9-logo.webp`) é a imagem com o logo da T9 e os ícones orbitando. O painel do Gerenciador de Anúncios, na seção de agendamento, foi refeito em HTML.

O logo foi vetorizado a partir das artes e está em `app/components/Logo.tsx`.

Para trocar a arte do hero, basta substituir o arquivo, mantendo o formato quadrado.
