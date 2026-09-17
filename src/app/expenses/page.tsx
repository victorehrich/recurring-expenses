import type { Metadata } from "next";
import { ExpensesPageClient } from "@/components/templates/expenses-client";

export const metadata: Metadata = {
  title: "Despesas | Despesas Recorrentes",
  description: "Gerencie suas despesas recorrentes",
};

export default function ExpensesPage() {
  return <ExpensesPageClient />;
}
