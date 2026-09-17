// Cores ANSI (desligam com NO_COLOR=1). Docker preserva ANSI nos logs.
const TTY = typeof process.stdout !== "undefined" && Boolean(process.stdout?.isTTY);
const COLORS = TTY && !process.env.NO_COLOR;

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function paint(color: string, s: string | number) {
  return COLORS ? `${color}${s}${C.reset}` : String(s);
}

function stamp() {
  return new Date().toISOString();
}

function fmtData(data: unknown): string {
  if (typeof data === "string") return data;
  try {
    const s = JSON.stringify(data);
    return s.length > 300 ? `${s.slice(0, 300)}…` : s;
  } catch {
    return String(data);
  }
}

/** Níveis via LOG_LEVEL=debug|info|warn|error (padrão: info). */
const ORDER = ["debug", "info", "warn", "error"] as const;
type Level = (typeof ORDER)[number];
const CURRENT = ((): Level => {
  const v = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  return (ORDER as readonly string[]).includes(v) ? (v as Level) : "info";
})();

function allowed(level: Level) {
  return ORDER.indexOf(level) >= ORDER.indexOf(CURRENT);
}

/** Mascara ?token=segredo nos logs. */
export function sanitizeUrl(url: string) {
  return url.replace(/([?&]token=)[^&\s]*/g, "$1***");
}

const METHOD_COLORS: Record<string, string> = {
  GET: C.blue,
  POST: C.green,
  PUT: C.yellow,
  DELETE: C.red,
  PATCH: C.magenta,
};

function statusColor(status: number) {
  if (status < 300) return C.green;
  if (status < 500) return C.yellow;
  return C.red;
}

/**
 * Logs com timestamp, escopo e cores. Nunca passe segredos
 * (tokens, .env) como `data` — só contagens, nomes e mensagens.
 */
export const logger = {
  debug(scope: string, msg: string, data?: unknown) {
    if (!allowed("debug")) return;
    print(C.gray, "DBG", scope, msg, data);
  },
  info(scope: string, msg: string, data?: unknown) {
    if (!allowed("info")) return;
    print(C.cyan, "INF", scope, msg, data);
  },
  success(scope: string, msg: string, data?: unknown) {
    if (!allowed("info")) return;
    print(C.green, " OK", scope, msg, data);
  },
  warn(scope: string, msg: string, data?: unknown) {
    if (!allowed("warn")) return;
    print(C.yellow, "WRN", scope, msg, data);
  },
  error(scope: string, msg: string, data?: unknown) {
    if (!allowed("error")) return;
    print(C.red, "ERR", scope, msg, data);
  },
  /** Uma linha por request: → GET /api/expenses 200 12ms */
  request(method: string, path: string, status: number, ms: number) {
    const line =
      `${paint(C.dim, stamp())} ` +
      `${paint(C.bold, "API")} ` +
      `${paint(METHOD_COLORS[method] ?? C.cyan, method.padEnd(2))} ` +
      `${sanitizeUrl(path)} ` +
      `${paint(statusColor(status), status)} ` +
      `${paint(ms > 1000 ? C.yellow : C.dim, `${ms}ms`)}`;
    console.log(line);
  },
};

function print(color: string, level: string, scope: string, msg: string, data?: unknown) {
  const line =
    `${paint(C.dim, stamp())} ` +
    `${paint(color, level)} ` +
    `${paint(C.magenta, `[${scope}]`)} ` +
    msg +
    (data === undefined ? "" : ` ${paint(C.dim, fmtData(data))}`);
  if (level === "ERR") console.error(line);
  else if (level === "WRN") console.warn(line);
  else console.log(line);
}
