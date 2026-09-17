import { NextRequest } from "next/server";
import { failFrom, ok } from "@/server/shared/http";
import { isAuthorized } from "@/server/shared/auth";
import { checkAndNotify } from "@/server/features/notifications/service";

/**
 * GET /api/notify?token=SEU_CRON_SECRET
 * Verifica todas as despesas ativas e envia um aviso no Telegram para as que
 * vencem hoje ou dentro do prazo de aviso configurado (reminderDays).
 * Chame esta rota uma vez por dia via Vercel Cron (veja vercel.json) ou
 * qualquer serviço externo de cron (cron-job.org, EasyCron, etc).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return failFrom(new Error("Não autorizado"), 401);
  }

  try {
    const result = await checkAndNotify(new Date());
    return ok(result);
  } catch (error) {
    return failFrom(error, 500);
  }
}
