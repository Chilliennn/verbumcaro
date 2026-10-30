import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearch } from "../../features/search/useSearch";
import type { ReaderState } from "../../features/reader/readerTypes";
import { DEFAULT_READER_STATE } from "../../features/reader/readerStore";
import type { Book, Translation } from "../../lib/bible/repository";

const mockBooks: Book[] = [
  { code: "GEN", name: "Genesis", testament: "OT", chapters: 50 },
  { code: "JHN", name: "John", testament: "NT", chapters: 21 }
];

const mockTranslations: Translation[] = [
  {
    id: "catholic_org",
    name: "New Jerusalem Bible",
    language: "en",
    languageName: "English",
    direction: "ltr",
    hasHeadings: false,
    hasFootnotes: false
  },
  {
    id: "vulgate",
    name: "Biblia Sacra Vulgata",
    language: "la",
    languageName: "Latin",
    direction: "ltr",
    hasHeadings: false,
    hasFootnotes: false
  }
];

const mockAvailability: Record<string, string[]> = {
  catholic_org: ["GEN", "JHN"],
  vulgate: ["GEN", "JHN"]
};

describe("useSearch panel rendering logic", () => {
  it("renders English in left panel and Latin in right panel for 'gen 1 /eng lat'", async () => {
    let currentState: ReaderState = { ...DEFAULT_READER_STATE };
    const setReader = (action: React.SetStateAction<ReaderState>) => {
      currentState = typeof action === "function" ? action(currentState) : action;
    };

    const { result } = renderHook(() =>
      useSearch(currentState, setReader, mockAvailability, mockBooks, mockTranslations)
    );

    act(() => {
      result.current.setSearch("gen 1 /eng lat");
    });

    let handled = false;
    await act(async () => {
      handled = await result.current.submitSearch();
    });

    expect(handled).toBe(true);
    expect(currentState.parallel).toBe(true);
    expect(currentState.left.translationId).toBe("catholic_org"); // Left must be eng
    expect(currentState.left.bookCode).toBe("GEN");
    expect(currentState.left.chapter).toBe(1);
    expect(currentState.right.translationId).toBe("vulgate"); // Right must be lat
    expect(currentState.right.bookCode).toBe("GEN");
    expect(currentState.right.chapter).toBe(1);
  });

  it("renders Latin in left panel and English in right panel for 'gen 1 /lat eng'", async () => {
    let currentState: ReaderState = { ...DEFAULT_READER_STATE };
    const setReader = (action: React.SetStateAction<ReaderState>) => {
      currentState = typeof action === "function" ? action(currentState) : action;
    };

    const { result } = renderHook(() =>
      useSearch(currentState, setReader, mockAvailability, mockBooks, mockTranslations)
    );

    act(() => {
      result.current.setSearch("gen 1 /lat eng");
    });

    let handled = false;
    await act(async () => {
      handled = await result.current.submitSearch();
    });

    expect(handled).toBe(true);
    expect(currentState.parallel).toBe(true);
    expect(currentState.left.translationId).toBe("vulgate"); // Left is lat
    expect(currentState.right.translationId).toBe("catholic_org"); // Right is eng
  });

  it("renders John 6:35 and John 6:38 passages for search 'John 6:35, 38'", async () => {
    let currentState: ReaderState = { ...DEFAULT_READER_STATE };
    const setReader = (action: React.SetStateAction<ReaderState>) => {
      currentState = typeof action === "function" ? action(currentState) : action;
    };

    const { result } = renderHook(() =>
      useSearch(currentState, setReader, mockAvailability, mockBooks, mockTranslations)
    );

    act(() => {
      result.current.setSearch("John 6:35, 38");
    });

    let handled = false;
    await act(async () => {
      handled = await result.current.submitSearch();
    });

    expect(handled).toBe(true);
    expect(currentState.left.passages).toBeDefined();
    expect(currentState.left.passages).toHaveLength(2);
    expect(currentState.left.passages![0]).toEqual({
      bookCode: "JHN",
      chapter: 6,
      verseFilter: { start: 35, end: 35 }
    });
    expect(currentState.left.passages![1]).toEqual({
      bookCode: "JHN",
      chapter: 6,
      verseFilter: { start: 38, end: 38 }
    });
  });

  it("renders whole chapter when number ends with ':' in 'John 6:35, 7:'", async () => {
    let currentState: ReaderState = { ...DEFAULT_READER_STATE };
    const setReader = (action: React.SetStateAction<ReaderState>) => {
      currentState = typeof action === "function" ? action(currentState) : action;
    };

    const { result } = renderHook(() =>
      useSearch(currentState, setReader, mockAvailability, mockBooks, mockTranslations)
    );

    act(() => {
      result.current.setSearch("John 6:35, 7:");
    });

    let handled = false;
    await act(async () => {
      handled = await result.current.submitSearch();
    });

    expect(handled).toBe(true);
    expect(currentState.left.passages).toBeDefined();
    expect(currentState.left.passages).toHaveLength(2);
    expect(currentState.left.passages![0]).toEqual({
      bookCode: "JHN",
      chapter: 6,
      verseFilter: { start: 35, end: 35 }
    });
    expect(currentState.left.passages![1]).toEqual({
      bookCode: "JHN",
      chapter: 7,
      verseFilter: undefined
    });
  });
});

