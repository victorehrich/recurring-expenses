import * as React from "react";

/**
 * Template do dashboard: só layout/slots, sem dados.
 * Slots: header, stats (KPIs), toolbar (busca/filtros), feedback (banner/erro), list.
 */
export function DashboardTemplate({
  header,
  stats,
  toolbar,
  feedback,
  children,
  footer,
}: {
  header: React.ReactNode;
  stats?: React.ReactNode;
  toolbar?: React.ReactNode;
  feedback?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:py-10">
        {header}
        {stats && <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{stats}</div>}
        {toolbar && <div className="mb-4">{toolbar}</div>}
        {feedback && <div className="mb-4 space-y-3">{feedback}</div>}
        {children}
        {footer && <footer className="mt-10 text-xs text-muted">{footer}</footer>}
      </div>
    </main>
  );
}
