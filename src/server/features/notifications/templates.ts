const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type NotifiableExpense = {
  name: string;
  amount: number;
  category: string;
  boletoUrl?: string;
  observation?: string;
};

/**
 * Template da mensagem de aviso — extraído de app/api/notify/route.ts.
 * Manter idêntico para não quebrar notificações na refatoração F4.
 */
export function buildNotificationText(
  expense: NotifiableExpense,
  nextDue: Date,
  daysUntil: number,
) {
  const quando =
    daysUntil === 0
      ? "vence <b>hoje</b>"
      : `vence em <b>${daysUntil} dia${daysUntil > 1 ? "s" : ""}</b>`;

  return (
    `💸 <b>${expense.name}</b>\n` +
    `${currency.format(expense.amount)} · ${expense.category}\n` +
    `${quando} (${nextDue.toLocaleDateString("pt-BR")})` +
    (expense.boletoUrl ? `\n📎 Boleto: ${expense.boletoUrl}` : "") +
    (expense.observation ? `\n📝 Observação: ${expense.observation}` : "")
  );
}
