"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Card } from "@/components/atoms";
import { cn } from "@/lib/cn";

export function Dialog({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex h-full items-center justify-center p-4">
        <Card
          className={cn(
            "flex max-h-[calc(100dvh-2rem)] w-full flex-col p-6",
            wide ? "max-w-lg" : "max-w-md",
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg p-1 text-muted transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}
