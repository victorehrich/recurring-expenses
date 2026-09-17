import type { Frequency } from "@/models/Expense";

export type ExpenseDTO = {
  _id: string;
  name: string;
  amount: number;
  category: string;
  frequency: Frequency;
  dueDay: number;
  dueMonth?: number;
  active: boolean;
  reminderDays: number;
  chatId?: string;
  boletoUrl?: string;
  observation?: string;
  lastNotifiedKey?: string;
};

export type CreateExpenseInput = {
  name: string;
  amount: number;
  category?: string;
  frequency?: Frequency;
  dueDay: number;
  dueMonth?: number;
  active?: boolean;
  reminderDays?: number;
  chatId?: string;
  boletoUrl?: string;
  observation?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;
