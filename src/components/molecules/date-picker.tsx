"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import { Calendar } from "./calendar";

/**
 * Campo de data custom (substitui <input type="date">).
 * Botão + Calendar em portal, mesma língua do CustomSelect.
 */
export function DatePicker({
  value,
  onChange,
  label,
  maxDate,
  className,
}: {
  value?: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  maxDate?: Date;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
    });
    setOpen(true);
  }

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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        panelRef.current && !panelRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("scroll", () => setOpen(false), true);
    window.addEventListener("resize", () => setOpen(false));
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open ]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground transition",
          "hover:border-muted focus:border-brand focus:outline-none",
          !value && "text-muted",
          className,
        )}
      >
        <span>{value ? value.toLocaleDateString("pt-BR") : "Selecione a data"}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label ?? "Escolher data"}
            className="fixed z-[70]"
            style={{ top: pos.top, left: pos.left }}
          >
            <Calendar
              value={value}
              maxDate={maxDate}
              onChange={(d) => {
                onChange(d);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
