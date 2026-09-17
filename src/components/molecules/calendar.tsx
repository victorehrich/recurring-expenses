"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["S", "T", "Q", "Q", "S", "S", "D"]; // segunda a domingo

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(year: number, month: number) {
  const s = new Date(year, month, 1)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Grade de mês custom pt-BR, segunda a domingo.
 * Controlado pela data exibida (view) + seleção via value/onChange.
 */
export function Calendar({
  value,
  onChange,
  maxDate,
  minDate,
}: {
  value?: Date | null;
  onChange: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
}) {
  const initial = value ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const today = useMemo(() => new Date(), []);

  function shift(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  // 0=seg .. 6=dom para o dia 1 do mês em exibição
  const lead = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  function disabled(d: Date) {
    if (maxDate && d > maxDate) return true;
    if (minDate && d < minDate) return true;
    return false;
  }

  return (
    <div className="w-64 select-none rounded-xl border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => shift(-1)}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{monthLabel(viewYear, viewMonth)}</span>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => shift(1)}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] text-muted">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="py-1">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) =>
          d === null ? (
            <span key={`b-${i}`} />
          ) : (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled(d)}
              onClick={() => onChange(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12))}
              aria-label={d.toLocaleDateString("pt-BR")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition",
                "hover:bg-surface2 disabled:opacity-30 disabled:hover:bg-transparent",
                value && sameDay(d, value) && "bg-brand font-medium text-brand-foreground hover:opacity-90",
                !value && sameDay(d, today) && "ring-1 ring-brand",
                value && !sameDay(d, value) && sameDay(d, today) && "ring-1 ring-muted",
              )}
            >
              {d.getDate()}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
