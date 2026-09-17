const enabled = process.env.NODE_ENV === "development";

/**
 * Logs do front — só aparecem com `npm run dev`, nunca em produção.
 * Uso: debugLog("expenses", "loaded", { count: 3 }).
 */
export function debugLog(scope: string, msg: string, data?: unknown) {
  if (!enabled) return;
  const style = "color:#2dd4bf;font-weight:bold";
  if (data === undefined) {
    console.log(`%c[${scope}]%c ${msg}`, style, "color:inherit");
  } else {
    console.log(`%c[${scope}]%c ${msg}`, style, "color:inherit", data);
  }
}

export function debugError(scope: string, msg: string, data?: unknown) {
  if (!enabled) return;
  if (data === undefined) {
    console.error(`[${scope}] ${msg}`);
  } else {
    console.error(`[${scope}] ${msg}`, data);
  }
}
