import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { ReaderToolbar } from "../components/layout/ReaderToolbar";
import { AppShell } from "../components/layout/AppShell";
import { ParallelReader } from "../components/reader/ParallelReader";
import { bibleRepository } from "../lib/bible/staticRepository";
import type {
  Book,
  Translation
} from "../lib/bible/repository";
import { useReader } from "../features/reader/useReader";
import { useSearch } from "../features/search/useSearch";
import { useTheme } from "../features/ui/useTheme";
import { useFontSize } from "../features/ui/useFontSize";
import { useAvailability } from "../features/data/useAvailability";
import { canon } from "../lib/data/canon";

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [fontSize, setFontSize] = useFontSize();
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const [reader, setReader] = useReader();
  const availability = useAvailability();

  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books] = useState<Book[]>(canon);

  useEffect(() => {
    bibleRepository.getTranslations().then(setTranslations);
  }, []);

  const {
    search,
    setSearch,
    searchQuery,
    searchResults,
    searchEmpty,
    searchDropdownRef,
    dismissSearch,
    submitSearch,
    clearSearch,
    navigateToResult,
    getBookName,
    getTranslationName
  } = useSearch(reader, setReader, availability, books, translations);

  function getAvailableBooks(translationId: string): Book[] {
    const availableCodes = availability[translationId];
    if (!availableCodes || availableCodes.length === 0) {
      return books;
    }
    const availableSet = new Set(availableCodes);
    return books.filter((item) => availableSet.has(item.code));
  }

  return (
    <AppShell>
      <Header
        dark={dark}
        onToggleTheme={toggleTheme}
        search={search}
        onSearchChange={(value) => { dismissSearch(); setSearch(value); }}
        onSearchSubmit={submitSearch}
        onToggleFontModal={() => setFontModalOpen((value) => !value)}
      />

      {(searchResults.length > 0 || searchEmpty) && (
        <div ref={searchDropdownRef} className="search-dropdown">
          <div className="search-results">
            <div className="search-results-header">
              <div className="search-results-title">Search Results ({searchResults.length})</div>
              <button className="search-results-clear" onClick={clearSearch} type="button">Clear</button>
              <button className="search-results-clear" onClick={dismissSearch} type="button" aria-label="Close search results">Close</button>
            </div>
            {searchResults.length > 0 ? (
              <>
                <div className="search-results-list">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.bookCode}-${result.chapter}-${result.verse}-${index}`}
                      className="search-result-item"
                      onClick={() => navigateToResult(result)}
                      type="button"
                    >
                      <span className="search-result-ref">
                        {getBookName(result.bookCode, result.translationId)} {result.chapter}:{result.verse}
                        {" · "}{getTranslationName(result.translationId)}
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
          leftAvailableBooks={getAvailableBooks(reader.left.translationId)}
          rightAvailableBooks={getAvailableBooks(reader.right.translationId)}
          onLeftChange={(panel) =>
            setReader((state) => ({ ...state, left: panel }))
          }
          onRightChange={(panel) =>
            setReader((state) => ({ ...state, right: panel }))
          }
          onSyncVerse={(verse, passageIndex) => {
            if (reader.sync !== "verse") {
              return;
            }

            const target = document.querySelector(
              `.bible-panel:nth-child(2) [data-passage-index="${passageIndex}"] [data-verse="${verse}"]`
            );

            target?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
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