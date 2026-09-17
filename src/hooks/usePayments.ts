"use client";

import { useCallback, useEffect, useState } from "react";

export type PaymentRow = {
  _id: string;
  expenseId: string;
  paidAt: string;
  periodKey: string;
  amount: number;
  method?: string;
  notes?: string;
  confirmed?: boolean;
};

export function usePayments(from?: Date, to?: Date, expenseId?: string, includeRemoved = false) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [removedCount, setRemovedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromKey = from?.toISOString();
  const toKey = to?.toISOString();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (expenseId) params.set("expenseId", expenseId);
      if (fromKey) params.set("from", fromKey);
      if (toKey) params.set("to", toKey);
      if (includeRemoved) params.set("includeRemoved", "true");
      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar");
      setPayments(data.payments ?? []);
      setRemovedCount(data.removedCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, toKey, expenseId, includeRemoved]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { payments, removedCount, loading, error, reload };
}
