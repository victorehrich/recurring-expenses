import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { parseWith } from "@/server/shared/validate";
import { scheduledQuerySchema } from "@/server/features/notifications/schema";
import { previewScheduled } from "@/server/features/notifications/service";

/**
 * GET /api/notifications/scheduled?days=30
 * Dry-run: o que seria notificado nos próximos N dias, sem enviar nada.
 */
export async function GET(request: NextRequest) {
  try {
    const { days } = parseWith(
      scheduledQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await previewScheduled(days, new Date());
    return ok(result);
  } catch (error) {
    return failFrom(error, 400);
  }
}
