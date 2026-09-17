"use client";

import { usePathname } from "next/navigation";
import {
  Menu as BurgerIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/atoms";
import { NAV_ITEMS } from "./sidebar";

export function Navbar({
  onMenu,
  onToggleSidebar,
  sidebarCollapsed,
}: {
  onMenu: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((i) => i.href === pathname)?.label ?? "Despesas";

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={onMenu}
        className="rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground md:hidden"
      >
        <BurgerIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        title={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        className="hidden rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground md:block"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>
      <span className="font-display font-semibold">{current}</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
