import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const tones = {
  info: { icon: Info, cls: "border-brand/30 bg-brand/10 text-foreground" },
  success: { icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-foreground" },
  error: { icon: AlertTriangle, cls: "border-danger/30 bg-danger/10 text-foreground" },
} as const;

export function NotifyBanner({
  message,
  tone = "info",
}: {
  message: string;
  tone?: keyof typeof tones;
}) {
  const { icon: Icon, cls } = tones[tone];
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm", cls)}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
