"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, History, Pencil, Trash2 } from "lucide-react";
import { ExpenseInput } from "./ExpenseForm";
import { Button } from "@/components/atoms";
import { EmptyState, Menu, StatusPill } from "@/components/molecules";
import { PaymentDialog, PaymentHistoryPanel } from "@/components/organisms";
import { getDueInfo, getExpenseStatus } from "@/lib/expense-status";
import { formatBRL } from "@/lib/format";

type Expense = ExpenseInput & { _id: string; lastNotifiedKey?: string };

type GroupKey = "overdue" | "upcoming" | "ontrack" | "paid" | "paused";

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "overdue", label: "Atrasadas" },
  { key: "upcoming", label: "A vencer" },
  { key: "ontrack", label: "Em dia" },
  { key: "paid", label: "Pagas" },
  { key: "paused", label: "Pausadas" },
];

const PAGE_SIZE = 15;

function groupOf(expense: Expense): GroupKey {
  if (!expense.active) return "paused";
  const { days, paid } = getDueInfo(expense);
  if (paid) return "paid";
  if (days < 0) return "overdue";
  if (days <= expense.reminderDays) return "upcoming";
  return "ontrack";
}

export default function ExpenseList({
  expenses,
  onEdit,
  onChanged,
}: Readonly<{
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onChanged: () => void;
}>) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [expenses]);

  const ordered = useMemo(() => {
    const rank: Record<GroupKey, number> = {
      overdue: 0,
      upcoming: 1,
      ontrack: 2,
      paid: 3,
      paused: 4,
    };
    return [...expenses].sort((a, b) => rank[groupOf(a)] - rank[groupOf(b)]);
  }, [expenses]);

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
      <EmptyState
        title="Nenhuma despesa cadastrada ainda."
        description="Adicione a primeira acima."
      />
    );
  }

  const visible = ordered.slice(0, visibleCount);

  const sections = useMemo(() => {
    const map = new Map<GroupKey, Expense[]>();
    for (const expense of visible) {
      const group = groupOf(expense);
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(expense);
    }
    return GROUPS.filter((g) => map.has(g.key)).map((g) => ({
      ...g,
      items: map.get(g.key)!,
    }));
  }, [ordered, visibleCount]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {sections.map((section, si) => (
        <div key={section.key}>
          <div
            className={
              "border-b border-border bg-surface2 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted" +
              (si > 0 ? " border-t" : "")
            }
          >
            {section.label}
          </div>
          <div className="divide-y divide-border">
            {section.items.map((expense) => {
              const status = getExpenseStatus(expense);
              const busy = busyId === expense._id;

              return (
                <div
                  key={expense._id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-tight">{expense.name}</p>
                    <p className="truncate text-xs text-muted">
                      {expense.category} · {expense.frequency} · {formatBRL(expense.amount)}
                    </p>
                  </div>

                  <StatusPill status={status} />

                  <Menu
                    label={`Ações de ${expense.name}`}
                    disabled={busy}
                    items={[
                      {
                        label: "Editar",
                        icon: Pencil,
                        onSelect: () => onEdit(expense),
                      },
                      {
                        label: "Registrar pagamento",
                        icon: CircleDollarSign,
                        onSelect: () => {
                          setSelectedExpense(expense);
                          setShowModal(true);
                        },
                      },
                      {
                        label: "Histórico",
                        icon: History,
                        onSelect: () => {
                          setSelectedExpense(expense);
                          setShowHistory(true);
                        },
                      },
                      {
                        label: busy ? "Excluindo..." : "Excluir",
                        icon: Trash2,
                        danger: true,
                        onSelect: () => remove(expense._id),
                      },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {ordered.length > visibleCount && (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-muted">
          <span>
            Mostrando {visible.length} de {ordered.length}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Mostrar mais
          </Button>
        </div>
      )}

      {showHistory && selectedExpense && (
        <PaymentHistoryPanel
          expenseId={selectedExpense._id}
          expenseName={selectedExpense.name}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showModal && selectedExpense && (
        <PaymentDialog
          expense={selectedExpense}
          onClose={() => setShowModal(false)}
          onRegistered={onChanged}
        />
      )}
    </div>
  );
}
