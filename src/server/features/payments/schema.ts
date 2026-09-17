import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const registerPaymentSchema = z.object({
  expenseId: z.string().trim().min(1, "expenseId is required"),
  paidAt: z.coerce.date().optional(),
  amount: z.coerce.number().min(0).optional(),
  method: z.enum(["Cartão", "Boleto", "PIX"]).optional(),
  notes: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().trim().min(1, "paymentId is required"),
  confirmDate: z.coerce.date().optional(),
});

const booleanFromQuery = (v: unknown) =>
  v === true || v === "true" || v === "1" ? true : v === undefined ? undefined : false;

export const listPaymentsQuerySchema = z.object({
  expenseId: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  includeRemoved: z.preprocess(booleanFromQuery, z.boolean().default(false)),
});
