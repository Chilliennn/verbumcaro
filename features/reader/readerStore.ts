import type { PanelState, ReaderState } from "./readerTypes";

export const DEFAULT_READER_STATE: ReaderState = {
  left: {
    translationId: "catholic_org",
    bookCode: "JHN",
    chapter: 3
  },
  right: {
    translationId: "sigao",
    bookCode: "JHN",
    chapter: 3
  },
  sync: "off",
  showHeadings: true,
  parallel: true
};

const STORAGE_KEY = "verbumcaro.reader";

export function loadReaderState(): ReaderState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_READER_STATE;
    }

    return {
      ...DEFAULT_READER_STATE,
      ...JSON.parse(saved)
    };
  } catch {
    return DEFAULT_READER_STATE;
  }
}

export function saveReaderState(state: ReaderState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function panelEquals(a: PanelState, b: PanelState) {
  return (
    a.translationId === b.translationId &&
    a.bookCode === b.bookCode &&
    a.chapter === b.chapter
  );
}
