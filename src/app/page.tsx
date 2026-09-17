import type { Metadata } from "next";
import { DashboardClient } from "@/components/templates/dashboard-client";

export const metadata: Metadata = {
  title: "Despesas Recorrentes",
  description: "Cadastre despesas recorrentes e receba avisos no Telegram",
};

export default function Home() {
  return <DashboardClient />;
}
