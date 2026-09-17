import { z } from "zod";

export const scheduledQuerySchema = z.object({
  days: z.coerce.number().min(1).max(90).default(30),
});
