"use client";

import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Badge, Button, Checkbox, Skeleton } from "@/components/atoms";
import { DateRangePicker, EmptyState, StatCard } from "@/components/molecules";
import { NotifyBanner, PageHeader } from "@/components/organisms";
import { useExpenses, usePayments } from "@/hooks";
import { getPeriodRange } from "@/lib/period";
import { formatBRL, formatDateBR } from "@/lib/format";
import { DashboardTemplate } from "./dashboard-template";

export function PaymentsPageClient() {
  const [range, setRange] = useState(() => getPeriodRange("this-month"));
  const [showRemoved, setShowRemoved] = useState(false);
  const { from, to } = range;
  const { payments, removedCount, loading, error, reload } = usePayments(from, to, undefined, showRemoved);
  const { expenses } = useExpenses();

  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of expenses) map.set(e._id, e.name);
    return map;
  }, [expenses]);

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardTemplate
      header={<PageHeader eyebrow="Histórico" title="Pagamentos" />}
      stats={
        <>
          <StatCard
            label="Total no período"
            value={formatBRL(total)}
            icon={BadgeCheck}
            hint={`${payments.length} pagamento(s)`}
          />
        </>
      }
      toolbar={
        <div className="flex flex-col gap-3">
          <DateRangePicker from={from} to={to} onChange={setRange} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <Checkbox
              checked={showRemoved}
              onChange={(e) => setShowRemoved(e.target.checked)}
            />
            Mostrar despesas removidas
            {!showRemoved && removedCount > 0 && (
              <span className="text-xs">({removedCount} oculto(s))</span>
            )}
          </label>
        </div>
      }
      feedback={
        <>
          {error && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <NotifyBanner message={`Erro ao carregar: ${error}`} tone="error" />
              </div>
              <Button variant="secondary" size="sm" onClick={reload}>
                Tentar de novo
              </Button>
            </div>
          )}
        </>
      }
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          title="Sem pagamentos no período."
          description="Registre um pagamento pela página de despesas."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-tight">
                    {names.get(p.expenseId) ?? "Despesa removida"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {formatDateBR(p.paidAt)} · {formatBRL(p.amount)}
                    {p.method ? ` · ${p.method}` : ""}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </p>
                </div>
                {p.confirmed ? (
                  <Badge tone="success">confirmado</Badge>
                ) : (
                  <Badge>pendente</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}
