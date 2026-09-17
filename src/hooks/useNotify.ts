"use client";

import { useCallback, useState } from "react";
import { debugError, debugLog } from "@/lib/debug";

export type NotifyTone = "info" | "success" | "error";

export function useNotify() {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<NotifyTone>("info");
  const [testing, setTesting] = useState(false);

  const testNotify = useCallback(async () => {
    setTesting(true);
    setTone("info");
    setMessage("Verificando...");
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao verificar");
      debugLog("notify", "test result", { checked: data.checked, notified: data.notified });
      if (data.notified?.length) {
        setTone("success");
        setMessage(`Avisos enviados: ${data.notified.join(", ")}`);
      } else {
        setTone("info");
        setMessage("Nenhuma despesa precisa de aviso hoje.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "desconhecido";
      setTone("error");
      setMessage(`Erro: ${message}`);
      debugError("notify", "test failed", message);
    } finally {
      setTesting(false);
    }
  }, []);

  const dismiss = useCallback(() => setMessage(null), []);

  return { message, tone, testing, testNotify, dismiss };
}
