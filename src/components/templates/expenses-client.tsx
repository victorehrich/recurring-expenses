"use client";

import { ExpensesManager, PageHeader } from "@/components/organisms";
import { DashboardTemplate } from "./dashboard-template";
import { useExpenseDialog } from "@/hooks";

export function ExpensesPageClient() {
  const dialog = useExpenseDialog();

  return (
    <DashboardTemplate
      header={
        <PageHeader
          eyebrow="Gerencie"
          title="Despesas"
          actionLabel="Nova despesa"
          onAction={dialog.openNew}
        />
      }
    >
      <ExpensesManager dialog={dialog} />
    </DashboardTemplate>
  );
}
