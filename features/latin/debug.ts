export function latinDebug(message: string, details?: unknown): void {
  if (!import.meta.env.DEV) return;

  console.info(`[LatinLookup] ${message}`, details ?? "");
  void fetch(`${import.meta.env.BASE_URL}__latin-debug`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, details, timestamp: new Date().toISOString() })
  }).catch(() => undefined);
}

