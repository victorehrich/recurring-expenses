import * as React from "react";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 transition focus:border-brand focus:outline-none disabled:opacity-50";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(fieldClass, "h-10", className)} {...props} />;
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea className={cn(fieldClass, "min-h-[80px] resize-y", className)} {...props} />
  );
}

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded accent-[rgb(var(--brand))]", className)}
      {...props}
    />
  );
}
