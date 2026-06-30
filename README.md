This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Inclui o **Monitor de Concursos para Médico-Legista** em `/monitor` — veja [MONITOR.md](./MONITOR.md).

## Publicar na Vercel (passo a passo)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/UandreLucas/Clube-Forense)

1. Clique no botão acima (ou acesse <https://vercel.com/new>) e entre com sua conta **GitHub**.
2. Importe o repositório **Clube-Forense**. A Vercel detecta o Next.js sozinho — não mude nada, só clique em **Deploy**.
3. Ao terminar, anote a URL gerada (ex.: `https://clube-forense.vercel.app`). O monitor fica em `…/monitor`.

### Atualização de hora em hora (grátis)

A página já se regenera a cada hora ao ser acessada. Para forçar a atualização mesmo sem visitas, use o GitHub Action incluído (`.github/workflows/atualizar-monitor.yml`):

1. No GitHub, vá em **Settings → Secrets and variables → Actions → Variables → New repository variable**.
2. Crie a variável `MONITOR_BASE_URL` com a URL da Vercel (ex.: `https://clube-forense.vercel.app`).
3. Pronto: o Action aciona a coleta toda hora. (Opcional: crie o *secret* `CRON_SECRET` aqui e a variável de ambiente de mesmo nome na Vercel para proteger o endpoint.)

> O cron nativo da Vercel (`vercel.json`) roda de hora em hora **apenas no plano Pro**; no plano grátis ele é limitado a 1x/dia. Por isso o GitHub Action acima garante a frequência horária sem custo.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
