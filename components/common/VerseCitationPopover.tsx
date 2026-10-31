import { useEffect, useRef, useState } from "react";
import { bibleRepository } from "../../lib/bible/staticRepository";
import { translations } from "../../lib/data/translations";
import { getBookName, getBookLanguageName } from "../../lib/data/book_names";
import { AppSelect } from "../ui/Select";
import type { Chapter } from "../../lib/bible/repository";

export interface CitationTarget {
  reference: string;
  bookCode: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
}

interface VerseCitationPopoverProps {
  target: CitationTarget | null;
  onClose: () => void;
  onOpenPanel: (target: CitationTarget, translationId: string) => void;
  onOpenParallel: (target: CitationTarget, leftTranslationId: string, rightTranslationId: string) => void;
}

export function VerseCitationPopover({
  target,
  onClose,
  onOpenPanel,
  onOpenParallel
}: VerseCitationPopoverProps) {
  const [selectedTranslation, setSelectedTranslation] = useState<string>("catholic_org");
  const [rightTranslation, setRightTranslation] = useState<string>("vulgate");
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedContext, setExpandedContext] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync right translation if left matches it
  useEffect(() => {
    if (selectedTranslation === rightTranslation) {
      setRightTranslation(selectedTranslation === "vulgate" ? "catholic_org" : "vulgate");
    }
  }, [selectedTranslation, rightTranslation]);

  // Fetch chapter data when target or translation changes
  useEffect(() => {
    if (!target) return;
    let isCancelled = false;
    setLoading(true);
    setExpandedContext(false);

    bibleRepository
      .getChapter(selectedTranslation, target.bookCode, target.chapter)
      .then((data) => {
        if (!isCancelled) {
          setChapterData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setChapterData(null);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [target, selectedTranslation]);

  // Close on Escape or click outside
  useEffect(() => {
    if (!target) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const currentTransMeta = translations.find((t) => t.id === selectedTranslation);
  const langKey = getBookLanguageName(currentTransMeta?.language ?? "en");
  const displayBookName = getBookName(target.bookCode, langKey);
  const verseRefLabel = `${displayBookName} ${target.chapter}:${target.verse}${
    target.verseEnd && target.verseEnd !== target.verse ? `-${target.verseEnd}` : ""
  }`;

  // Filter target verses for the preview
  const previewVerses = chapterData?.verses?.filter((v) => {
    const end = target.verseEnd ?? target.verse;
    return v.verse >= target.verse && v.verse <= end;
  }) ?? [];

  return (
    <div
      className="verse-popover-overlay open"
      onClick={(e) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verse-popover-title"
    >
      <div className="verse-popover-card" ref={cardRef}>
        {/* Header */}
        <div className="popover-header">
          <div className="popover-title-group">
            <span className="popover-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Scripture
            </span>
            <h3 className="popover-ref-title" id="verse-popover-title">
              {verseRefLabel}
            </h3>
          </div>
          <button
            className="popover-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close Scripture preview"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="popover-body">
          {/* Translation Switcher */}
          <div className="popover-translation-bar">
            <span className="translation-select-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Translation:
            </span>
            <AppSelect
              aria-label="Select translation"
              selectedKey={selectedTranslation}
              onSelectionChange={(key) => setSelectedTranslation(key)}
              options={translations.map((t) => ({
                id: t.id,
                name: `${t.name} (${t.languageName})`
              }))}
              className="popover-translation-select"
            />
          </div>

          {/* Verse Preview */}
          {loading ? (
            <div className="verse-preview-text" style={{ fontStyle: "italic", color: "var(--stone-500)" }}>
              Loading verse text...
            </div>
          ) : previewVerses.length > 0 ? (
            <div className="verse-preview-text">
              {previewVerses.map((v) => (
                <span key={v.verse} style={{ display: "block", marginBottom: previewVerses.length > 1 ? "4px" : "0" }}>
                  <span className="verse-preview-num">{v.verse}</span>
                  {v.text}
                </span>
              ))}
            </div>
          ) : (
            <div className="verse-preview-text" style={{ fontStyle: "italic", color: "var(--stone-500)" }}>
              {chapterData ? "This verse is not available in the selected translation." : "Loading passage..."}
            </div>
          )}

          {/* Toggle surrounding verses context */}
          <button
            type="button"
            className="popover-toggle-expand"
            onClick={() => setExpandedContext((prev) => !prev)}
            aria-expanded={expandedContext}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: expandedContext ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s ease"
              }}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            <span>{expandedContext ? "Hide surrounding verses" : "Read surrounding verses in chapter context"}</span>
          </button>

          {/* Expanded Chapter Context */}
          {expandedContext && chapterData && (
            <div className="expanded-context-box active">
              <div className="expanded-context-title">
                {displayBookName} {target.chapter} Context
              </div>
              <div>
                {chapterData.verses.map((v) => {
                  const end = target.verseEnd ?? target.verse;
                  const isTarget = v.verse >= target.verse && v.verse <= end;
                  return (
                    <div
                      key={v.verse}
                      className={`context-verse-line ${isTarget ? "target-verse" : ""}`}
                    >
                      <strong>{v.verse}.</strong> {v.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="popover-footer-actions">
          {/* Parallel translation selector */}
          <div className="popover-parallel-config">
            <span className="parallel-config-label">Parallel:</span>
            <AppSelect
              aria-label="Select parallel translation"
              selectedKey={rightTranslation}
              onSelectionChange={(key) => setRightTranslation(key)}
              options={translations
                .filter((t) => t.id !== selectedTranslation)
                .map((t) => ({
                  id: t.id,
                  name: t.name
                }))}
              className="popover-parallel-select"
            />
          </div>

          <div className="popover-action-buttons">
            <button
              type="button"
              className="popover-action-btn btn-secondary"
              onClick={() => onOpenParallel(target, selectedTranslation, rightTranslation)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              Open in Parallel View
            </button>
            <button
              type="button"
              className="popover-action-btn btn-primary"
              onClick={() => onOpenPanel(target, selectedTranslation)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Open in Bible Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

