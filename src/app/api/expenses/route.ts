import { NextRequest } from "next/server";
import { created, failFrom, ok } from "@/server/shared/http";
import { withLogging } from "@/server/shared/withLogging";
import { parseJsonWith } from "@/server/shared/validate";
import { createExpenseSchema } from "@/server/features/expenses/schema";
import { expensesService } from "@/server/features/expenses/service";

export const GET = withLogging("GET /api/expenses", async () => {
  try {
    const expenses = await expensesService.list();
    return ok({ expenses });
  } catch (error) {
    return failFrom(error, 500);
  }
});

export const POST = withLogging("POST /api/expenses", async (request: NextRequest) => {
  try {
    const body = await parseJsonWith(request, createExpenseSchema);
    const expense = await expensesService.create(body);
    return created({ expense });
  } catch (error) {
    return failFrom(error, 400);
  }
});
