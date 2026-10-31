interface ReaderToolbarProps {
  sync: boolean;
  parallel: boolean;
  showHeadings: boolean;
  onSync: () => void;
  onParallel: () => void;
  onHeadings: () => void;
  onNavigateHome?: () => void;
}

export function ReaderToolbar({
  sync,
  parallel,
  showHeadings,
  onSync,
  onParallel,
  onHeadings,
  onNavigateHome
}: ReaderToolbarProps) {
  return (
    <div className="reader-toolbar">
      {onNavigateHome && (
        <button
          className="toolbar-button back-home-toolbar-btn"
          onClick={onNavigateHome}
          type="button"
          title="Return to home page"
          aria-label="Return to home page"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Home</span>
        </button>
      )}
      <div className="toolbar-actions">
        <button
          className={`toolbar-button ${showHeadings ? "active" : ""}`}
          onClick={onHeadings}
          type="button"
        >
          <span className="dot" />
          Headings
        </button>
        <button
          className={`toolbar-button ${sync ? "active" : ""}`}
          onClick={onSync}
          type="button"
        >
          <span className="dot" />
          Sync
        </button>
        <button
          className={`toolbar-button ${parallel ? "active" : ""}`}
          onClick={onParallel}
          type="button"
        >
          <span className="dot" />
          Parallel
        </button>
      </div>
    </div>
  );
}
