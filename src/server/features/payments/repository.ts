import Payment from "@/models/Payment";
import Expense from "@/models/Expense";

export type PaymentFilter = {
  expenseId?: string;
  from?: Date;
  to?: Date;
  includeRemoved?: boolean;
};

export const paymentsRepository = {
  list(filter: PaymentFilter = {}) {
    const query: Record<string, unknown> = {};
    if (filter.expenseId) query.expenseId = filter.expenseId;
    if (filter.from || filter.to) {
      query.paidAt = {
        ...(filter.from ? { $gte: filter.from } : {}),
        ...(filter.to ? { $lte: filter.to } : {}),
      };
    }
    return Payment.find(query).sort({ paidAt: -1 }).lean();
  },

  findPaymentById(id: string) {
    return Payment.findById(id);
  },

  findByPeriod(expenseId: string, periodKey: string) {
    return Payment.findOne({ expenseId, periodKey }).lean();
  },

  create(data: {
    expenseId: string;
    paidAt: Date;
    periodKey: string;
    amount: number;
    method?: "Cartão" | "Boleto" | "PIX";
    notes?: string;
  }) {
    return Payment.create({ ...data, confirmed: true });
  },

  getExpenseById(id: string) {
    return Expense.findById(id);
  },

  async existingExpenseIds(ids: string[]) {
    if (ids.length === 0) return new Set<string>();
    const docs = await Expense.find({ _id: { $in: ids } })
      .select("_id")
      .lean();
    return new Set(docs.map((d) => String(d._id)));
  },
};
