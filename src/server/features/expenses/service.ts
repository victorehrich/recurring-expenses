import { connectToDatabase } from "@/server/shared/db";
import { AppError } from "@/server/shared/errors";
import { expensesRepository } from "./repository";
import type { CreateExpenseInput, UpdateExpenseInput } from "./types";

function defaultReminderDays() {
  return Number(process.env.DIAS_DE_AVISO ?? 3);
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  // Remove undefined para não sobrescrever campos no PUT
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export const expensesService = {
  async list() {
    await connectToDatabase();
    return expensesRepository.list();
  },

  async getById(id: string) {
    await connectToDatabase();
    const expense = await expensesRepository.getById(id);
    if (!expense) throw AppError.notFound("Despesa não encontrada");
    return expense;
  },

  async create(input: CreateExpenseInput) {
    await connectToDatabase();
    return expensesRepository.create({
      name: input.name,
      amount: input.amount,
      category: input.category || "Geral",
      frequency: input.frequency || "mensal",
      dueDay: input.dueDay,
      dueMonth: input.dueMonth,
      active: input.active ?? true,
      reminderDays: input.reminderDays ?? defaultReminderDays(),
      chatId: input.chatId || undefined,
      boletoUrl: input.boletoUrl || undefined,
      observation: input.observation || undefined,
    });
  },

  async update(id: string, input: UpdateExpenseInput) {
    await connectToDatabase();
    const data = clean({
      name: input.name,
      amount: input.amount,
      category: input.category,
      frequency: input.frequency,
      dueDay: input.dueDay,
      dueMonth: input.dueMonth,
      active: input.active,
      reminderDays: input.reminderDays,
      chatId: input.chatId || undefined,
      boletoUrl: input.boletoUrl || undefined,
      observation: input.observation || undefined,
    });
    const expense = await expensesRepository.update(id, data);
    if (!expense) throw AppError.notFound("Despesa não encontrada");
    return expense;
  },

  async remove(id: string) {
    await connectToDatabase();
    const expense = await expensesRepository.remove(id);
    if (!expense) throw AppError.notFound("Despesa não encontrada");
    return expense;
  },
};
