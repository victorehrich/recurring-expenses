import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/templates/notifications-client";

export const metadata: Metadata = {
  title: "Notificações | Despesas Recorrentes",
  description: "Veja as notificações programadas do Telegram",
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
