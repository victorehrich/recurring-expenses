import type { PaymentMethod } from "@/models/Payment";

export type RegisterPaymentInput = {
  expenseId: string;
  paidAt?: string | Date;
  amount?: number;
  method?: PaymentMethod;
  notes?: string;
};

export type ConfirmPaymentInput = {
  paymentId: string;
  confirmDate?: string | Date;
};
