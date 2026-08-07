import mongoose, { Schema, model, models } from "mongoose";

export type PaymentMethod = "Cartão" | "Boleto" | "PIX";

export interface PaymentDocument extends mongoose.Document {
  expenseId: mongoose.Types.ObjectId; // reference to Expense
  paidAt: Date; // payment date (default now, can be overridden)
  periodKey: string; // e.g., "2023-07-mensal"
  amount: number; // amount paid (default = expense.amount)
  method?: PaymentMethod; // optional enum
  notes?: string; // optional observation
  confirmed?: boolean; // mark old payments as confirmed
}

const PaymentSchema = new Schema<PaymentDocument>({
  expenseId: { type: Schema.Types.ObjectId, ref: "Expense", required: true },
  paidAt: { type: Date, default: Date.now },
  periodKey: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Cartão", "Boleto", "PIX"] },
  notes: { type: String },
  confirmed: { type: Boolean, default: false },
});

export default (models.Payment as mongoose.Model<PaymentDocument>) ||
  model<PaymentDocument>("Payment", PaymentSchema);
