"use client";

import { useState } from "react";
import { getPeriodRange, type PeriodPreset } from "@/lib/period";
import { Calendar } from "./calendar";
import { CustomSelect } from "./custom-select";

export type DateRange = {
  from: Date;
  to: Date;
};

type PresetValue = PeriodPreset | "custom";

const PRESET_OPTIONS = [
  { value: "this-month", label: "Este mês" },
  { value: "last-month", label: "Mês passado" },
  { value: "last-30", label: "Últimos 30 dias" },
  { value: "last-90", label: "Últimos 90 dias" },
  { value: "custom", label: "Personalizado" },
];

/**
 * Filtro de período: presets + range custom com 2 calendários.
 * Controlado pelo range (from/to); o preset é estado interno.
 */
export function DateRangePicker({
  from,
  to,
  onChange,
  label = "Período",
}: {
  from: Date;
  to: Date;
  onChange: (range: DateRange) => void;
  label?: string;
}) {
  const [preset, setPreset] = useState<PresetValue>("this-month");

  function pickPreset(v: PresetValue) {
    setPreset(v);
    if (v !== "custom") {
      onChange(getPeriodRange(v));
    }
  }

  return (
    <div className="space-y-3">
      <CustomSelect
        value={preset}
        onChange={(v) => pickPreset(v as PresetValue)}
        options={PRESET_OPTIONS}
        label={label}
      />
      {preset === "custom" && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div>
            <p className="mb-1 text-xs text-muted">De</p>
            <Calendar
              value={from}
              maxDate={to}
              onChange={(d) => onChange({ from: d, to })}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted">Até</p>
            <Calendar
              value={to}
              minDate={from}
              onChange={(d) => onChange({ from, to: d })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
