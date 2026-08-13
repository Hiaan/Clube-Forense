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

### Vendas da Eduzz (`/admin/vendas`)

As faturas dos infoprodutos são espelhadas da Eduzz por dois caminhos que se
completam: o webhook avisa na hora e a sincronização diária relê os últimos 30
dias para consertar o que a notificação tiver perdido.

| Variável | Para quê |
| --- | --- |
| `EDUZZ_PUBLIC_KEY` | Public key da API, no painel da Eduzz em Ferramentas → API. |
| `EDUZZ_API_KEY` | API key do mesmo lugar. Sem ela e a de cima, a sincronização não roda. |
| `EDUZZ_EMAIL` | Só para contas antigas, em que o e-mail do produtor faz parte da credencial. |
| `EDUZZ_WEBHOOK_TOKEN` | Chave de segurança cadastrada junto com a URL da notificação de compra. Sem ela a rota do webhook recusa tudo. |

Na Eduzz, aponte a **notificação de compra** para
`https://SEU-DOMINIO/api/webhooks/eduzz` e use a mesma chave de segurança da
variável acima.

O primeiro carregamento do histórico é manual, uma vez só:

```
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://SEU-DOMINIO/api/cron/eduzz?dias=730"
```

Depois disso o workflow `sincronizar-vendas.yml` cuida do dia a dia.

### ROI (gasto no Meta Ads)

O faturamento sozinho não diz se a operação ganha dinheiro. O painel puxa o
gasto das campanhas pela API de Marketing do Meta e mostra ROI, ROAS e custo por
venda, por dia, semana ou mês.

| Variável | Para quê |
| --- | --- |
| `META_ACCESS_TOKEN` | Token de acesso com a permissão `ads_read`, gerado em developers.facebook.com para um app seu. Prefira um token de longa duração ou de usuário de sistema — o token curto vence em horas. |
| `META_AD_ACCOUNT_ID` | ID da conta de anúncios (Gerenciador de Anúncios → Configurações). Aceita com ou sem o prefixo `act_`. |
| `META_API_VERSAO` | Opcional. Padrão `v21.0`. |

O carregamento inicial, uma vez:

```
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://SEU-DOMINIO/api/cron/meta-ads?dias=365"
```

Duas ressalvas que a tela respeita: o gasto é relido a cada dia porque o Meta
corrige os números recentes conforme atribui conversões; e, ao filtrar por
produto, o bloco de ROI some — a campanha leva a pessoa ao site, não a um item
do catálogo, então dividir o faturamento de um produto pelo custo inteiro daria
um número falso.

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
