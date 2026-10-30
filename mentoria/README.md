# Mentoria Individualizada — Dr. Miguel Souza

Site de captura da mentoria individualizada em Medicina Legal. É um projeto
**separado** do Clube Forense: mora nesta pasta só por conveniência, com
`package.json`, dependências e identidade visual próprias.

```bash
npm install
npm run dev
```

## Publicar na Vercel

Crie um projeto novo na Vercel apontando para este mesmo repositório e, em
**Settings → Build and Deployment → Root Directory**, escolha `mentoria`.
O site do Clube continua no projeto atual, sem mudança.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `CALLMEBOT_TELEFONE` / `CALLMEBOT_APIKEY` | Aviso no WhatsApp do Miguel, grátis. Ativação abaixo. |
| `ZAPI_INSTANCIA` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` / `WHATSAPP_MIGUEL` | Alternativa paga e mais robusta (Z-API). |
| `AGENDAMENTO_WEBHOOK_URL` | Opcional: recebe cada agendamento em JSON (planilha, CRM, Make, n8n). |
| `NEXT_PUBLIC_LINK_GRUPO_CASOS` | Convite do Grupo de Discussão de Casos. Sem ele, o botão leva ao formulário. |
| `NEXT_PUBLIC_SITE_URL` | Domínio definitivo, quando existir (usado nas prévias de link). |

Basta um canal de aviso configurado. Em produção, sem nenhum, o formulário
mostra erro em vez de fingir que agendou.

### Ativar o CallMeBot (uma vez, no celular do Miguel)

1. Salvar o contato do CallMeBot: **+34 644 51 95 23** (confira o número
   atual em <https://www.callmebot.com/blog/free-api-whatsapp-messages/>).
2. Mandar para ele, pelo WhatsApp: `I allow callmebot to send me messages`.
3. Ele responde com a apikey. Na Vercel: `CALLMEBOT_TELEFONE` = número do
   Miguel com 55 e DDD (ex.: `5581999999999`), `CALLMEBOT_APIKEY` = a chave.

## Agenda

Dias, horários e antecedência ficam em `lib/agenda.ts`: hoje, de segunda a
sábado, 8h–11h e 14h–20h (horário de Recife), sempre a partir do dia seguinte
e até 21 dias à frente. O formulário e a API usam o mesmo arquivo.
