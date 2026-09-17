import * as React from "react";
import { cn } from "@/lib/cn";

export function FormField({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="text-muted">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted/80">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}
