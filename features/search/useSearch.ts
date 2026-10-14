import { useRef, useState, useCallback, useEffect } from "react";
import type { ReaderState, PanelState } from "../../features/reader/readerTypes";
import { parseSearchQuery, parseReference, extractLanguageModifiers } from "../../features/references/parser";
import { getBookName, getBookLanguageName } from "../../lib/data/book_names";
import { translations as supportedTranslations } from "../../lib/data/translations";
import { canon } from "../../lib/data/canon";
import { bibleRepository } from "../../lib/bible/staticRepository";
import type { Book, Translation } from "../../lib/bible/repository";

export interface SearchResultItem {
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
  translationId?: string;
}

export function useSearch(
  reader: ReaderState,
  setReader: React.Dispatch<React.SetStateAction<ReaderState>>,
  availability: Record<string, string[]>,
  books: Book[],
  translations: Translation[]
) {
  const [search, setSearch] = useState(reader.search ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchEmpty, setSearchEmpty] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchRequest = useRef(0);

  function dismissSearch() {
    searchRequest.current++;
    setSearchResults([]);
    setSearchEmpty(false);
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (!searchDropdownRef.current?.contains(target) && !target.closest(".global-search")) {
        dismissSearch();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissSearch();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function getAvailableBooks(translationId: string): Book[] {
    const availableCodes = availability[translationId];
    if (!availableCodes || availableCodes.length === 0) {
      return books;
    }
    const availableSet = new Set(availableCodes);
    return books.filter((item) => availableSet.has(item.code));
  }

  async function searchFullText(
    query: string,
    translationId: string,
    bookCodes: string[],
    request: number
  ): Promise<SearchResultItem[]> {
    const normalized = query.normalize("NFKC").toLowerCase();
    const matches: SearchResultItem[] = [];
    const fetches: Array<() => Promise<SearchResultItem[]>> = [];

    for (const bookCode of bookCodes) {
      const book = canon.find((item) => item.code === bookCode);
      if (!book) continue;

      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        fetches.push(
          () => bibleRepository
            .getChapter(translationId, bookCode, chapter)
            .then((data) => {
              if (!data) return [];
              const chapterMatches: SearchResultItem[] = [];
              for (const verse of data.verses) {
                if (verse.text.normalize("NFKC").toLowerCase().includes(normalized)) {
                  chapterMatches.push({
                    bookCode,
                    chapter,
                    verse: verse.verse,
                    text: verse.text,
                    translationId
                  });
                }
              }
              return chapterMatches;
            })
            .catch(() => [])
        );
      }
    }

    const BATCH_SIZE = 30;
    for (let i = 0; i < fetches.length; i += BATCH_SIZE) {
      if (request !== searchRequest.current) return [];
      const batch = fetches.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map((fetchChapter) => fetchChapter()));
      for (const chapterMatches of results) {
        matches.push(...chapterMatches);
      }
    }
    return matches;
  }

  const submitSearch = useCallback(async (): Promise<boolean> => {
    const request = ++searchRequest.current;
    setSearchResults([]);
    setSearchEmpty(false);

    const trimmed = search.trim();
    if (!trimmed) {
      setSearchQuery("");
      setSearchResults([]);
      return false;
    }

    const results = parseSearchQuery(trimmed);
    if (results.length > 0) {
      const passages = results.map((result) => ({
        bookCode: result.panel.bookCode,
        chapter: result.panel.chapter,
        verseFilter: result.verse === undefined ? undefined : {
          start: result.verse,
          end: result.verseEnd ?? result.verse
        }
      }));

      const explicitTranslationId = results.find((result) => result.translationId)?.translationId;
      const rightTranslationId = results.find((result) => result.rightTranslationId)?.rightTranslationId;

      setReader((state) => ({
        ...state,
        search: trimmed,
        parallel: rightTranslationId ? true : state.parallel,
        left: {
          ...passages[0],
          translationId: explicitTranslationId ?? state.left.translationId,
          passages
        },
        right: {
          ...passages[0],
          translationId: rightTranslationId ?? state.right.translationId,
          passages
        }
      }));

      setSearchResults([]);
      setSearchEmpty(false);
      setSearchQuery("");
      return true;
    }

    const referenceResult = parseReference(trimmed);
    if (referenceResult) {
      const verseFilter =
        referenceResult.verse !== undefined
          ? { start: referenceResult.verse, end: referenceResult.verse }
          : undefined;

      setReader((state) => {
        const leftTranslationId = referenceResult.translationId ?? state.left.translationId;
        const rightTranslationId = referenceResult.rightTranslationId
          ?? (referenceResult.translationId
            ? (referenceResult.translationId === "catholic_org" ? "sigao" : "catholic_org")
            : state.right.translationId);

        const baseLeft: PanelState = {
          translationId: leftTranslationId,
          bookCode: referenceResult.panel.bookCode,
          chapter: referenceResult.panel.chapter
        };
        const nextLeft = verseFilter
          ? { ...baseLeft, verseFilter }
          : { ...baseLeft, verseFilter: undefined };

        const baseRight: PanelState = {
          translationId: rightTranslationId,
          bookCode: referenceResult.panel.bookCode,
          chapter: referenceResult.panel.chapter
        };
        const nextRight = verseFilter
          ? { ...baseRight, verseFilter }
          : { ...baseRight, verseFilter: undefined };

        return {
          ...state,
          search: trimmed,
          parallel: referenceResult.rightTranslationId ? true : state.parallel,
          left: nextLeft,
          right: nextRight
        };
      });

      setSearchResults([]);
      setSearchEmpty(false);
      setSearchQuery("");
      return true;
    }

    const { reference: textQuery, translationId } = extractLanguageModifiers(trimmed);
    if (!textQuery) return false;

    const searchTranslations = translationId
      ? supportedTranslations.filter((translation) => translation.id === translationId)
      : supportedTranslations;

    const matches: SearchResultItem[] = [];
    for (const translation of searchTranslations) {
      if (request !== searchRequest.current) return false;
      matches.push(...await searchFullText(
        textQuery, translation.id,
        getAvailableBooks(translation.id).map((book) => book.code), request
      ));
    }

    if (request !== searchRequest.current) return false;
    setSearchResults(matches);
    setSearchEmpty(matches.length === 0);
    setSearchQuery("");
    return false;
  }, [search, setReader, availability, books, translations]);

  function clearSearch() {
    dismissSearch();
    setSearch("");
    setReader((state) => ({ ...state, search: "" }));
    setSearchQuery("");
    setSearchResults([]);
    setSearchEmpty(false);
  }

  function navigateToResult(result: SearchResultItem) {
    setReader((state) => ({
      ...state,
      search,
      left: {
        translationId: result.translationId ?? state.left.translationId,
        bookCode: result.bookCode,
        chapter: result.chapter,
        verseFilter: { start: result.verse, end: result.verse }
      },
      right: {
        translationId: state.right.translationId,
        bookCode: result.bookCode,
        chapter: result.chapter,
        verseFilter: { start: result.verse, end: result.verse }
      }
    }));
    setSearchResults([]);
    setSearchQuery("");
  }

  return {
    search,
    setSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchEmpty,
    searchDropdownRef,
    dismissSearch,
    submitSearch,
    clearSearch,
    navigateToResult,
    getBookName: (bookCode: string, translationId?: string) => {
      const translation = translations.find((t) => t.id === translationId);
      const language = translation ? getBookLanguageName(translation.language) : "en";
      return getBookName(bookCode, language);
    },
    getTranslationName: (translationId?: string) => {
      return supportedTranslations.find((translation) => translation.id === translationId)?.name;
    }
  };
}
