"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  History,
  LayoutDashboard,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Navegação do AppShell em config — base para futura customização (reordenar/ocultar). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Despesas", icon: Wallet },
  { href: "/notifications", label: "Notificações", icon: BellRing },
  { href: "/payments", label: "Pagamentos", icon: History },
];

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1" aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-brand/10 font-medium text-brand"
                : "text-muted hover:bg-surface2 hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-5", collapsed && "justify-center px-2")}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand font-display text-sm font-bold text-brand-foreground">
        R$
      </span>
      {!collapsed && <span className="font-display font-semibold">Despesas</span>}
    </div>
  );
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <Brand collapsed={collapsed} />
      <div className="flex-1 px-2">
        <NavLinks collapsed={collapsed} />
      </div>
      <div className="border-t border-border p-3 text-center">
        <p
          className="truncate font-mono text-[11px] text-muted"
          title={`Versão ${APP_VERSION}`}
        >
          v{APP_VERSION}
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-surface">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="mr-3 rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 px-2">
          <NavLinks onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
}
