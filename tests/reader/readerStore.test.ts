import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DEFAULT_READER_STATE,
  loadReaderState,
  saveReaderState,
  panelEquals
} from "../../features/reader/readerStore";
import type { ReaderState, PanelState } from "../../features/reader/readerTypes";

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key]; }),
  clear: vi.fn(() => { mockLocalStorage.store = {}; })
};

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true
});

describe("readerStore", () => {
  beforeEach(() => {
    mockLocalStorage.store = {};
    vi.clearAllMocks();
  });

  describe("DEFAULT_READER_STATE", () => {
    it("has correct default values", () => {
      expect(DEFAULT_READER_STATE.left.translationId).toBe("catholic_org");
      expect(DEFAULT_READER_STATE.left.bookCode).toBe("JHN");
      expect(DEFAULT_READER_STATE.left.chapter).toBe(3);
      expect(DEFAULT_READER_STATE.right.translationId).toBe("sigao");
      expect(DEFAULT_READER_STATE.right.bookCode).toBe("JHN");
      expect(DEFAULT_READER_STATE.right.chapter).toBe(3);
      expect(DEFAULT_READER_STATE.sync).toBe("off");
      expect(DEFAULT_READER_STATE.showHeadings).toBe(true);
      expect(DEFAULT_READER_STATE.parallel).toBe(true);
    });
  });

  describe("loadReaderState", () => {
    it("returns default state when nothing saved", () => {
      const state = loadReaderState();
      expect(state).toEqual(DEFAULT_READER_STATE);
    });

    it("returns default state when localStorage is corrupted", () => {
      mockLocalStorage.store["verbumnobis.reader"] = "invalid json";
      const state = loadReaderState();
      expect(state).toEqual(DEFAULT_READER_STATE);
    });

    it("merges saved state with defaults", () => {
      const savedState = {
        left: { translationId: "vulgate", bookCode: "GEN", chapter: 1 },
        sync: "verse"
      };
      mockLocalStorage.store["verbumnobis.reader"] = JSON.stringify(savedState);

      const state = loadReaderState();
      expect(state.left.translationId).toBe("vulgate");
      expect(state.left.bookCode).toBe("GEN");
      expect(state.left.chapter).toBe(1);
      expect(state.sync).toBe("verse");
      expect(state.right.translationId).toBe("sigao"); // from defaults
      expect(state.showHeadings).toBe(true); // from defaults
    });

    it("handles missing fields in saved state (shallow merge behavior)", () => {
      mockLocalStorage.store["verbumnobis.reader"] = JSON.stringify({ left: { bookCode: "MAT" } });
      const state = loadReaderState();
      expect(state.left.bookCode).toBe("MAT");
      // Shallow merge replaces entire left object, so translationId/chapter from saved state are used
      // Only top-level fields not in saved state get defaults
      expect(state.sync).toBe("off");
      expect(state.showHeadings).toBe(true);
    });
  });

  describe("saveReaderState", () => {
    it("saves state to localStorage", () => {
      const state: ReaderState = {
        ...DEFAULT_READER_STATE,
        left: { translationId: "vulgate", bookCode: "GEN", chapter: 1 }
      };
      saveReaderState(state);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "verbumnobis.reader",
        JSON.stringify(state)
      );
    });
  });

  describe("panelEquals", () => {
    it("returns true for identical panels", () => {
      const panel: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      expect(panelEquals(panel, panel)).toBe(true);
    });

    it("returns true for panels with same values", () => {
      const panel1: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      const panel2: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      expect(panelEquals(panel1, panel2)).toBe(true);
    });

    it("returns false for different translationId", () => {
      const panel1: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      const panel2: PanelState = { translationId: "sigao", bookCode: "JHN", chapter: 3 };
      expect(panelEquals(panel1, panel2)).toBe(false);
    });

    it("returns false for different bookCode", () => {
      const panel1: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      const panel2: PanelState = { translationId: "catholic_org", bookCode: "MAT", chapter: 3 };
      expect(panelEquals(panel1, panel2)).toBe(false);
    });

    it("returns false for different chapter", () => {
      const panel1: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 3 };
      const panel2: PanelState = { translationId: "catholic_org", bookCode: "JHN", chapter: 4 };
      expect(panelEquals(panel1, panel2)).toBe(false);
    });

    it("ignores verseFilter and passages", () => {
      const panel1: PanelState = {
        translationId: "catholic_org",
        bookCode: "JHN",
        chapter: 3,
        verseFilter: { start: 16, end: 18 },
        passages: [{ bookCode: "JHN", chapter: 3 }]
      };
      const panel2: PanelState = {
        translationId: "catholic_org",
        bookCode: "JHN",
        chapter: 3
      };
      expect(panelEquals(panel1, panel2)).toBe(true);
    });
  });
});