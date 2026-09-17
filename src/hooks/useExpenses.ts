"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExpenseInput } from "@/app/components/ExpenseForm";

export type Expense = ExpenseInput & { _id: string; lastNotifiedKey?: string };

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar");
      setExpenses(data.expenses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar despesas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { expenses, loading, error, reload };
}
