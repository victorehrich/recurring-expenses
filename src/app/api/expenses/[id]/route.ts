import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { withLogging } from "@/server/shared/withLogging";
import { parseWith } from "@/server/shared/validate";
import { updateExpenseSchema } from "@/server/features/expenses/schema";
import { expensesService } from "@/server/features/expenses/service";

export const GET = withLogging(
  "GET /api/expenses/[id]",
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const expense = await expensesService.getById(params.id);
      return ok({ expense });
    } catch (error) {
      return failFrom(error, 500);
    }
  },
);

export const PUT = withLogging(
  "PUT /api/expenses/[id]",
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = parseWith(updateExpenseSchema, await request.json());
      const expense = await expensesService.update(params.id, body);
      return ok({ expense });
    } catch (error) {
      return failFrom(error, 400);
    }
  },
);

export const DELETE = withLogging(
  "DELETE /api/expenses/[id]",
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await expensesService.remove(params.id);
      return ok({ ok: true });
    } catch (error) {
      return failFrom(error, 500);
    }
  },
);
