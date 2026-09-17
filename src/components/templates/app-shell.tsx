"use client";

import { useEffect, useState } from "react";
import { MobileNav, Navbar, Sidebar } from "@/components/organisms";

const COLLAPSED_KEY = "sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // storage indisponível — mantém expandida
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      } catch {
        // ignora
      }
      return !c;
    });
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} />
      <div className="min-w-0 flex-1">
        <Navbar
          onMenu={() => setMobileOpen(true)}
          onToggleSidebar={toggleCollapsed}
          sidebarCollapsed={collapsed}
        />
        {children}
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
