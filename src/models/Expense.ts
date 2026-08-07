import mongoose, { Schema, models, model } from "mongoose";

export type Frequency = "mensal" | "semanal" | "anual";

export interface ExpenseDocument extends mongoose.Document {
  name: string;
  amount: number;
  category: string;
  frequency: Frequency;
  dueDay: number; // dia do mês (1-31) para mensal/anual, ou dia da semana (0-6, 0=domingo) para semanal
  dueMonth?: number; // apenas para frequência anual (1-12)
  active: boolean;
  reminderDays: number; // avisar X dias antes do vencimento
  chatId?: string; // sobrepõe o TELEGRAM_CHAT_ID padrão, se informado
  boletoUrl?: string; // URL opcional do boleto
  observation?: string; // observação opcional
  lastNotifiedKey?: string; // evita notificar mais de uma vez no mesmo período
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, default: "Geral" },
    frequency: {
      type: String,
      enum: ["mensal", "semanal", "anual"],
      required: true,
      default: "mensal",
    },
    dueDay: { type: Number, required: true, min: 0, max: 31 },
    dueMonth: { type: Number, min: 1, max: 12 },
    active: { type: Boolean, default: true },
    reminderDays: { type: Number, default: 3, min: 0, max: 30 },
    chatId: { type: String },
    boletoUrl: { type: String },
    observation: { type: String },
    lastNotifiedKey: { type: String },
  },
  { timestamps: true }
);

export default (models.Expense as mongoose.Model<ExpenseDocument>) ||
  model<ExpenseDocument>("Expense", ExpenseSchema);
