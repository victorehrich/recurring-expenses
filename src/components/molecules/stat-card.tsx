import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/atoms";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{label}</span>
        </div>
        <p className="font-mono text-xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}
