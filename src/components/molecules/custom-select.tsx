"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/atoms";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

/**
 * Select custom headless (decisão F8: próprio em vez de Radix —
 * segue os atoms, sem lib nova, mesmo padrão de portal do Menu).
 * Controlado: value/onChange. Teclado: Enter/Espaço/ setas / ESC.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Selecione",
  searchable = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(rect.width, 180);
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    setPos({ top: rect.bottom + 4, left: Math.max(8, left), width });
    setQuery("");
    setHighlight(Math.max(0, filtered.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  // Flip com altura real medida
  useEffect(() => {
    if (!open || !pos) return;
    const el = panelRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (pos.top + h > window.innerHeight - 8) {
      const rect = triggerRef.current?.getBoundingClientRect();
      const above = (rect ? rect.top : pos.top) - h - 4;
      const fixed = Math.max(8, above);
      if (fixed !== pos.top) setPos((p) => (p ? { ...p, top: fixed } : p));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        panelRef.current && !panelRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("scroll", onResize, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("scroll", onResize, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open ]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) toggle();
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) choose(opt.value);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        onKeyDown={onTriggerKey}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground transition",
          "hover:border-muted focus:border-brand focus:outline-none",
          !selected && "text-muted",
          className,
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label={label}
            onKeyDown={onListKey}
            className="fixed z-[70] max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {searchable && (
              <div className="p-1">
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  placeholder="Buscar..."
                  aria-label="Buscar opções"
                  className="h-9"
                />
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">Nenhuma opção.</p>
            ) : (
              filtered.map((opt, i) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={active}
                    type="button"
                    onClick={() => choose(opt.value)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                      i === highlight ? "bg-surface2" : "",
                      active ? "font-medium text-brand" : "text-foreground",
                    )}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
