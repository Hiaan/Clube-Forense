# Ponte do WhatsApp da T9

Conecta o número da T9 ao WhatsApp (como "aparelho conectado", igual ao WhatsApp Web) e envia
as mensagens que o painel pede. Hoje, só o aviso de lead novo no WhatsApp do cliente.

Veio da ponte da central Clarear, com tudo o que não é envio retirado: não guarda conversas,
não baixa histórico, não tem assistente. As mensagens que chegam no número continuam aparecendo
normalmente no celular.

## Como funciona no PC

O `docker compose` sobe duas coisas:

- **a ponte**, conectada ao WhatsApp;
- **um túnel rápido da Cloudflare**, que dá à ponte um endereço público (`https://…trycloudflare.com`)
  sem abrir porta no roteador, sem IP fixo e sem conta.

O endereço do túnel muda toda vez que ele liga. A ponte lê o endereço novo e avisa o painel
sozinha (`POST /api/painel/whatsapp/ponte`, com o segredo). Não há nada para configurar.

## Instalar

1. Instale o **Docker Desktop** (docker.com) e deixe marcado "Start Docker Desktop when you sign in".
2. Descompacte esta pasta onde quiser.
3. Confira o `.env`:
   - `PONTE_SEGREDO`: o mesmo valor da `WHATSAPP_PONTE_SEGREDO` na Vercel. Para gerar um novo: `openssl rand -hex 32`;
   - `PAINEL_URL`: `https://t9company.com.br`.
4. Abra o terminal nesta pasta e rode `docker compose up -d`. Na primeira vez, ele baixa e monta tudo (alguns minutos).
5. No painel, abra **Gestão T9 → WhatsApp** e leia o QR Code com o celular do número da T9.

Com `restart: unless-stopped`, a ponte e o túnel voltam sozinhos quando o Docker Desktop abre.
Deixe o PC sem suspender: com ele dormindo, os avisos param. Os leads das últimas 48 horas saem
quando ele voltar.

**Comandos úteis** (no terminal, nesta pasta):

- `docker compose logs -f ponte`: ver o que a ponte está fazendo;
- `docker compose restart`: reiniciar;
- `docker compose down`: desligar. A sessão do WhatsApp fica guardada no volume.

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
- **A sessão fica no volume `sessao`.** Apague o volume (`docker compose down -v`) e o número
  precisa ler o QR de novo.
- **Três quedas seguidas e a ponte para.** O painel mostra "Tentar de novo".
- **Não troque a identidade da sessão.** A ponte usa sempre `Browsers.ubuntu("Chrome")`; outra
  identidade faz o WhatsApp derrubar a conexão antes do QR.
