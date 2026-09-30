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

## Horários da agenda

Ficam em `lib/agenda.ts`: dias úteis oferecidos, horários (`HORARIOS`), duração da reunião e faixas de faturamento.

A agenda não consulta um calendário real. A equipe confirma cada horário pelo WhatsApp. Para bloquear horários já ocupados automaticamente, o próximo passo é integrar com o Google Agenda ou o Cal.com.

## Imagens

A foto do hero (`public/img/hero-t9.webp`) foi recortada da arte principal. O painel do Gerenciador de Anúncios, na seção de agendamento, foi refeito em HTML.

O logo foi vetorizado a partir das artes e está em `app/components/Logo.tsx`.

Se houver os arquivos originais (foto sem o texto "T9 FAZ" e logo em SVG), basta substituir.
