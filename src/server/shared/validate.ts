import { z } from "zod";
import { AppError } from "./errors";

export function parseWith<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const message = first
      ? `${first.path.join(".") || "body"}: ${first.message}`
      : "Dados inválidos";
    throw AppError.badRequest(message);
  }
  return result.data;
}

export async function parseJsonWith<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const body = await request.json();
  return parseWith(schema, body);
}
