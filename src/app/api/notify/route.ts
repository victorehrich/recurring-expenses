import { NextRequest, NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { sendTelegramMessage } from "@/lib/telegram";
import { getNextOccurrence, daysBetween } from "@/lib/dueDate";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const header = request.headers.get("authorization");
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");

  return header === `Bearer ${secret}` || queryToken === secret;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * GET /api/notify?token=SEU_CRON_SECRET
 * Verifica todas as despesas ativas e envia um aviso no Telegram para as que
 * vencem hoje ou dentro do prazo de aviso configurado (reminderDays).
 * Chame esta rota uma vez por dia via Vercel Cron (veja vercel.json) ou
 * qualquer serviço externo de cron (cron-job.org, EasyCron, etc).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const expenses = await Expense.find({ active: true });

    const today = new Date();
    const notified: string[] = [];
    const errors: { name: string; error: string }[] = [];

    for (const expense of expenses) {
      const { nextDue, periodKey } = getNextOccurrence(expense, today);
      const daysUntil = daysBetween(nextDue, today);

      // Skip notification if this period already has a payment recorded
      const alreadyPaid = await Payment.findOne({ expenseId: expense._id, periodKey });
      if (alreadyPaid) continue;

      const shouldNotify =
        (daysUntil === expense.reminderDays || daysUntil === 0);

      if (!shouldNotify) continue;

      const quando =
        daysUntil === 0
          ? "vence <b>hoje</b>"
          : `vence em <b>${daysUntil} dia${daysUntil > 1 ? "s" : ""}</b>`;

      const texto =
        `💸 <b>${expense.name}</b>\n` +
        `${currency.format(expense.amount)} · ${expense.category}\n` +
        `${quando} (${nextDue.toLocaleDateString("pt-BR")})` +
        (expense.boletoUrl ? `\n📎 Boleto: ${expense.boletoUrl}` : "") +
        (expense.observation ? `\n📝 Observação: ${expense.observation}` : "");

      try {
        await sendTelegramMessage(texto, expense.chatId || undefined);
        expense.lastNotifiedKey = periodKey;
        await expense.save();
        notified.push(expense.name);
      } catch (err: any) {
        errors.push({ name: expense.name, error: err.message });
      }
    }

    return NextResponse.json({
      checked: expenses.length,
      notified,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
