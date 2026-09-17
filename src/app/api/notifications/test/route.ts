import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { logger } from "@/server/shared/logger";
import { withLogging } from "@/server/shared/withLogging";
import { checkAndNotify } from "@/server/features/notifications/service";

const COOLDOWN_MS = 60_000;
let lastRun = 0;

/**
 * POST /api/notifications/test
 * Disparo manual pelo botão "Testar agora" da UI. Não usa CRON_SECRET
 * (o segredo nunca vai para o browser); em vez disso exige mesma origem
 * (Origin/Referer batendo com o Host) + cooldown de 60s.
 * O cron continua usando GET /api/notify?token=.
 */
export const POST = withLogging("POST /api/notifications/test", async (request: NextRequest) => {
  const host = request.headers.get("host");
  const candidates = [request.headers.get("origin"), request.headers.get("referer")];
  const sameOrigin = candidates.some((v) => {
    if (!v) return false;
    try {
      return new URL(v).host === host;
    } catch {
      return false;
    }
  });

  if (!sameOrigin) {
    logger.warn("notify-test", `blocked host=${host}`);
    return failFrom(new Error("Não autorizado"), 401);
  }

  const now = Date.now();
  if (now - lastRun < COOLDOWN_MS) {
    logger.warn("notify-test", "blocked cooldown");
    return failFrom(new Error("Aguarde cerca de 1 minuto entre testes"), 429);
  }
  lastRun = now;

  logger.info("notify-test", "manual trigger start");
  try {
    const result = await checkAndNotify(new Date());
    logger.success(
      "notify-test",
      `done checked=${result.checked} notified=${result.notified.length} errors=${result.errors.length}`,
      result.errors.length > 0 ? result.errors : undefined,
    );
    return ok(result);
  } catch (error) {
    logger.error("notify-test", "failed", error instanceof Error ? error.message : error);
    return failFrom(error, 500);
  }
});
