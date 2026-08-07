import type { ExpenseDocument } from "@/models/Expense";

function clampDayToMonth(year: number, month: number, day: number) {
  // month é 0-indexed aqui. Retorna o último dia do mês se "day" não existir nele.
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(day, lastDay);
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Calcula a próxima data de vencimento (>= hoje) de uma despesa recorrente,
 * e uma chave de período usada para não notificar duas vezes o mesmo vencimento.
 */
export function getNextOccurrence(
  expense: Pick<ExpenseDocument, "frequency" | "dueDay" | "dueMonth">,
  today: Date = new Date()
): { nextDue: Date; periodKey: string } {
  const base = startOfDay(today);
  const year = base.getFullYear();

  if (expense.frequency === "semanal") {
    // dueDay aqui representa o dia da semana (0 = domingo ... 6 = sábado)
    const currentWeekday = base.getDay();
    let diff = (expense.dueDay - currentWeekday + 7) % 7;
    const nextDue = new Date(base);
    nextDue.setDate(base.getDate() + diff);
    const periodKey = nextDue.toISOString().slice(0, 10);
    return { nextDue, periodKey };
  }

  if (expense.frequency === "anual") {
    const month = (expense.dueMonth ?? 1) - 1; // 0-indexed
    const day = clampDayToMonth(year, month, expense.dueDay);
    let nextDue = new Date(year, month, day);
    if (nextDue < base) {
      nextDue = new Date(
        year + 1,
        month,
        clampDayToMonth(year + 1, month, expense.dueDay)
      );
    }
    const periodKey = `${nextDue.getFullYear()}`;
    return { nextDue, periodKey };
  }

  // mensal (padrão)
  const day = clampDayToMonth(year, base.getMonth(), expense.dueDay);
  let nextDue = new Date(year, base.getMonth(), day);
  if (nextDue < base) {
    const nextMonth = base.getMonth() + 1;
    nextDue = new Date(
      year,
      nextMonth,
      clampDayToMonth(year, nextMonth, expense.dueDay)
    );
  }
  const periodKey = `${nextDue.getFullYear()}-${nextDue.getMonth() + 1}`;
  return { nextDue, periodKey };
}

export function daysBetween(a: Date, b: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay);
}
