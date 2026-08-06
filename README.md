This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Painel do admin (`/admin`)

Onde a curadoria dos 27 estados é editada, a notícia principal de cada estado é
escolhida e os cadastros feitos pelo mapa são consultados.

Variáveis de ambiente, no projeto da Vercel:

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon) com a curadoria e os leads. Sem ela o site cai na curadoria embutida no código e o painel não grava. |
| `ADMIN_EMAIL` | E-mail que entra no painel. |
| `ADMIN_SENHA` | Senha do painel. Trocá-la derruba as sessões abertas. |
| `CURADORIA_CSV_URL` | Planilha publicada em CSV. Usada só pelo botão "Importar da planilha". |

Sem `ADMIN_EMAIL` e `ADMIN_SENHA` o login recusa qualquer tentativa — não há
senha padrão, porque este repositório é público.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
