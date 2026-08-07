const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Envia uma mensagem via Telegram Bot API.
 * Cria um bot com o @BotFather, pegue o token, e descubra seu chat_id
 * conversando com @userinfobot (ou chamando /getUpdates depois de enviar
 * uma mensagem para o seu bot).
 */
export async function sendTelegramMessage(
  text: string,
  chatId: string | number = DEFAULT_CHAT_ID as string
) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN não configurado no .env");
  }
  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID não configurado no .env");
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(
      `Falha ao enviar mensagem no Telegram: ${data.description ?? "erro desconhecido"}`
    );
  }

  return data;
}
