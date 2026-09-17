import { daysBetween, getNextOccurrence } from "./dueDate";

export type StatusExpense = {
  frequency: "mensal" | "semanal" | "anual";
  dueDay: number;
  dueMonth?: number;
  reminderDays: number;
  lastNotifiedKey?: string;
};

export type DueInfo = {
  days: number;
  periodKey: string;
  paid: boolean;
};

/** Dias até o próximo vencimento + se o período atual já foi pago. */
export function getDueInfo(expense: StatusExpense, today = new Date()): DueInfo {
  const { nextDue, periodKey } = getNextOccurrence(expense, today);
  const days = daysBetween(nextDue, today);
  const paid = Boolean(expense.lastNotifiedKey && expense.lastNotifiedKey === periodKey);
  return { days, periodKey, paid };
}

export type ExpenseStatus = {
  label: string;
  tone: "brand" | "success" | "warning" | "danger" | "neutral";
};

/**
 * Regra de status extraída de app/components/ExpenseList.
 * Mantém os mesmos rótulos para não quebrar a UX na F2.
 */
export function getExpenseStatus(expense: StatusExpense, today = new Date()): ExpenseStatus {
  const { days, paid } = getDueInfo(expense, today);

  if (paid) {
    return { label: "PAGO", tone: "success" };
  }
  if (days < 0) return { label: "ATRASADA", tone: "danger" };
  if (days === 0) return { label: "VENCE HOJE", tone: "danger" };
  if (days <= expense.reminderDays) {
    return { label: `EM ${days} DIA${days > 1 ? "S" : ""}`, tone: "warning" };
  }
  return { label: "EM DIA", tone: "brand" };
}
