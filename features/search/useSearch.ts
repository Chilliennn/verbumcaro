import { useRef, useState, useCallback, useEffect } from "react";
import type { ReaderState, PanelState } from "../../features/reader/readerTypes";
import { parseSearchQuery, parseReference, extractLanguageModifiers } from "../../features/references/parser";
import { getBookName, getBookLanguageName } from "../../lib/data/book_names";
import { translations as supportedTranslations } from "../../lib/data/translations";
import type { Book, Translation } from "../../lib/bible/repository";

export interface SearchResultItem {
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
  translationId?: string;
}

interface SearchIndexVerse extends SearchResultItem {
  translationId: string;
}

interface SearchIndex {
  version: number;
  translationId: string;
  verses: SearchIndexVerse[];
  postings: Record<string, number[]>;
}

const searchIndexCache = new Map<string, Promise<SearchIndex | null>>();

function loadSearchIndex(translationId: string): Promise<SearchIndex | null> {
  const cached = searchIndexCache.get(translationId);
  if (cached) return cached;

  const request = fetch(
    `${import.meta.env.BASE_URL}data/search/${translationId}.json`
  )
    .then(async (response) => {
      if (!response.ok) return null;
      return await response.json() as SearchIndex;
    })
    .catch(() => null);
  searchIndexCache.set(translationId, request);
  return request;
}

function normalizeSearchText(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

function getSearchTokens(text: string): string[] {
  return [...new Set(normalizeSearchText(text).match(/[\p{L}\p{N}]+/gu) ?? [])];
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
    if (request !== searchRequest.current) return [];

    const index = await loadSearchIndex(translationId);
    if (!index || request !== searchRequest.current) return [];

    const normalized = normalizeSearchText(query);
    const availableBooks = new Set(bookCodes);
    let candidateIds: Set<number> | undefined;
    const queryTokens = getSearchTokens(normalized);

    for (const queryToken of queryTokens) {
      const tokenMatches = Object.entries(index.postings)
        .filter(([token]) => token.includes(queryToken))
        .flatMap(([, ids]) => ids);
      const tokenIds = new Set(tokenMatches);

      if (!candidateIds) {
        candidateIds = tokenIds;
      } else {
        candidateIds = new Set(
          [...candidateIds].filter((id) => tokenIds.has(id))
        );
      }

      if (candidateIds.size === 0) return [];
    }

    return [...(candidateIds ?? [])]
      .sort((left, right) => left - right)
      .map((id) => index.verses[id])
      .filter((verse) =>
        availableBooks.has(verse.bookCode) &&
        normalizeSearchText(verse.text).includes(normalized)
      )
      .slice(0, 200);
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
