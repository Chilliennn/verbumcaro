import { useSaintQuotes } from "../../features/landing/useSaintQuotes";

export function SaintQuoteWidget() {
  const { quote, shuffleQuote } = useSaintQuotes();

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-tag">Words of the Saints</span>
        <button
          className="widget-refresh-btn"
          type="button"
          onClick={shuffleQuote}
          title="Shuffle quote"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          Shuffle
        </button>
      </div>

      <p className="widget-content">"{quote.quote}"</p>
      <div className="widget-author">— {quote.author}</div>
    </div>
  );
}
