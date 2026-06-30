# Monitor de Concursos — Médico-Legista

Painel que rastreia, **atualizado de hora em hora**, os concursos para os cargos de
**perito médico-legista**, **médico legista** e **perito criminal médico-legista**
nos 27 estados do Brasil.

Acesse em **`/monitor`** (link "Monitor de Concursos" no menu do site).

## Como funciona

```
Fontes externas  ──►  Coletor  ──►  Filtro de cargo  ──►  Classificação  ──►  Painel
(Google Notícias)     (fetch)       (só "legista")        (nível/score)       (/monitor)
```

1. **Coletor** (`app/monitor/lib/coletor.ts`) — dispara uma busca nacional + uma por
   estado no **Google Notícias (RSS)**, que agrega portais de imprensa e a
   repercussão dos diários oficiais. Não exige login nem chave de API.
2. **Filtro** (`app/monitor/lib/cargos.ts`) — só passa quem cita **"legista"** junto
   de termo de concurso (edital, inscrições, vaga…). O resto é descartado.
3. **Classificação** — cada menção recebe um nível pelo texto:
   | Nível | Significado |
   |---|---|
   | 🟢 Edital publicado | edital/​inscrições abertas |
   | 🟡 Autorizado / banca | concurso autorizado, banca em definição |
   | 🟠 Previsto / em estudo | sinalização de que "deve sair" |
   | 🔵 Menção recente | citação sem estágio claro |
   | ⚪ Sem novidades | nada encontrado |
4. **Painel** (`app/monitor/page.tsx`) — mostra os 27 estados com status, intensidade
   (0–100) e links das fontes. Regenera a cada hora (`revalidate = 3600`).

## Atualização automática (cron)

- `vercel.json` agenda `GET /api/cron` **a cada hora** (`0 * * * *`).
- O endpoint refaz a coleta e revalida a página.
- Opcional: defina a variável de ambiente `CRON_SECRET` na Vercel para proteger o
  endpoint (ele passa a exigir o header `Authorization: Bearer <segredo>`).

## Deploy

1. Suba o repositório na **Vercel** (importar projeto Next.js — zero config).
2. O cron de 1h funciona automaticamente no plano da Vercel.
3. Pronto: `https://seu-projeto.vercel.app/monitor`.

> Em ambientes de rede restrita (como o de desenvolvimento), as fontes externas
> ficam bloqueadas e o painel exibe **dados de demonstração** com um aviso. Na
> Vercel, os dados são reais.

## Endpoints

- `GET /monitor` — painel visual.
- `GET /api/monitor` — relatório em **JSON** (para integrações/app).
- `GET /api/cron` — aciona a coleta (usado pelo agendador).

## Como evoluir

- **Mais fontes oficiais:** em `app/monitor/lib/fontes.ts`, adicione consultas aos
  buscadores dos diários oficiais estaduais (muitos têm busca por palavra-chave).
  Os links base já estão em `app/monitor/lib/estados.ts`.
- **Instagram de governadores/secretarias:** ficou de fora porque o Instagram
  bloqueia robôs e exige API paga (Graph API + conta Business). É um eco da
  informação que já sai no Diário Oficial — por isso priorizamos a fonte oficial.
  Se quiser incluir, o caminho é a Graph API oficial (não scraping).
- **Histórico e alertas:** hoje o painel mostra o estado atual. Para guardar
  histórico e enviar e-mail/WhatsApp quando um edital sair, é preciso um banco
  (ex.: Vercel Postgres/KV). Posso implementar quando quiser.
- **Afinar a classificação:** ajuste as expressões em `app/monitor/lib/cargos.ts`.
