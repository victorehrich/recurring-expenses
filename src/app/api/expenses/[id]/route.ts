import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { parseWith } from "@/server/shared/validate";
import { updateExpenseSchema } from "@/server/features/expenses/schema";
import { expensesService } from "@/server/features/expenses/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const expense = await expensesService.getById(params.id);
    return ok({ expense });
  } catch (error) {
    return failFrom(error, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = parseWith(updateExpenseSchema, await request.json());
    const expense = await expensesService.update(params.id, body);
    return ok({ expense });
  } catch (error) {
    return failFrom(error, 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await expensesService.remove(params.id);
    return ok({ ok: true });
  } catch (error) {
    return failFrom(error, 500);
  }
}
