import { Badge } from "@/components/atoms";
import type { ExpenseStatus } from "@/lib/expense-status";

export function StatusPill({ status }: { status: ExpenseStatus }) {
  return <Badge tone={status.tone}>{status.label}</Badge>;
}
