import { useVerseOfDay } from "../../features/landing/useVerseOfDay";

export function VerseOfDayWidget() {
  const { verse, shuffleVerse } = useVerseOfDay();

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
      <div className="widget-author">{verse.reference}</div>
    </div>
  );
}
