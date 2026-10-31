import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { ReaderToolbar } from "../components/layout/ReaderToolbar";
import { AppShell } from "../components/layout/AppShell";
import { ParallelReader } from "../components/reader/ParallelReader";
import { LandingView } from "../components/landing/LandingView";
import { FontSettingsModal } from "../components/modals/FontSettingsModal";
import { SearchGuideModal } from "../components/modals/SearchGuideModal";
import { HubModal } from "../components/modals/HubModal";
import { VerseCitationPopover, type CitationTarget } from "../components/common/VerseCitationPopover";
import { MobileDrawer } from "../components/layout/MobileDrawer";
import { useMobileDrawer } from "../hooks/useMobileDrawer";
import { bibleRepository } from "../lib/bible/staticRepository";
import type { Book, Translation } from "../lib/bible/repository";
import { useReader } from "../features/reader/useReader";
import { useSearch } from "../features/search/useSearch";
import { useTheme } from "../features/ui/useTheme";
import { useFontSize } from "../features/ui/useFontSize";
import { useAvailability } from "../features/data/useAvailability";
import { useLandingPage } from "../features/landing/useLandingPage";
import { canon } from "../lib/data/canon";

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [fontSize, setFontSize] = useFontSize();
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [citationTarget, setCitationTarget] = useState<CitationTarget | null>(null);
  const [reader, setReader] = useReader();
  const availability = useAvailability();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books] = useState<Book[]>(canon);

  const {
    isOpen: isDrawerOpen,
    open: openDrawer,
    close: closeDrawer
  } = useMobileDrawer(false);

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

  const { isLanding, setIsLanding, navigateHome } = useLandingPage();

  function getAvailableBooks(translationId: string): Book[] {
    const availableCodes = availability[translationId];
    if (!availableCodes || availableCodes.length === 0) {
      return books;
    }
    const availableSet = new Set(availableCodes);
    return books.filter((item) => availableSet.has(item.code));
  }

  function handleSelectResult(result: Parameters<typeof navigateToResult>[0]) {
    setIsLanding(false);
    navigateToResult(result);
  }

  function handleReadScripture() {
    setReader((state) => ({
      ...state,
      parallel: true,
      left: {
        translationId: "catholic_org",
        bookCode: "GEN",
        chapter: 1,
        verseFilter: undefined
      },
      right: {
        translationId: "sigao",
        bookCode: "GEN",
        chapter: 1,
        verseFilter: undefined
      }
    }));
    setIsLanding(false);
  }

  function handleOpenCitationPanel(target: CitationTarget, translationId: string) {
    setCitationTarget(null);
    const verseFilter = {
      start: target.verse,
      end: target.verseEnd ?? target.verse
    };
    setReader((state) => ({
      ...state,
      parallel: false,
      left: {
        ...state.left,
        translationId,
        bookCode: target.bookCode,
        chapter: target.chapter,
        verseFilter
      }
    }));
    setIsLanding(false);
  }

  function handleOpenCitationParallel(
    target: CitationTarget,
    leftTranslationId: string,
    rightTranslationId: string
  ) {
    setCitationTarget(null);
    const verseFilter = {
      start: target.verse,
      end: target.verseEnd ?? target.verse
    };
    setReader((state) => ({
      ...state,
      parallel: true,
      left: {
        ...state.left,
        translationId: leftTranslationId,
        bookCode: target.bookCode,
        chapter: target.chapter,
        verseFilter
      },
      right: {
        ...state.right,
        translationId: rightTranslationId,
        bookCode: target.bookCode,
        chapter: target.chapter,
        verseFilter
      }
    }));
    setIsLanding(false);
  }

  return (
    <AppShell>
      <Header
        dark={dark}
        onToggleTheme={toggleTheme}
        search={search}
        onSearchChange={(value) => {
          dismissSearch();
          setSearch(value);
        }}
        onSearchSubmit={async () => {
          const directMatch = await submitSearch();
          if (directMatch) {
            setIsLanding(false);
          }
        }}
        onToggleFontModal={() => setFontModalOpen((prev) => !prev)}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenHubModal={() => setHubModalOpen(true)}
        onNavigateHome={navigateHome}
        onOpenDrawer={openDrawer}
      />

      {(searchResults.length > 0 || searchEmpty) && (
        <div ref={searchDropdownRef} className="search-dropdown">
          <div className="search-results">
            <div className="search-results-header">
              <div className="search-results-title">Search Results ({searchResults.length})</div>
              <div className="search-results-actions">
                <button className="search-results-clear" onClick={clearSearch} type="button">Clear</button>
                <button className="search-results-clear" onClick={dismissSearch} type="button" aria-label="Close search results">Close</button>
              </div>
            </div>
            {searchResults.length > 0 ? (
              <div className="search-results-list">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.bookCode}-${result.chapter}-${result.verse}-${index}`}
                    className="search-result-item"
                    onClick={() => handleSelectResult(result)}
                    type="button"
                  >
                    <span className="search-result-ref">
                      {getBookName(result.bookCode, result.translationId)} {result.chapter}:{result.verse}
                      {"   "}{getTranslationName(result.translationId)}
                    </span>
                    <span className="search-result-text">{result.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="search-empty">No matches found.</div>
            )}
          </div>
        </div>
      )}

      {isLanding ? (
        <LandingView
          onReadScripture={handleReadScripture}
          onSelectCitation={setCitationTarget}
        />
      ) : (
        <main className={`main-content ${reader.sync === "verse" ? "scroll-sync" : ""}`}>
          <ReaderToolbar
            onNavigateHome={navigateHome}
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
              if (reader.sync !== "verse") return;
              const target = document.querySelector(
                `.bible-panel:nth-child(2) [data-passage-index="${passageIndex}"] [data-verse="${verse}"]`
              );
              const scrollContainer = target?.closest(
                ".chapter-scroll"
              ) as HTMLElement | null;
              if (!target || !scrollContainer) return;

              const targetRect = target.getBoundingClientRect();
              const containerRect = scrollContainer.getBoundingClientRect();
              const offset =
                targetRect.top -
                containerRect.top -
                (scrollContainer.clientHeight - targetRect.height) / 2;

              scrollContainer.scrollBy({ top: offset, behavior: "smooth" });
            }}
            onClose={() =>
              setReader((state) => ({
                ...state,
                parallel: false
              }))
            }
          />
        </main>
      )}

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        dark={dark}
        onToggleTheme={toggleTheme}
        onOpenFontModal={() => setFontModalOpen(true)}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenHubModal={() => setHubModalOpen(true)}
      />

      <FontSettingsModal
        isOpen={fontModalOpen}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onClose={() => setFontModalOpen(false)}
      />
      <SearchGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
      <HubModal
        isOpen={hubModalOpen}
        onClose={() => setHubModalOpen(false)}
      />
      <VerseCitationPopover
        target={citationTarget}
        onClose={() => setCitationTarget(null)}
        onOpenPanel={handleOpenCitationPanel}
        onOpenParallel={handleOpenCitationParallel}
      />
    </AppShell>
  );
}
