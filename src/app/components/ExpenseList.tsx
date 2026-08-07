"use client";

import { useState } from "react";
import { ExpenseInput } from "./ExpenseForm";
import { getNextOccurrence, daysBetween } from "@/lib/dueDate";
import PaymentHistory from "./PaymentHistory";
import PaymentModal from "./PaymentModal";
import { EditButton } from "./buttons/edit-button";
import { DeleteButton } from "./buttons/delete-button";
import { HistoryButton } from "./buttons/history-button";
import { RegisterPaymentButton } from "./buttons/register-payment";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function statusFor(expense: ExpenseInput & { lastNotifiedKey?: string }) {
  const { nextDue, periodKey } = getNextOccurrence(expense as any);
  const days = daysBetween(nextDue, new Date());

  if (expense.lastNotifiedKey && expense.lastNotifiedKey === periodKey) {
    return { label: "PAGO", tone: "text-green border-green" };
  }

  if (days < 0) return { label: "ATRASADA", tone: "text-rust border-rust" };
  if (days === 0) return { label: "VENCE HOJE", tone: "text-rust border-rust" };
  if (days <= expense.reminderDays)
    return {
      label: `EM ${days} DIA${days > 1 ? "S" : ""}`,
      tone: "text-mustard border-mustard",
    };
  return { label: "EM DIA", tone: "text-petrol border-petrol" };
}

export default function ExpenseList({
  expenses,
  onEdit,
  onChanged,
}: Readonly<{
  expenses: (ExpenseInput & { _id: string; lastNotifiedKey?: string })[];
  onEdit: (expense: ExpenseInput & { _id: string }) => void;
  onChanged: () => void;
}>) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<
    (ExpenseInput & { _id: string }) | null
  >(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function remove(id: string) {
    if (!confirm("Excluir esta despesa recorrente?")) return;
    setBusyId(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="border border-dashed border-line p-8 text-center text-ink/60 text-sm">
        Nenhuma despesa cadastrada ainda. Adicione a primeira acima.
      </div>
    );
  }

  return (
    <div className="border border-line divide-y divide-dashed divide-line bg-white/40">
      {expenses.map((expense) => {
        const status = statusFor(expense);
        const busy = busyId === expense._id;
        return (
          <div
            key={expense._id}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4"
          >
            <div className="min-w-[10rem] flex-1">
              <p className="font-display font-medium">{expense.name}</p>
              <p className="text-xs text-ink/60 uppercase tracking-wide">
                {expense.category} · {expense.frequency}
              </p>
            </div>

            <p className="font-mono text-sm w-28 text-right">
              {currency.format(expense.amount)}
            </p>

            <span
              className={`shrink-0 border px-2 py-1 text-[11px] tracking-wider font-mono -rotate-2 ${status.tone}`}
            >
              {status.label}
            </span>

            {!expense.active && (
              <span className="shrink-0 text-[11px] text-ink/40 uppercase tracking-wide">
                pausada
              </span>
            )}

            <div className="flex gap-3 ml-auto text-xs">
              <EditButton onEdit={() => onEdit(expense)} />
              <DeleteButton onDelete={() => remove(expense._id)} busy={busy} />
              <HistoryButton
                onHistory={() => {
                  setSelectedExpense(expense);
                  setShowHistory(true);
                }}
              />
              <RegisterPaymentButton
                onRegisterPayment={() => {
                  setSelectedExpense(expense);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        );
      })}
      {showHistory && selectedExpense && (
        <PaymentHistory
          expenseId={selectedExpense._id}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showModal && selectedExpense && (
        <PaymentModal
          expense={selectedExpense}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
