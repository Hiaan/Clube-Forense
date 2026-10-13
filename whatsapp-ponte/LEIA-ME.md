# Ponte do WhatsApp da T9

Conecta o número da T9 ao WhatsApp (como "aparelho conectado", igual ao WhatsApp Web) e envia
as mensagens que o painel pede. Hoje, só o aviso de lead novo no WhatsApp do cliente.

Veio da ponte da central Clarear, com tudo o que não é envio retirado: não guarda conversas,
não baixa histórico, não tem assistente. As mensagens que chegam no número continuam aparecendo
normalmente no celular.

## Subir no servidor (Docker)

1. Copie esta pasta para o servidor.
2. Crie o `.env` a partir do `.env.example`:
   - `PONTE_SEGREDO`: gere com `openssl rand -hex 32`;
   - `PONTE_DOMINIO`: o endereço público da ponte, por exemplo `wa.t9company.com.br`.
3. Crie o endereço público da ponte, escolhendo um caminho:
   - **O servidor já tem proxy com HTTPS** (Caddy, Traefik, Nginx): rode `docker compose up -d`
     e aponte o subdomínio para `127.0.0.1:3100`;
   - **Não tem**: aponte o DNS do subdomínio para o IP do servidor e rode
     `docker compose --profile https up -d`. O Caddy tira o certificado sozinho (portas 80 e 443 livres).
4. Na Vercel (projeto do site), crie:
   - `WHATSAPP_PONTE_URL=https://wa.t9company.com.br`;
   - `WHATSAPP_PONTE_SEGREDO`: o mesmo valor de `PONTE_SEGREDO`.

   Depois, publique o site de novo.
5. No painel, abra **Gestão T9 → WhatsApp** e leia o QR Code com o celular do número da T9.

## Rotas

Todas pedem o cabeçalho `Authorization: Bearer <PONTE_SEGREDO>`. Sem ele, a resposta é 401.

| Rota | O que faz |
| --- | --- |
| `GET /estado` | Fase da conexão (`qr`, `conectado`, `parada`...), o número conectado e o QR em imagem |
| `POST /enviar` | `{ "numero": "5583999999999", "texto": "..." }`: manda a mensagem |
| `POST /reconectar` | Volta a tentar depois de três quedas seguidas |
| `POST /sair` | Desconecta o número (sai um QR novo) |

## Cuidados

- **A API não é oficial.** O número pode ser banido. Use um número só da T9 e volume baixo.
  A ponte espera pelo menos 4 s entre uma mensagem e outra (`PONTE_INTERVALO_MS`).
- **A sessão fica no volume `sessao`.** Apague o volume e o número precisa ler o QR de novo.
- **Três quedas seguidas e a ponte para.** O painel mostra "Tentar de novo".
- **Não troque a identidade da sessão.** A ponte usa sempre `Browsers.ubuntu("Chrome")`; outra
  identidade faz o WhatsApp derrubar a conexão antes do QR.
