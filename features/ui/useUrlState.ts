import type { PanelState, ReaderState } from "../../features/reader/readerTypes";

function parsePanel(value: string | null): PanelState | null {
  if (!value) {
    return null;
  }

  try {
    if (value.startsWith("{")) return JSON.parse(value) as PanelState;
  } catch {
    return null;
  }

  const [translationId, bookCode, chapter] = value.split(":");

  if (!translationId || !bookCode || !chapter) {
    return null;
  }

  return {
    translationId,
    bookCode,
    chapter: Number(chapter)
  };
}

export function getUrlState(): Partial<ReaderState> {
  const params = new URLSearchParams(window.location.search);

  const left = parsePanel(params.get("left"));
  const right = parsePanel(params.get("right"));

  return {
    ...(left ? { left } : {}),
    ...(right ? { right } : {}),
    ...(params.has("q") ? { search: params.get("q") ?? "" } : {})
  };
}

export function updateUrl(state: ReaderState) {
  const params = new URLSearchParams();

  params.set(
    "left",
    JSON.stringify(state.left)
  );

  params.set(
    "right",
    JSON.stringify(state.right)
  );

  if (state.search) params.set("q", state.search);

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}