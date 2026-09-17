import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-brand",
        className,
      )}
    />
  );
}
