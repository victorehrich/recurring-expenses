import { connectToDatabase } from "@/server/shared/db";
import { AppError } from "@/server/shared/errors";
import { getNextOccurrence } from "@/lib/dueDate";
import { paymentsRepository, type PaymentFilter } from "./repository";
import type { ConfirmPaymentInput, RegisterPaymentInput } from "./types";

export const paymentsService = {
  async list(filter: PaymentFilter = {}) {
    await connectToDatabase();
    const payments = await paymentsRepository.list(filter);
    if (filter.includeRemoved) {
      return { payments, removedCount: 0 };
    }
    const ids = [...new Set(payments.map((p) => String(p.expenseId)))];
    const existing = await paymentsRepository.existingExpenseIds(ids);
    const kept = payments.filter((p) => existing.has(String(p.expenseId)));
    return { payments: kept, removedCount: payments.length - kept.length };
  },

  async register(input: RegisterPaymentInput) {
    if (!input.expenseId) throw AppError.badRequest("expenseId is required");
    await connectToDatabase();

    const expense = await paymentsRepository.getExpenseById(input.expenseId);
    if (!expense) throw AppError.notFound("Despesa não encontrada");

    const paymentDate = input.paidAt ? new Date(input.paidAt) : new Date();
    const { periodKey } = getNextOccurrence(expense, paymentDate);

    const exists = await paymentsRepository.findByPeriod(input.expenseId, periodKey);
    if (exists) {
      throw AppError.badRequest("Pagamento já registrado para este período");
    }

    const payment = await paymentsRepository.create({
      expenseId: input.expenseId,
      paidAt: paymentDate,
      periodKey,
      amount: input.amount ?? expense.amount,
      method: input.method,
      notes: input.notes,
    });

    expense.lastNotifiedKey = periodKey;
    await expense.save();

    return payment;
  },

  async confirm(input: ConfirmPaymentInput) {
    if (!input.paymentId) throw AppError.badRequest("paymentId is required");
    await connectToDatabase();

    const payment = await paymentsRepository.findPaymentById(input.paymentId);
    if (!payment) throw AppError.notFound("Pagamento não encontrado");

    payment.confirmed = true;
    if (input.confirmDate) payment.paidAt = new Date(input.confirmDate);
    await payment.save();

    return payment;
  },
};
