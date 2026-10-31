import { useMemo } from "react";
import { useVerseOfDay } from "../../features/landing/useVerseOfDay";
import { extractScriptureCitation } from "../../features/references/parser";
import type { CitationTarget } from "../common/VerseCitationPopover";

interface VerseOfDayWidgetProps {
  onSelectCitation?: (target: CitationTarget) => void;
}

export function VerseOfDayWidget({ onSelectCitation }: VerseOfDayWidgetProps) {
  const { verse, shuffleVerse } = useVerseOfDay();

  const citationTarget = useMemo<CitationTarget | null>(() => {
    if (!verse.reference) return null;
    const extracted = extractScriptureCitation(verse.reference);
    if (!extracted) return null;
    return {
      reference: extracted.reference,
      bookCode: extracted.parsed.panel.bookCode,
      chapter: extracted.parsed.panel.chapter,
      verse: extracted.parsed.verse ?? 1,
      verseEnd: extracted.parsed.verseEnd
    };
  }, [verse.reference]);

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-tag">Verse of the Day</span>
        <button
          className="widget-refresh-btn"
          type="button"
          onClick={shuffleVerse}
          title="Next verse"
          aria-label="Next verse"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          Shuffle
        </button>
      </div>
      <p className="widget-content">&ldquo;{verse.english}&rdquo;</p>
      <div className="widget-author">
        {citationTarget && onSelectCitation ? (
          <button
            type="button"
            className="verse-citation-link"
            onClick={() => onSelectCitation(citationTarget)}
            title={`Preview ${verse.reference}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{verse.reference}</span>
          </button>
        ) : (
          verse.reference
        )}
      </div>
    </div>
  );
}
