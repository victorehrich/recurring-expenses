"use client";

import { BellRing, Plus } from "lucide-react";
import { Button, Spinner } from "@/components/atoms";
import { formatBRL } from "@/lib/format";

export function AppHeader({
  total,
  onNewExpense,
  onTestNotify,
  testing,
  newLabel = "Nova despesa",
}: {
  total: number;
  onNewExpense: () => void;
  onTestNotify: () => void;
  testing?: boolean;
  newLabel?: string;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Despesas recorrentes · Telegram
        </p>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Visão geral</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted">Total ativo/mês</p>
          <p className="font-mono text-xl">{formatBRL(total)}</p>
        </div>
        <Button onClick={onNewExpense}>
          <Plus className="h-4 w-4" />
          {newLabel}
        </Button>
        <Button variant="secondary" size="icon" onClick={onTestNotify} title="Testar notificações agora" aria-label="Testar notificações agora">
          {testing ? <Spinner /> : <BellRing className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
