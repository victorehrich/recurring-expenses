import type { Metadata } from "next";
import { PaymentsPageClient } from "@/components/templates/payments-client";

export const metadata: Metadata = {
  title: "Pagamentos | Despesas Recorrentes",
  description: "Histórico global de pagamentos",
};

export default function PaymentsPage() {
  return <PaymentsPageClient />;
}
