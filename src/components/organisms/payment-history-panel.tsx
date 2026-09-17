"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Skeleton, Spinner } from "@/components/atoms";
import { formatBRL, formatDateBR } from "@/lib/format";
import { Dialog } from "./dialog";

type PaymentRow = {
  _id: string;
  paidAt: string;
  amount: number;
  method?: string;
  notes?: string;
  confirmed?: boolean;
};

export function PaymentHistoryPanel({
  expenseId,
  expenseName,
  onClose,
}: {
  expenseId: string;
  expenseName?: string;
  onClose: () => void;
}) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/payments?expenseId=${expenseId}`);
        const data = await res.json();
        setPayments(data.payments ?? []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [expenseId]);

  async function confirm(paymentId: string) {
    setConfirming(paymentId);
    try {
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      setPayments((prev) =>
        prev.map((p) => (p._id === paymentId ? { ...p, confirmed: true } : p)),
      );
    } finally {
      setConfirming(null);
    }
  }

  return (
    <Dialog
      title={expenseName ? `Histórico · ${expenseName}` : "Histórico de pagamentos"}
      onClose={onClose}
      wide
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-muted">Sem pagamentos registrados.</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {payments.map((p) => (
            <li
              key={p._id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface2 p-3"
            >
              <div className="text-sm">
                <p className="font-medium">{formatDateBR(p.paidAt)}</p>
                <p className="font-mono">{formatBRL(p.amount)}</p>
                {p.method && <p className="text-muted">Método: {p.method}</p>}
                {p.notes && <p className="text-muted">Obs: {p.notes}</p>}
              </div>
              {p.confirmed ? (
                <Badge tone="warning">Confirmado</Badge>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={confirming === p._id}
                  onClick={() => confirm(p._id)}
                >
                  {confirming === p._id && <Spinner />}
                  Confirmar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
