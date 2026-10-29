export function join(...parts: string[]): string {
  return parts
    .join("/")
    .replace(/([^:]\/)\/+/g, "$1")
    .replace(/\/$/, "");
}
