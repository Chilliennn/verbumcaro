export function chineseDebug(message: string, details?: unknown): void {
  if (!import.meta.env.DEV) return;

  console.info(`[ChineseLookup] ${message}`, details ?? "");
  void fetch(`${import.meta.env.BASE_URL}__chinese-debug`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, details, timestamp: new Date().toISOString() })
  }).catch(() => undefined);
}
