import { NextRequest, NextResponse } from "next/server";
import { logger, sanitizeUrl } from "./logger";

/**
 * Envolve um route handler logando uma linha por request:
 * `→ GET /api/expenses?x=1 200 12ms` (token mascarado).
 * Erros não tratados viram log ERR com o nome da rota.
 */
export function withLogging<TContext extends { params?: unknown }>(
  name: string,
  handler: (request: NextRequest, context: TContext) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: TContext): Promise<NextResponse> => {
    const started = Date.now();
    try {
      const response = await handler(request, context);
      const url = new URL(request.url);
      logger.request(
        request.method,
        sanitizeUrl(url.pathname + url.search),
        response.status,
        Date.now() - started,
      );
      return response;
    } catch (error) {
      logger.error(name, `uncaught (${Date.now() - started}ms)`, error instanceof Error ? error.message : error);
      throw error;
    }
  };
}
