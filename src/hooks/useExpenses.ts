"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExpenseInput } from "@/app/components/ExpenseForm";
import { debugError, debugLog } from "@/lib/debug";

export type Expense = ExpenseInput & { _id: string; lastNotifiedKey?: string };

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar");
      setExpenses(data.expenses ?? []);
      debugLog("expenses", `loaded ${data.expenses?.length ?? 0} in ${Date.now() - started}ms`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar despesas";
      setError(message);
      debugError("expenses", "load failed", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { expenses, loading, error, reload };
}
