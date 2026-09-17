"use client";

import { useCallback, useState } from "react";
import type { Expense } from "./useExpenses";

export function useExpenseDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((expense: Expense) => {
    setEditing(expense);
    setDialogOpen(true);
  }, []);

  const close = useCallback(() => {
    setDialogOpen(false);
    setEditing(null);
  }, []);

  return { dialogOpen, editing, openNew, openEdit, close };
}

export type ExpenseDialogState = ReturnType<typeof useExpenseDialog>;
