import type { NextRequest } from "next/server";

/**
 * Autorização do cron: Bearer <CRON_SECRET> ou ?token=<CRON_SECRET>.
 * Se CRON_SECRET não estiver definido, libera (comportamento legado local).
 */
export function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const header = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("token");

  return header === `Bearer ${secret}` || queryToken === secret;
}
