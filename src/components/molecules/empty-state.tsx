import * as React from "react";
import { Inbox } from "lucide-react";
import { Card } from "@/components/atoms";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed p-8 text-center">
      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </Card>
  );
}
