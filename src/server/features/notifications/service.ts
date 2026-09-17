import { connectToDatabase } from "@/server/shared/db";
import Expense from "@/models/Expense";
import Payment from "@/models/Payment";
import { getNextOccurrence, daysBetween } from "@/lib/dueDate";
import { sendTelegramMessage } from "./telegram";
import { buildNotificationText } from "./templates";

export type NotifyResult = {
  checked: number;
  notified: string[];
  errors: { name: string; error: string }[];
};

export type ScheduledItem = {
  expenseId: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  nextDue: string;
  daysUntil: number;
  willNotify: boolean;
  alreadyPaid: boolean;
  channel: "default" | "custom";
};

/**
 * Dry-run: calcula o que seria notificado nos próximos `days` dias
 * SEM enviar nada. Base da página /notifications.
 */
export async function previewScheduled(days = 30, today = new Date()) {
  await connectToDatabase();
  const expenses = await Expense.find({ active: true }).lean();

  const scheduled: ScheduledItem[] = [];
  for (const expense of expenses) {
    const { nextDue, periodKey } = getNextOccurrence(expense, today);
    const daysUntil = daysBetween(nextDue, today);
    if (daysUntil < 0 || daysUntil > days) continue;

    const paid = await Payment.findOne({
      expenseId: expense._id,
      periodKey,
    }).lean();

    scheduled.push({
      expenseId: String(expense._id),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
      nextDue: nextDue.toISOString(),
      daysUntil,
      willNotify: daysUntil === expense.reminderDays || daysUntil === 0,
      alreadyPaid: Boolean(paid),
      channel: expense.chatId ? "custom" : "default",
    });
  }

  scheduled.sort((a, b) => a.daysUntil - b.daysUntil);
  return { scheduled, days };
}

/**
 * Verifica despesas ativas e notifica as que vencem hoje ou
 * dentro do prazo de aviso (reminderDays). Idempotente por período:
 * pula quem já tem Payment com o periodKey atual.
 */
export async function checkAndNotify(today = new Date()): Promise<NotifyResult> {
  await connectToDatabase();
  const expenses = await Expense.find({ active: true });

  const notified: string[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const expense of expenses) {
    const { nextDue, periodKey } = getNextOccurrence(expense, today);
    const daysUntil = daysBetween(nextDue, today);

    const alreadyPaid = await Payment.findOne({
      expenseId: expense._id,
      periodKey,
    });
    if (alreadyPaid) continue;

    const shouldNotify = daysUntil === expense.reminderDays || daysUntil === 0;
    if (!shouldNotify) continue;

    const texto = buildNotificationText(expense, nextDue, daysUntil);

    try {
      await sendTelegramMessage(texto, expense.chatId || undefined);
      expense.lastNotifiedKey = periodKey;
      await expense.save();
      notified.push(expense.name);
    } catch (err: unknown) {
      errors.push({
        name: expense.name,
        error: err instanceof Error ? err.message : "erro desconhecido",
      });
    }
  }

  return { checked: expenses.length, notified, errors };
}
