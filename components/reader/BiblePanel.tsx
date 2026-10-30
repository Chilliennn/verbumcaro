import { useEffect, useRef, useState } from "react";
import { getBookLanguageName, getBookName } from "../../lib/data/book_names";
import type {
  Book,
  Chapter,
  Translation
} from "../../lib/bible/repository";
import type { PanelState } from "../../features/reader/readerTypes";
import { PassageSelector } from "./PassageSelector";
import { TranslationSelector } from "./TranslationSelector";
import { ChapterReader } from "./ChapterReader";
import { JapaneseLookupPopover } from "./JapaneseLookupPopover";
import { LatinLookupPopover } from "./LatinLookupPopover";
import { japaneseDebug } from "../../features/japanese/debug";
import { latinDebug } from "../../features/latin/debug";

interface BiblePanelProps {
  panel: PanelState;
  books: Book[];
  translations: Translation[];
  showHeadings: boolean;
  sync: boolean;
  parallel: boolean;
  searchQuery?: string;
  onChange: (next: PanelState) => void;
  onVerseVisible?: (verse: number, passageIndex: number) => void;
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
  const [chapters, setChapters] = useState<Array<Chapter | null>>([]);
  const passages = panel.passages ?? [panel];
  const [footnote, setFootnote] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<{ text: string; top: number; left: number } | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const translation = translations.find((t) => t.id === panel.translationId);
  const bookLanguage = translation
    ? getBookLanguageName(translation.language)
    : "en";
  const isJapanese = translation?.language === "ja";
  const isLatin = translation?.language === "la";

  useEffect(() => {
    japaneseDebug("BiblePanel gate evaluated", { isJapanese, translation: translation?.id });
    latinDebug("BiblePanel gate evaluated", { isLatin, translation: translation?.id });
    if (!isJapanese && !isLatin) {
      setSelectedText(null);
      return;
    }

    function handleMouseUp(event: MouseEvent) {
      // Only care about left-button releases.
      if (event.button !== 0) return;

      // Defer one tick so the browser finishes committing the selection.
      setTimeout(() => {
        const reader = readerRef.current;
        if (!reader) return;

        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? "";
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        if (isJapanese) {
          japaneseDebug("Mouse up event", {
            text,
            insideReader: Boolean(range && reader.contains(range.commonAncestorContainer)),
            commonAncestor: range?.commonAncestorContainer.nodeName ?? null
          });
        }
        if (isLatin) {
          latinDebug("Mouse up event", {
            text,
            insideReader: Boolean(range && reader.contains(range.commonAncestorContainer)),
            commonAncestor: range?.commonAncestorContainer.nodeName ?? null
          });
        }
        if (!text || !range || !reader.contains(range.commonAncestorContainer)) {
          if (isJapanese) {
            japaneseDebug("Selection ignored", { reason: "empty or outside Japanese reader" });
          }
          if (isLatin) {
            latinDebug("Selection ignored", { reason: "empty or outside Latin reader" });
          }
          return;
        }
        const rect = range.getBoundingClientRect();
        if (isJapanese) {
          japaneseDebug("Selection accepted", { text, top: rect.bottom, left: rect.left });
        }
        if (isLatin) {
          latinDebug("Selection accepted", { text, top: rect.bottom, left: rect.left });
        }
        setSelectedText({ text, top: rect.bottom, left: rect.left });
      }, 0);
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [isJapanese, isLatin]);

  useEffect(() => {
    let cancelled = false;
    setChapters([]);
    Promise.all((panel.passages ?? [panel]).map(async (passage) => {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/translations/${panel.translationId}/${passage.bookCode}/${passage.chapter}.json`
        );
        return response.ok ? await response.json() as Chapter : null;
      } catch {
        return null;
      }
    })).then((data) => {
      if (!cancelled) setChapters(data);
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
          const passageIndex = Number((visible.target as HTMLElement).closest("[data-passage-index]")?.getAttribute("data-passage-index") ?? 0);
          onVerseVisible(verse, passageIndex);
        }
      },
      {
        root: scrollContainer,
        threshold: [0.4, 0.7, 1]
      }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [chapters, sync, onVerseVisible]);

  return (
    <section className="bible-panel">
      <div ref={readerRef} className="chapter-scroll passage-list">
        {passages.map((passage, index) => {
          const book = books.find((item) => item.code === passage.bookCode);
          const displayBookName = getBookName(passage.bookCode, bookLanguage);
          return (
            <section className="passage-section" data-passage-index={index} key={`${passage.bookCode}-${passage.chapter}-${index}`}>
              <div className="panel-header">
                <div className="panel-head-row">
                  <div className="selector-wrapper">
                    {book ? (
                      <PassageSelector
                        book={book}
                        chapter={passage.chapter}
                        verseFilter={passage.verseFilter}
                        books={books}
                        translationLanguage={translation?.language}
                        onChange={(bookCode, chapter) => onChange({
                          translationId: panel.translationId, bookCode, chapter
                        })}
                      />
                    ) : (
                      <strong>{displayBookName} {passage.chapter}</strong>
                    )}
                  </div>
                  {parallel && onClose && (
                    <button
                      className="panel-close"
                      title="Close panel"
                      aria-label="Close panel"
                      type="button"
                      onClick={onClose}
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="version-row">
                  <TranslationSelector
                    value={panel.translationId}
                    translations={translations}
                    onChange={(translationId) => onChange({ ...panel, translationId })}
                  />
                </div>
              </div>
              <div className="passage-content">
                {chapters.length === 0 ? (
                  <div className="empty-chapter">Loading passage</div>
                ) : (
                  <ChapterReader
                    chapter={chapters[index] ?? null}
                    showHeadings={showHeadings}
                    searchQuery={searchQuery}
                    onFootnote={setFootnote}
                    verseFilter={passage.verseFilter}
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>
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
              aria-label="Close footnote"
            >
              &times;
            </button>
            <strong>Footnote</strong>
            <p>{footnote}</p>
          </div>
        </div>
      )}
      {isJapanese && selectedText && (
        <JapaneseLookupPopover
          text={selectedText.text}
          anchor={selectedText}
          onClose={() => {
            setSelectedText(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
      {isLatin && selectedText && (
        <LatinLookupPopover
          text={selectedText.text}
          anchor={selectedText}
          onClose={() => {
            setSelectedText(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </section>
  );
}
