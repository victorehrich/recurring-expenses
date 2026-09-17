import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { parseJsonWith } from "@/server/shared/validate";
import { confirmPaymentSchema } from "@/server/features/payments/schema";
import { paymentsService } from "@/server/features/payments/service";

/**
 * POST /api/payments/confirm
 * Body: { paymentId, confirmDate? }
 * Marks a payment as confirmed (for old payments) and optionally overrides the date.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonWith(request, confirmPaymentSchema);
    const payment = await paymentsService.confirm(body);
    return ok({ payment });
  } catch (error) {
    return failFrom(error, 400);
  }
}
