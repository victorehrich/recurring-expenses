"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, Wallet } from "lucide-react";
import ExpenseForm from "@/app/components/ExpenseForm";
import ExpenseList from "@/app/components/ExpenseList";
import { Card, CardContent, CardHeader } from "@/components/atoms";
import { DateRangePicker, StatCard } from "@/components/molecules";
import { AppHeader, ExpenseDialog, NotifyBanner } from "@/components/organisms";
import {
  useExpenseDialog,
  useExpenses,
  useNotify,
  usePayments,
} from "@/hooks";
import { getDueInfo } from "@/lib/expense-status";
import { getPeriodRange } from "@/lib/period";
import { formatBRL } from "@/lib/format";
import { DashboardTemplate } from "./dashboard-template";

export function DashboardClient() {
  const { expenses, loading, reload } = useExpenses();
  const { message, tone, testing, testNotify } = useNotify();
  const dialog = useExpenseDialog();

  const [range, setRange] = useState(() => getPeriodRange("this-month"));
  const { from, to } = range;
  const { payments } = usePayments(from, to);

  const kpis = useMemo(() => {
    const active = expenses.filter((e) => e.active);
    const total = active.reduce((sum, e) => sum + e.amount, 0);
    const upcoming = active.filter((e) => {
      const { days, paid } = getDueInfo(e);
      return !paid && days >= 0 && days <= 7;
    });
    const overdue = active.filter((e) => {
      const { days, paid } = getDueInfo(e);
      return !paid && days < 0;
    });
    return {
      total,
      activeCount: active.length,
      upcomingSum: upcoming.reduce((s, e) => s + e.amount, 0),
      upcomingCount: upcoming.length,
      overdueSum: overdue.reduce((s, e) => s + e.amount, 0),
      overdueCount: overdue.length,
    };
  }, [expenses]);

  const confirmed = useMemo(() => {
    const list = payments.filter((p) => p.confirmed);
    return {
      total: list.reduce((s, p) => s + p.amount, 0),
      count: list.length,
    };
  }, [payments]);

  const byCategory = useMemo(() => {
    const cats = new Map<string, string>();
    for (const e of expenses) cats.set(e._id, e.category || "Geral");
    const totals = new Map<string, number>();
    for (const p of payments) {
      const cat = cats.get(p.expenseId) ?? "Outras";
      totals.set(cat, (totals.get(cat) ?? 0) + p.amount);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [payments, expenses]);

  const upcomingTop = useMemo(() => {
    return expenses
      .filter((e) => e.active)
      .map((e) => ({ expense: e, ...getDueInfo(e) }))
      .filter((x) => !x.paid)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5)
      .map((x) => x.expense);
  }, [expenses]);

  return (
    <DashboardTemplate
      header={
        <AppHeader
          total={kpis.total}
          onNewExpense={dialog.openNew}
          onTestNotify={testNotify}
          testing={testing}
        />
      }
      stats={
        <>
          <StatCard
            label="Total ativo/mês"
            value={formatBRL(kpis.total)}
            icon={Wallet}
            hint={`${kpis.activeCount} despesas ativas`}
          />
          <StatCard
            label="Vencem em 7 dias"
            value={formatBRL(kpis.upcomingSum)}
            icon={CalendarClock}
            hint={`${kpis.upcomingCount} despesa(s)`}
          />
          <StatCard
            label="Atrasadas"
            value={formatBRL(kpis.overdueSum)}
            icon={AlertTriangle}
            hint={`${kpis.overdueCount} despesa(s)`}
          />
        </>
      }
      feedback={<>{message && <NotifyBanner message={message} tone={tone} />}</>}
      footer={
        <>
          Um aviso é enviado automaticamente pelo cron diário quando faltam os
          dias configurados (ou no dia do vencimento). Configure o bot no arquivo
          .env — veja o README.
        </>
      }
    >
      <div className="mb-4">
        <DateRangePicker from={from} to={to} onChange={setRange} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Pagamentos confirmados no período"
          value={formatBRL(confirmed.total)}
          icon={BadgeCheck}
          hint={`${confirmed.count} pagamento(s)`}
        />
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted">Por categoria no período</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted">Sem pagamentos no período.</p>
            ) : (
              byCategory.map(([cat, total]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="truncate">{cat}</span>
                  <span className="font-mono">{formatBRL(total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Próximos vencimentos</h2>
        <Link href="/expenses" className="text-sm text-brand hover:underline">
          Ver todas
        </Link>
      </div>
      {loading ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">Carregando...</p>
          </CardContent>
        </Card>
      ) : upcomingTop.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">Nada a vencer. Tudo em dia.</p>
          </CardContent>
        </Card>
      ) : (
        <ExpenseList
          expenses={upcomingTop}
          onEdit={dialog.openEdit}
          onChanged={reload}
        />
      )}

      {dialog.dialogOpen && (
        <ExpenseDialog
          title={dialog.editing ? "Editar despesa" : "Nova despesa"}
          onClose={dialog.close}
        >
          <ExpenseForm
            key={dialog.editing?._id ?? "new"}
            initial={dialog.editing ?? undefined}
            onSaved={() => {
              dialog.close();
              reload();
            }}
            onCancel={dialog.close}
          />
        </ExpenseDialog>
      )}
    </DashboardTemplate>
  );
}
