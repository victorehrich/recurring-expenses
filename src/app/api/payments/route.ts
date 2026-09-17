import { NextRequest } from "next/server";
import { created, failFrom, ok } from "@/server/shared/http";
import { withLogging } from "@/server/shared/withLogging";
import { parseWith, parseJsonWith } from "@/server/shared/validate";
import {
  listPaymentsQuerySchema,
  registerPaymentSchema,
} from "@/server/features/payments/schema";
import { paymentsService } from "@/server/features/payments/service";

/**
 * GET /api/payments?expenseId?&from?&to?&includeRemoved?
 * Histórico global (filtros opcionais). Por padrão exclui pagamentos
 * de despesas removidas; `includeRemoved=true` mostra tudo.
 */
export const GET = withLogging("GET /api/payments", async (request: NextRequest) => {
  try {
    const query = parseWith(
      listPaymentsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await paymentsService.list(query);
    return ok(result);
  } catch (error) {
    return failFrom(error, 400);
  }
});

/**
 * POST /api/payments
 * Body: { expenseId, paidAt?, amount?, method?, notes? }
 * Registers a payment for the current period of the expense.
 */
export const POST = withLogging("POST /api/payments", async (request: NextRequest) => {
  try {
    const body = await parseJsonWith(request, registerPaymentSchema);
    const payment = await paymentsService.register(body);
    return created({ payment });
  } catch (error) {
    return failFrom(error, 400);
  }
});
