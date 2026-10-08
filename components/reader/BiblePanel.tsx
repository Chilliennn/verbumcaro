import { useEffect, useRef, useState } from "react";
import type {
  Book,
  Chapter,
  Translation
} from "../../lib/bible/repository";
import type { PanelState } from "../../features/reader/readerTypes";
import { PassageSelector } from "./PassageSelector";
import { TranslationSelector } from "./TranslationSelector";
import { ChapterReader } from "./ChapterReader";

interface BiblePanelProps {
  panel: PanelState;
  books: Book[];
  translations: Translation[];
  showHeadings: boolean;
  sync: boolean;
  parallel: boolean;
  searchQuery?: string;
  onChange: (next: PanelState) => void;
  onVerseVisible?: (verse: number) => void;
  onClose?: () => void;
}

export function BiblePanel({
  panel,
  books,
  translations,
  showHeadings,
  sync,
  parallel,
  searchQuery,
  onChange,
  onVerseVisible,
  onClose
}: BiblePanelProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [footnote, setFootnote] = useState<string | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const book =
    books.find((item) => item.code === panel.bookCode) ?? books[0];

  useEffect(() => {
    let cancelled = false;

    fetch(
      `/data/translations/${panel.translationId}/${panel.bookCode}/${panel.chapter}.json`
    )
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as Chapter;
      })
      .then((data) => {
        if (!cancelled) {
          setChapter(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChapter(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [panel]);

  useEffect(() => {
    if (!sync || !readerRef.current || !onVerseVisible) {
      return;
    }

    const scrollContainer = readerRef.current.closest(".main-content");

    if (!scrollContainer) {
      return;
    }

    const elements = readerRef.current.querySelectorAll("[data-verse]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const verse = Number(
            (visible.target as HTMLElement).dataset.verse
          );

          onVerseVisible(verse);
        }
      },
      {
        root: scrollContainer,
        threshold: [0.4, 0.7, 1]
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [chapter, sync, onVerseVisible]);

  return (
    <section className="bible-panel">
      <div className="panel-header">
          <div className="panel-head-row">
            <div className="selector-wrapper">
              <PassageSelector
                book={book}
                chapter={panel.chapter}
                books={books}
                translationLanguage={
                  translations.find((t) => t.id === panel.translationId)
                    ?.language
                }
                onChange={(bookCode, chapterNumber) =>
                  onChange({
                    ...panel,
                    bookCode,
                    chapter: chapterNumber,
                    verseFilter: undefined
                  })
                }
              />
            </div>

            {parallel && (
              <button
                className="panel-close"
                title="Close panel"
                aria-label="Close panel"
                type="button"
                onClick={onClose}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            )}
          </div>

        <div className="version-row">
          <TranslationSelector
            value={panel.translationId}
            translations={translations}
            onChange={(translationId) =>
              onChange({
                ...panel,
                translationId
              })
            }
          />
        </div>
      </div>

      <div
        ref={readerRef}
        className="chapter-scroll"
        onDoubleClick={() => {
          const selected = window.getSelection()?.toString().trim();

          if (selected) {
            // Stage 1 intentionally keeps native text selection.
            // Context/AI actions will be added in a later stage.
          }
        }}
      >
        <ChapterReader
          chapter={chapter}
          showHeadings={showHeadings}
          searchQuery={searchQuery}
          onFootnote={setFootnote}
          verseFilter={panel.verseFilter}
        />
      </div>

      {sync && (
        <button
          className="sync-helper"
          onClick={() => {
            const first = readerRef.current?.querySelector("[data-verse]");

            first?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }}
          title="Return to verse 1"
        >
          ↑
        </button>
      )}

      {footnote && (
        <div
          className="footnote-overlay"
          onClick={() => setFootnote(null)}
        >
          <div
            className="footnote-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="footnote-close"
              onClick={() => setFootnote(null)}
            >
              ×
            </button>

            <strong>Footnote</strong>
            <p>{footnote}</p>
          </div>
        </div>
      )}
    </section>
  );
}
