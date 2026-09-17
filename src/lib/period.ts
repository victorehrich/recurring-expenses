export type PeriodPreset = "this-month" | "last-month" | "last-30" | "last-90";

export const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "this-month", label: "Este mês" },
  { value: "last-month", label: "Mês passado" },
  { value: "last-30", label: "Últimos 30 dias" },
  { value: "last-90", label: "Últimos 90 dias" },
];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

/** Intervalo [from, to] (inclusive) para o preset. Custom chega na F8. */
export function getPeriodRange(preset: PeriodPreset, now = new Date()) {
  switch (preset) {
    case "last-month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { from: startOfDay(from), to };
    }
    case "last-30": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
    case "last-90": {
      const from = new Date(now);
      from.setDate(from.getDate() - 89);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
    case "this-month":
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
  }
}
