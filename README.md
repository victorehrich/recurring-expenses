# Despesas Recorrentes + Telegram

App em Next.js (App Router) + MongoDB para cadastrar despesas recorrentes
(mensais, semanais ou anuais) e receber avisos automáticos no Telegram antes
do vencimento.

## Funcionalidades

- Cadastro, edição e exclusão de despesas recorrentes
- Frequência mensal, semanal ou anual, com dia (e mês) de vencimento
- Aviso configurável por despesa (ex.: "avisar 3 dias antes")
- Envio de notificação via bot do Telegram
- Rota `/api/notify` pronta para ser chamada por um cron diário (Vercel Cron
  incluso em `vercel.json`, mas funciona com qualquer cron externo)
- Não notifica duas vezes o mesmo vencimento

## 1. Pré-requisitos

- Node.js 18+ **ou** Docker + Docker Compose (para rodar tudo em containers, sem instalar nada)
- Um banco MongoDB (local, [MongoDB Atlas](https://www.mongodb.com/atlas) gratuito, ou o container incluso no `docker-compose.yml`)
- Um bot do Telegram

## 2. Criando o bot do Telegram

1. Abra o Telegram e converse com **@BotFather**
2. Envie `/newbot` e siga as instruções (escolha um nome e um username)
3. O BotFather vai te dar um **token** — copie, é o `TELEGRAM_BOT_TOKEN`
4. Envie qualquer mensagem para o seu bot recém-criado (para "iniciar" a conversa)
5. Descubra seu **chat_id**: converse com **@userinfobot** e ele te mostra o seu ID,
   ou acesse `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` depois do passo 4
   e veja o campo `chat.id`

## 3. Configurando o projeto

```bash
npm install
cp .env.example .env
```

Edite o `.env`:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/despesas
TELEGRAM_BOT_TOKEN=123456789:ABC-...
TELEGRAM_CHAT_ID=123456789
CRON_SECRET=escolha-uma-string-aleatoria
DIAS_DE_AVISO=3
```

Rode localmente:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 4. Testando as notificações

Na própria interface há um botão **"Testar notificações agora"**, que chama
`/api/notify` manualmente e mostra o resultado. Ele envia um aviso para toda
despesa ativa cujo vencimento seja hoje ou esteja dentro do prazo de aviso
configurado.

Você também pode chamar direto:

```bash
curl "http://localhost:3000/api/notify?token=SEU_CRON_SECRET"
```

## 5. Colocando para rodar todo dia (produção)

### Opção A — Docker Compose (recomendado se for auto-hospedar)

O projeto já inclui `Dockerfile` e `docker-compose.yml`, com três serviços:

- **app** — a aplicação Next.js
- **mongo** — o MongoDB (com volume persistente)
- **cron** — dispara `/api/notify` uma vez por dia automaticamente (usa
  [Ofelia](https://github.com/mcuadros/ofelia), um agendador leve baseado em
  labels do Docker — não precisa de cron externo nem de Vercel)

Passo a passo:

```bash
cp .env.example .env
# edite o .env e preencha TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID e CRON_SECRET
# (não precisa mexer em MONGODB_URI — o compose já aponta para o serviço "mongo")

docker compose up -d --build
```

A aplicação sobe em `http://localhost:3000`. O serviço `cron` chama
`http://app:3000/api/notify?token=$CRON_SECRET` todo dia às 12h (horário do
container). Para mudar o horário, edite o label `ofelia.job-run.notify.schedule`
no `docker-compose.yml` (aceita `@daily`, `@every 1h`, ou uma expressão cron
com 6 campos: `segundo minuto hora dia mês dia-da-semana`).

Comandos úteis:

```bash
docker compose logs -f app        # ver logs da aplicação
docker compose logs -f cron       # ver quando o aviso diário rodou
docker compose down               # parar tudo (mantém os dados do Mongo)
docker compose down -v            # parar e apagar também o volume do Mongo
```

> **Nota de segurança:** o `mongo` do compose sobe sem autenticação, pensado
> para uso local ou numa rede interna/privada. Se for expor a aplicação
> publicamente, adicione usuário/senha ao serviço `mongo` (variáveis
> `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD`) e ajuste o
> `MONGODB_URI` de acordo, ou use um MongoDB Atlas gerenciado.

### Opção B — Vercel Cron

1. Faça o deploy do projeto na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no painel do projeto (as mesmas do `.env`)
3. Edite `vercel.json` e troque `SEU_CRON_SECRET` pelo valor real de `CRON_SECRET`
4. A Vercel vai chamar `/api/notify` automaticamente no horário definido em
   `schedule` (por padrão, todo dia às 12h UTC — ajuste conforme seu fuso)

### Opção C — Cron externo

Se hospedar em outro lugar (Railway, Render, VPS sem Docker, etc.), configure
qualquer serviço de cron (ex. [cron-job.org](https://cron-job.org), `crontab`
de um servidor) para fazer uma requisição GET diária para:

```
https://seu-dominio.com/api/notify?token=SEU_CRON_SECRET
```

## 6. Estrutura do projeto

```
Dockerfile                  → build multi-stage da aplicação (produção)
docker-compose.yml          → app + MongoDB + cron diário (Ofelia)
vercel.json                 → cron diário, caso prefira hospedar na Vercel
src/
  app/
    page.tsx                  → tela principal (lista + formulário)
    components/
      ExpenseForm.tsx         → formulário de criação/edição
      ExpenseList.tsx         → listagem estilo "livro-caixa"
    api/
      expenses/route.ts       → GET (listar) / POST (criar)
      expenses/[id]/route.ts  → GET / PUT / DELETE de uma despesa
      notify/route.ts         → verifica vencimentos e envia Telegram
  lib/
    mongodb.ts                → conexão com o MongoDB (com cache)
    telegram.ts                → envio de mensagens via Bot API
    dueDate.ts                → cálculo de próximo vencimento
  models/
    Expense.ts                → schema Mongoose
```

## 7. Personalizações fáceis

- **Mudar o texto da mensagem**: edite `src/app/api/notify/route.ts`
- **Notificar em vários chats por despesa**: hoje há um campo opcional
  `chatId` por despesa que sobrepõe o padrão — dá para estender para uma lista
- **Mudar o horário do cron**: edite o campo `schedule` em `vercel.json`
  (formato cron padrão, em UTC)
