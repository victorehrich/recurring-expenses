"use client";

import { useMemo, useState } from "react";
import { getDueInfo } from "@/lib/expense-status";
import type { Expense } from "./useExpenses";

export type ExpenseFilter = "all" | "open" | "upcoming" | "overdue" | "paid";

export const FILTER_OPTIONS: { value: ExpenseFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Em aberto" },
  { value: "upcoming", label: "Vencem em 7 dias" },
  { value: "overdue", label: "Atrasadas" },
  { value: "paid", label: "Pagas" },
];

export function useExpenseFilters(expenses: Expense[]) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ExpenseFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (q && !`${e.name} ${e.category}`.toLowerCase().includes(q)) return false;
      if (status === "all") return true;
      const { days, paid } = getDueInfo(e);
      switch (status) {
        case "paid":
          return paid;
        case "overdue":
          return !paid && days < 0;
        case "upcoming":
          return !paid && days >= 0 && days <= 7;
        case "open":
          return !paid;
      }
    });
  }, [expenses, query, status]);

  return { query, setQuery, status, setStatus, filtered };
}
