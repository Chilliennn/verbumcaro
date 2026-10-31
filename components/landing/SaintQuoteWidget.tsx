import { useState, useRef, useEffect } from "react";
import { useSaintQuotes } from "../../features/landing/useSaintQuotes";

export function SaintQuoteWidget() {
  const { quote, shuffleQuote } = useSaintQuotes();
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleShuffle() {
    setShowPreview(false);
    shuffleQuote();
  }

  function handleMouseEnter() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (quote.preview) setShowPreview(true);
    }, 250);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 200);
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div className="widget-card saint-widget-card">
      <div className="widget-header">
        <span className="widget-tag">Words of the Saints</span>
        <button
          className="widget-refresh-btn"
          type="button"
          onClick={handleShuffle}
          title="Shuffle quote"
          aria-label="Shuffle quote"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          Shuffle
        </button>
      </div>

      <p className="widget-content">&ldquo;{quote.quote}&rdquo;</p>

      <div
        className="widget-author-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="widget-author">
          &mdash;{" "}
          {quote.link ? (
            <a
              href={quote.link}
              target="_blank"
              rel="noopener noreferrer"
              className="saint-author-link"
              title="Click to read saint's story"
            >
              <span>{quote.author}</span>
              <svg
                className="saint-link-icon"
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : (
            <span>{quote.author}</span>
          )}

          {quote.preview && (
            <button
              type="button"
              className="saint-preview-trigger"
              onClick={() => setShowPreview((prev) => !prev)}
              title="Toggle saint story preview"
              aria-label={`Story preview for ${quote.author}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          )}
        </div>

        {showPreview && quote.preview && (
          <div className="saint-preview-popover" role="tooltip">
            <div className="saint-preview-header">
              <span className="saint-preview-name">{quote.author}</span>
              <button
                type="button"
                className="saint-preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                &times;
              </button>
            </div>
            <p className="saint-preview-text">{quote.preview}</p>
            {quote.link && (
              <a
                href={quote.link}
                target="_blank"
                rel="noopener noreferrer"
                className="saint-preview-action"
              >
                <span>Read Saint&apos;s Story</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
