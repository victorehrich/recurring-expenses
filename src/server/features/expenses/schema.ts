import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());

const base = {
  name: z.string().trim().min(1, "nome é obrigatório"),
  amount: z.coerce.number().min(0, "valor deve ser >= 0"),
  category: z.string().trim().min(1).default("Geral"),
  frequency: z.enum(["mensal", "semanal", "anual"]).default("mensal"),
  dueDay: z.coerce.number().min(0).max(31),
  dueMonth: z.coerce.number().min(1).max(12).optional(),
  active: z.coerce.boolean().default(true),
  reminderDays: z.coerce.number().min(0).max(30).optional(),
  chatId: optionalText,
  boletoUrl: optionalText,
  observation: optionalText,
};

export const createExpenseSchema = z.object({
  ...base,
  category: base.category.optional(),
  frequency: base.frequency.optional(),
  active: base.active.optional(),
});

export const updateExpenseSchema = z
  .object({
    name: base.name.optional(),
    amount: base.amount.optional(),
    category: z.string().trim().min(1).optional(),
    frequency: z.enum(["mensal", "semanal", "anual"]).optional(),
    dueDay: base.dueDay.optional(),
    dueMonth: base.dueMonth,
    active: z.coerce.boolean().optional(),
    reminderDays: base.reminderDays,
    chatId: optionalText,
    boletoUrl: optionalText,
    observation: optionalText,
  })
  .strict();

export type CreateExpenseBody = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseBody = z.infer<typeof updateExpenseSchema>;
