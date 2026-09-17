"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/cn";

export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  onSelect: () => void;
};

export function Menu({
  items,
  label = "Ações",
  disabled,
}: {
  items: MenuItem[];
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    // Posição fixa a partir do trigger: imune a overflow-hidden de ancestrais.
    // Abre colado abaixo; o ajuste fino (flip) usa a altura real medida no efeito.
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, right: Math.max(8, window.innerWidth - rect.right) });
    setOpen(true);
  }

  // Corrige com a altura real: se estourar embaixo, abre colado acima do botão.
  useEffect(() => {
    if (!open || !pos) return;
    const el = menuRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (pos.top + h > window.innerHeight - 8) {
      const rect = rootRef.current?.getBoundingClientRect();
      const above = (rect ? rect.top : pos.top) - h - 4;
      const fixed = Math.max(8, above);
      if (fixed !== pos.top) setPos((p) => (p ? { ...p, top: fixed } : p));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    function close() {
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open ]);

  return (
    <div ref={rootRef}>
      <Button
        variant="ghost"
        size="icon"
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[70] max-h-[50vh] min-w-52 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg"
            style={{ top: pos.top, right: pos.right }}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  ref={i === 0 ? firstItemRef : undefined}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                    "hover:bg-surface2",
                    item.danger ? "text-danger" : "text-foreground",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
