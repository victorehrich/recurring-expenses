import { Plus } from "lucide-react";
import { Button } from "@/components/atoms";

export function PageHeader({
  eyebrow,
  title,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </header>
  );
}
