import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { isAuthorized } from "@/server/shared/auth";
import { logger } from "@/server/shared/logger";
import { withLogging } from "@/server/shared/withLogging";
import { checkAndNotify } from "@/server/features/notifications/service";

/**
 * GET /api/notify?token=SEU_CRON_SECRET
 * Uso exclusivo do cron (Ofelia / Vercel Cron / externo). Exige o segredo
 * via `?token=` ou header `Authorization: Bearer`.
 * O botão "Testar agora" da UI usa POST /api/notifications/test.
 */
export const GET = withLogging("GET /api/notify", async (request: NextRequest) => {
  const secretConfigured = Boolean(process.env.CRON_SECRET);
  const via = request.nextUrl.searchParams.has("token")
    ? "query"
    : request.headers.has("authorization")
      ? "header"
      : "none";

  if (!isAuthorized(request)) {
    logger.warn("notify", `unauthorized via=${via} secretConfigured=${secretConfigured}`);
    return failFrom(new Error("Não autorizado"), 401);
  }

  logger.info("notify", `start via=${via}`);
  try {
    const result = await checkAndNotify(new Date());
    logger.success(
      "notify",
      `done checked=${result.checked} notified=${result.notified.length} errors=${result.errors.length}`,
      result.errors.length > 0 ? result.errors : undefined,
    );
    return ok(result);
  } catch (error) {
    logger.error("notify", "failed", error instanceof Error ? error.message : error);
    return failFrom(error, 500);
  }
});
