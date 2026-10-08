import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { ReaderToolbar } from "../components/layout/ReaderToolbar";
import { AppShell } from "../components/layout/AppShell";
import { ParallelReader } from "../components/reader/ParallelReader";
import { bibleRepository } from "../lib/bible/staticRepository";
import type {
  Book,
  Chapter,
  Translation
} from "../lib/bible/repository";
import {
  DEFAULT_READER_STATE,
  loadReaderState,
  saveReaderState
} from "../features/reader/readerStore";
import type {
  PanelState,
  ReaderState
} from "../features/reader/readerTypes";
import { parseSearchQuery, parseReference } from "../features/references/parser";
import { canon } from "../lib/data/canon";

const FONT_SIZE_KEY = "verbumcaro.fontSize";
const DEFAULT_FONT_SIZE = 18;

function getUrlState(): Partial<ReaderState> {
  const params = new URLSearchParams(window.location.search);

  function parsePanel(value: string | null): PanelState | null {
    if (!value) {
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

  const left = parsePanel(params.get("left"));
  const right = parsePanel(params.get("right"));

  return {
    ...(left ? { left } : {}),
    ...(right ? { right } : {})
  };
}

function updateUrl(state: ReaderState) {
  const params = new URLSearchParams();

  params.set(
    "left",
    `${state.left.translationId}:${state.left.bookCode}:${state.left.chapter}`
  );

  params.set(
    "right",
    `${state.right.translationId}:${state.right.bookCode}:${state.right.chapter}`
  );

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

type AvailabilityMap = Record<string, string[]>;

export default function App() {
  const [dark, setDark] = useState(
    localStorage.getItem("verbumcaro.theme") === "dark"
  );

  const [reader, setReader] = useState<ReaderState>(() => ({
    ...DEFAULT_READER_STATE,
    ...loadReaderState(),
    ...getUrlState()
  }));

  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>(canon);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      bookCode: string;
      chapter: number;
      verse: number;
      text: string;
      translationId?: string;
    }>
  >([]);
  const [searchEmpty, setSearchEmpty] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  });
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [highlightVerse, setHighlightVerse] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reader-font-size",
      `${fontSize}px`
    );
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    bibleRepository.getTranslations().then(setTranslations);
    bibleRepository.getBooks("catholic_org").then(setBooks);

    fetch("/data/availability.json")
      .then(async (response) => {
        if (!response.ok) {
          return {};
        }

        return (await response.json()) as AvailabilityMap;
      })
      .then(setAvailability)
      .catch(() => {
        setAvailability({});
      });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("verbumcaro.theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    saveReaderState(reader);
    updateUrl(reader);
  }, [reader]);

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
    bookCodes: string[]
  ): Promise<
    Array<{
      bookCode: string;
      chapter: number;
      verse: number;
      text: string;
      translationId?: string;
    }>
  > {
    const normalized = query.toLowerCase();
    const matches: Array<{
      bookCode: string;
      chapter: number;
      verse: number;
      text: string;
      translationId?: string;
    }> = [];

    const fetches: Promise<
      Array<{
        bookCode: string;
        chapter: number;
        verse: number;
        text: string;
        translationId?: string;
      }>
    >[] = [];

    for (const bookCode of bookCodes) {
      const book = canon.find((item) => item.code === bookCode);

      if (!book) {
        continue;
      }

      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        fetches.push(
          bibleRepository
            .getChapter(translationId, bookCode, chapter)
            .then((data) => {
              if (!data) {
                return [];
              }

              const chapterMatches: typeof matches = [];

              for (const verse of data.verses) {
                if (verse.text.toLowerCase().includes(normalized)) {
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
      const batch = fetches.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch);

      for (const chapterMatches of results) {
        matches.push(...chapterMatches);
      }
    }

    return matches;
  }

  async function submitSearch() {
    const trimmed = search.trim();

    if (!trimmed) {
      setSearchQuery("");
      setSearchResults([]);
      setHighlightVerse(null);
      return;
    }

    const results = parseSearchQuery(trimmed);

    if (results.length > 0) {
      const exactRefs = results.filter((r) => r.verse !== undefined);
      const chapterRefs = results.filter((r) => r.verse === undefined);

      if (exactRefs.length === 1 && chapterRefs.length === 0) {
        const result = exactRefs[0];
        const translationId = result.translationId ?? "catholic_org";

        setReader((state) => {
          const verseFilter =
            result.verse !== undefined
              ? { start: result.verse, end: result.verseEnd ?? result.verse }
              : undefined;

          const nextLeft = {
            ...result.panel,
            translationId,
            verseFilter
          };

          const nextRight =
            result.translationId !== undefined
              ? {
                  ...result.panel,
                  translationId:
                    result.translationId === "catholic_org"
                      ? "sigao"
                      : "catholic_org",
                  verseFilter
                }
              : state.right.bookCode === result.panel.bookCode &&
                state.right.chapter === result.panel.chapter
                ? { ...state.right, verseFilter }
                : state.right;

          return {
            ...state,
            left: nextLeft,
            right: nextRight
          };
        });

        setHighlightVerse(result.verse ?? null);
        setSearchResults([]);
        setSearchEmpty(false);
        setSearchQuery("");
      } else if (exactRefs.length > 0 || chapterRefs.length > 0) {
        const verses: Array<{
          bookCode: string;
          chapter: number;
          verse: number;
          text: string;
          translationId?: string;
        }> = [];

        for (const result of results) {
          const translationId = result.translationId ?? "catholic_org";

          try {
            const response = await fetch(
              `/data/translations/${translationId}/${result.panel.bookCode}/${result.panel.chapter}.json`
            );

            if (!response.ok) {
              continue;
            }

            const data = (await response.json()) as Chapter;

            if (result.verse !== undefined) {
              const verseEnd = result.verseEnd ?? result.verse;

              for (let v = result.verse; v <= verseEnd; v++) {
                const found = data.verses.find((item) => item.verse === v);

                if (found) {
                  verses.push({
                    bookCode: result.panel.bookCode,
                    chapter: result.panel.chapter,
                    verse: v,
                    text: found.text,
                    translationId
                  });
                }
              }
            } else {
              for (const v of data.verses) {
                verses.push({
                  bookCode: result.panel.bookCode,
                  chapter: result.panel.chapter,
                  verse: v.verse,
                  text: v.text,
                  translationId
                });
              }
            }
          } catch {
            // skip unavailable chapters
          }
        }

        setSearchResults(verses);
        setSearchEmpty(verses.length === 0);
        setSearchQuery("");
        setHighlightVerse(null);
      }
    } else {
      const referenceResult = parseReference(trimmed);

      if (referenceResult) {
        setReader((state) => {
          const baseLeft = referenceResult.translationId
            ? { ...referenceResult.panel }
            : { ...state.left, ...referenceResult.panel };

          const nextLeft =
            referenceResult.verse !== undefined
              ? { ...baseLeft, verseFilter: { start: referenceResult.verse, end: referenceResult.verse } }
              : baseLeft;

          const baseRight = referenceResult.translationId
            ? {
                ...referenceResult.panel,
                translationId:
                  referenceResult.translationId === "catholic_org"
                    ? "sigao"
                    : "catholic_org"
              }
            : {
                ...state.right,
                bookCode: referenceResult.panel.bookCode,
                chapter: referenceResult.panel.chapter
              };

          const nextRight =
            referenceResult.verse !== undefined
              ? { ...baseRight, verseFilter: { start: referenceResult.verse, end: referenceResult.verse } }
              : baseRight;

          return {
            ...state,
            left: nextLeft,
            right: nextRight
          };
        });

        setHighlightVerse(referenceResult.verse ?? null);
        setSearchResults([]);
        setSearchEmpty(false);
        setSearchQuery("");
      } else {
        const availableBookCodes = getAvailableBooks(reader.left.translationId).map(
          (book) => book.code
        );
        const matches = await searchFullText(
          trimmed,
          reader.left.translationId,
          availableBookCodes
        );

        setSearchResults(matches);
        setSearchEmpty(matches.length === 0);
        setSearchQuery("");
        setHighlightVerse(null);
      }
    }

    setSearch("");
  }

  function clearSearch() {
    setSearch("");
    setSearchQuery("");
    setSearchResults([]);
    setSearchEmpty(false);
    setHighlightVerse(null);
  }

  function navigateToResult(result: {
    bookCode: string;
    chapter: number;
    verse: number;
    translationId?: string;
  }) {
    setReader((state) => ({
      ...state,
      left: {
        translationId: result.translationId ?? state.left.translationId,
        bookCode: result.bookCode,
        chapter: result.chapter,
        verseFilter: { start: result.verse, end: result.verse }
      },
      right: {
        ...state.right,
        bookCode: result.bookCode,
        chapter: result.chapter,
        verseFilter: { start: result.verse, end: result.verse }
      }
    }));

    setHighlightVerse(result.verse);
    setSearchResults([]);
    setSearchQuery("");
    setSearch("");
  }

  return (
    <AppShell>
      <Header
        dark={dark}
        onToggleTheme={() => setDark((value) => !value)}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        onToggleFontModal={() => setFontModalOpen((value) => !value)}
      />

      {(searchResults.length > 0 || searchEmpty) && (
        <div className="search-dropdown">
          <div className="search-results">
            {searchResults.length > 0 ? (
              <>
                <div className="search-results-header">
                  <div className="search-results-title">
                    Search Results ({searchResults.length})
                  </div>
                  <button
                    className="search-results-clear"
                    onClick={clearSearch}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
                <div className="search-results-list">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.bookCode}-${result.chapter}-${result.verse}-${index}`}
                      className="search-result-item"
                      onClick={() => navigateToResult(result)}
                      type="button"
                    >
                      <span className="search-result-ref">
                        {result.bookCode} {result.chapter}:{result.verse}
                      </span>
                      <span className="search-result-text">{result.text}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="search-empty">No matches found.</div>
            )}
          </div>
        </div>
      )}

      <main
        className={`main-content ${reader.sync === "verse" ? "scroll-sync" : ""}`}
      >
        <ReaderToolbar
          sync={reader.sync === "verse"}
          parallel={reader.parallel}
          showHeadings={reader.showHeadings}
          onSync={() =>
            setReader((state) => ({
              ...state,
              sync: state.sync === "off" ? "verse" : "off"
            }))
          }
          onParallel={() =>
            setReader((state) => ({
              ...state,
              parallel: !state.parallel
            }))
          }
          onHeadings={() =>
            setReader((state) => ({
              ...state,
              showHeadings: !state.showHeadings
            }))
          }
        />

        <ParallelReader
          left={reader.left}
          right={reader.right}
          books={books}
          translations={translations}
          showHeadings={reader.showHeadings}
          sync={reader.sync === "verse"}
          parallel={reader.parallel}
          searchQuery={searchQuery}
          highlightVerse={highlightVerse}
          leftAvailableBooks={getAvailableBooks(reader.left.translationId)}
          rightAvailableBooks={getAvailableBooks(reader.right.translationId)}
          onLeftChange={(panel) =>
            setReader((state) => ({ ...state, left: panel }))
          }
          onRightChange={(panel) =>
            setReader((state) => ({ ...state, right: panel }))
          }
          onSyncVerse={(verse) => {
            if (reader.sync !== "verse") {
              return;
            }

            const target = document.querySelector(
              `.bible-panel:nth-child(2) [data-verse="${verse}"]`
            );

            target?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }}
          onHighlightVerse={(verse) => {
            setHighlightVerse(verse);
          }}
          onClose={() =>
            setReader((state) => ({
              ...state,
              parallel: false
            }))
          }
        />
      </main>

      {fontModalOpen && (
        <div
          className="font-modal-backdrop"
          onClick={() => setFontModalOpen(false)}
        >
          <div
            className="font-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="font-modal-header">
              <div className="font-modal-title">Font Size</div>
              <button
                className="font-modal-close"
                onClick={() => setFontModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="font-preview">
              <span style={{ fontSize: 14 }}>Aa</span>
              <span style={{ fontSize: 28 }}>Aa</span>
            </div>

            <input
              type="range"
              className="font-slider"
              min="14"
              max="28"
              step="1"
              value={fontSize}
              onChange={(event) =>
                setFontSize(Number(event.target.value))
              }
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
