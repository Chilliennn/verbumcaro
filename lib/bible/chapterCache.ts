const memoryCache = new Map<string, unknown>();

export function getCachedChapter<T>(key: string): T | null {
  return (memoryCache.get(key) as T | undefined) ?? null;
}

export function setCachedChapter<T>(key: string, value: T) {
  memoryCache.set(key, value);
}
