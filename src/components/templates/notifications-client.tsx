"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Skeleton, Spinner } from "@/components/atoms";
import { CustomSelect, EmptyState } from "@/components/molecules";
import { NotifyBanner, PageHeader } from "@/components/organisms";
import { useNotify } from "@/hooks";
import { formatBRL, formatDateBR } from "@/lib/format";
import { DashboardTemplate } from "./dashboard-template";

type ScheduledItem = {
  expenseId: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  nextDue: string;
  daysUntil: number;
  willNotify: boolean;
  alreadyPaid: boolean;
  channel: "default" | "custom";
};

const DAYS_OPTIONS = [7, 15, 30];

function dueLabel(daysUntil: number) {
  if (daysUntil === 0) return "vence hoje";
  if (daysUntil === 1) return "vence amanhã";
  return `vence em ${daysUntil} dias`;
}

export function NotificationsPageClient() {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { message, tone, testing, testNotify } = useNotify();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications/scheduled?days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar");
      setItems(data.scheduled ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardTemplate
      header={<PageHeader eyebrow="Telegram" title="Notificações" />}
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CustomSelect
            value={String(days)}
            onChange={(v) => setDays(Number(v))}
            options={DAYS_OPTIONS.map((d) => ({ value: String(d), label: `Próximos ${d} dias` }))}
            label="Horizonte de dias"
            className="sm:w-52"
          />
          <Button variant="secondary" onClick={testNotify} disabled={testing}>
            {testing && <Spinner />}
            {testing ? "Verificando..." : "Testar agora"}
          </Button>
        </div>
      }
      feedback={<>{message && <NotifyBanner message={message} tone={tone} />}</>}
      footer={
        <>
          Prévia sem envio: nada aqui dispara mensagem. O envio acontece pelo
          cron diário (`/api/notify`) ou pelo botão “Testar agora”.
        </>
      }
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <EmptyState
          title="Erro ao carregar."
          description={error}
          action={
            <Button variant="secondary" size="sm" onClick={load}>
              Tentar de novo
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nada programado."
          description={`Nenhum vencimento nos próximos ${days} dias.`}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.expenseId} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-tight">{item.name}</p>
                  <p className="truncate text-xs text-muted">
                    {item.category} · {formatBRL(item.amount)} · {dueLabel(item.daysUntil)} ({formatDateBR(item.nextDue)})
                  </p>
                </div>
                {item.alreadyPaid ? (
                  <Badge tone="success">pago</Badge>
                ) : item.willNotify ? (
                  <Badge tone="brand">será avisado</Badge>
                ) : (
                  <Badge>sem aviso</Badge>
                )}
                {item.channel === "custom" && (
                  <span className="hidden text-[11px] uppercase tracking-wide text-muted sm:inline">
                    canal alternativo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}
