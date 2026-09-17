import Expense from "@/models/Expense";
import type { CreateExpenseInput, UpdateExpenseInput } from "./types";

export const expensesRepository = {
  list() {
    return Expense.find().sort({ createdAt: -1 }).lean();
  },

  getById(id: string) {
    return Expense.findById(id).lean();
  },

  create(data: CreateExpenseInput) {
    return Expense.create(data);
  },

  update(id: string, data: UpdateExpenseInput) {
    return Expense.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  remove(id: string) {
    return Expense.findByIdAndDelete(id).lean();
  },
};
